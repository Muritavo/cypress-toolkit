import Web3 from "web3";
import { GenericContract } from "../../types/contract";
import { LOCALHOST_DOMAIN } from "../consts";
import { execTask } from "./augmentation/cypress";
import {
  invokeContract,
  setPort,
} from "@muritavo/testing-toolkit/dist/client/blockchain";

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

Cypress.Commands.add(
  "bindToBlockchain",
  ({ projectRootFolder, port = 8545, graphqlProject, deployTags } = {}) => {
    return execTask(
      "bindToBlockchain",
      { projectRootFolder, port, graphqlProject, deployTags },
      {
        log: false,
      }
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
  }
);

Cypress.Commands.add(
  "startBlockchain",
  function ({ projectRootFolder, port = 8545, graphqlProject } = {}) {
    return execTask(
      "startBlockchain",
      { projectRootFolder, port, graphqlProject },
      {
        log: false,
      }
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
  }
);

function contractNameOrCustomName(
  _contractName: string | readonly [contractName: string, saveAs: string]
) {
  const [contractName, saveAs] =
    typeof _contractName === "string"
      ? [_contractName, _contractName]
      : _contractName;

  return [contractName, saveAs];
}

Cypress.Commands.add(
  "registerContract",
  (address, _contractName, abi, ...args) => {
    const [contractName, saveAs] = contractNameOrCustomName(_contractName);
    const contracts = blockchainInfoContext.contracts;
    if (contracts[contractName]) return blockchainInfoContext as any;
    (contracts as any)[saveAs] = {
      address: address.toLowerCase(),
      contract: new (getWeb3().eth.Contract)(abi as any, address),
    };
    return blockchainInfoContext as any;
  }
);

Cypress.Commands.add(
  "deployContract",
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
      }
    ).then(({ address }) => {
      (contracts as any)[saveAs] = {
        address: address.toLowerCase(),
        contract: new web3.eth.Contract(abi as any, address),
      };
      return blockchainInfoContext as any;
    });
  }
);

Cypress.Commands.add(
  "invokeContract",
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
              typeof a === "function" ? a(ctx.contracts) : a
            )
          )
            .then((result: any | undefined) => r(result ?? ctx))
            .catch((e: any) => rej(e));
        })
    );
  }
);

Cypress.Commands.add(
  "deployGraph",
  (graphFolderPath: string, contractAddresses, graphName, networkName) => {
    return execTask("deployGraph", {
      graphFolderPath,
      contractAddresses,
      graphDeployName: graphName,
      networkName,
    });
  }
);

Cypress.Commands.add("impersonateAccount", (account: string) => {
  return execTask("impersonateAccount", account);
});

Cypress.Commands.add("blockchainContext", () => {
  return blockchainInfoContext as any;
});

afterEach(() => {
  blockchainInfoContext.contracts = {};
  cy.execTask("scheduleStopBlockchain");
});
