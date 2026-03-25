import Web3 from "web3";
import { GenericContract } from "../../types/contract";
import { LOCALHOST_DOMAIN } from "../consts.js";
import { execTask } from "./augmentation/cypress.js";
import {
  invokeContract,
  setPort,
} from "@muritavo/testing-toolkit/dist/client/blockchain.js";
import { addCommand } from "./_shared/register";

export { setPort };

let web3: Web3;
let blockchainInfoContext: {
  wallets: BlockchainOperations.BlockchainWallets;
  contracts: {
    [s in string]: BlockchainOperations.BlockchainContract<any>;
  };
} = {
  wallets: {},
  contracts: {},
};

function getWeb3() {
  if (web3) return web3;
  else return (web3 = new Web3(`ws://${LOCALHOST_DOMAIN}:${8545}`));
}

addCommand(
  "bindToBlockchain",
  "Bind to a blockchain instance for testing. Takes projectRootFolder, port, graphqlProject, deployTags, forkToNumber",
  { prevSubject: false },
  ({ projectRootFolder, port, graphqlProject, deployTags, forkToNumber }) => {
    return execTask(
      "bindToBlockchain",
      { projectRootFolder, port, graphqlProject, deployTags, forkToNumber },
      {
        log: false,
      },
    ).then((wallets) => {
      blockchainInfoContext.wallets = wallets;
      setPort(port);
      getWeb3();
      for (let wallet of Object.keys(wallets)) {
        web3.eth.accounts.wallet.add({
          address: wallet,
          privateKey: wallets[wallet].secretKey,
        });
      }
      return blockchainInfoContext;
    });
  },
);

addCommand(
  "startBlockchain",
  "Start a blockchain instance for testing. Takes projectRootFolder, port, graphqlProject, forkToNumber",
  { prevSubject: false },
  function ({ projectRootFolder, port = 8545, graphqlProject, forkToNumber }) {
    return execTask(
      "startBlockchain",
      { projectRootFolder, port, graphqlProject, forkToNumber },
      {
        log: false,
      },
    ).then((wallets) => {
      blockchainInfoContext.wallets = wallets;
      setPort(port);
      getWeb3();
      for (let wallet of Object.keys(wallets)) {
        web3.eth.accounts.wallet.add({
          address: wallet,
          privateKey: wallets[wallet].secretKey,
        });
      }
      return blockchainInfoContext;
    });
  },
);

function contractNameOrCustomName(
  _contractName: string | readonly [contractName: string, saveAs: string],
) {
  const [contractName, saveAs] =
    typeof _contractName === "string"
      ? [_contractName, _contractName]
      : _contractName;

  return [contractName, saveAs];
}

addCommand(
  "registerContract",
  "Register a smart contract with the blockchain context. Takes address, contractName, abi, and initialization args",
  { prevSubject: false },
  (address, _contractName, abi, ...args) => {
    const [contractName, saveAs] = contractNameOrCustomName(_contractName);
    const contracts = blockchainInfoContext.contracts;
    if (contracts[contractName]) return blockchainInfoContext as any;
    (contracts as any)[saveAs] = {
      address: address.toLowerCase(),
      contract: new (getWeb3().eth.Contract)(abi as any, address),
    };
    return blockchainInfoContext as any;
  },
);

addCommand(
  "deployContract",
  "Deploy a smart contract to the blockchain. Takes contractName, abi, and initialization args",
  { prevSubject: false },
  function deploy(_contractName, abi, ...args) {
    const [contractName, saveAs] = contractNameOrCustomName(_contractName);
    const contracts = blockchainInfoContext.contracts;
    if (contracts[contractName]) return blockchainInfoContext as any;
    return execTask(
      "deployContract",
      {
        contractName,
        args: args.map((a) => (typeof a === "function" ? a(contracts) : a)),
      },
      {
        log: false,
      },
    ).then(({ address }) => {
      (contracts as any)[saveAs] = {
        address: address.toLowerCase(),
        contract: new web3.eth.Contract(abi as any, address),
      };
      return blockchainInfoContext as any;
    });
  },
);

addCommand(
  "invokeContract",
  "Invoke a method on a deployed smart contract. Takes wallet, contractName, method, and parameters",
  { prevSubject: false },
  (walletOrFn, contractName, contractMethod, ...args: any[]) => {
    const ctx = blockchainInfoContext;
    const wallet =
      typeof walletOrFn === "string"
        ? walletOrFn
        : typeof walletOrFn === "object"
          ? walletOrFn
          : walletOrFn(ctx.contracts, ctx.wallets);
    const contract: GenericContract<any> =
      ctx.contracts[contractName as string].contract;
    return cy.then(
      { timeout: 120000 },
      () =>
        new Cypress.Promise<any>(async (r, rej) => {
          (invokeContract as any)(
            wallet,
            contract,
            contractMethod,
            ...args.map((a: (() => any) | any) =>
              typeof a === "function" ? a(ctx.contracts) : a,
            ),
          )
            .then((result: any | undefined) => r(result ?? ctx))
            .catch((e: any) => rej(e));
        }),
    );
  },
);

addCommand(
  "deployGraph",
  "Deploy a Graph protocol subgraph. Takes graphFolderPath, contractAddresses, graphName, networkName",
  { prevSubject: false },
  (graphFolderPath: string, contractAddresses, graphName, networkName) => {
    return execTask("deployGraph", {
      graphFolderPath,
      contractAddresses,
      graphDeployName: graphName,
      networkName,
    });
  },
);

addCommand(
  "impersonateAccount",
  "Impersonate an account on the blockchain. Takes account address",
  { prevSubject: false },
  (account: string) => {
    return execTask("impersonateAccount", account);
  },
);

addCommand(
  "updateBlockchainSnapshot",
  "Update the current blockchain snapshot. No parameters",
  { prevSubject: false },
  () => {
    return execTask("updateBlockchainSnapshot");
  },
);

addCommand(
  "createBlockchainSnapshot",
  "Create a new blockchain snapshot for state backup. No parameters",
  { prevSubject: false },
  () => {
    return execTask("createSnapshot");
  },
);

addCommand(
  "restoreBlockchainSnapshot",
  "Restore the blockchain state from a snapshot. Takes snapshotId",
  { prevSubject: false },
  (snapshotId) => {
    return execTask("restoreSnapshot", snapshotId);
  },
);

addCommand(
  "blockchainContext",
  "Get the current blockchain context including wallets and contracts. No parameters",
  { prevSubject: false },
  () => {
    return blockchainInfoContext as any;
  },
);

afterEach(() => {
  blockchainInfoContext.contracts = {};
  cy.execTask("scheduleStopBlockchain");
});
