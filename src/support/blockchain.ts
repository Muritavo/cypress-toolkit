import Web3 from "web3";
import { GenericContract } from "../../types/contract";
import { LOCALHOST_DOMAIN } from "../consts";
import { execTask } from "./augmentation/cypress";
import { invokeContract } from "@muritavo/testing-toolkit/dist/client/blockchain";
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

Cypress.Commands.add(
  "startBlockchain",
  function ({ projectRootFolder, port = 8545 } = {}) {
    return execTask(
      "startBlockchain",
      { projectRootFolder, port },
      {
        log: false,
      }
    ).then((wallets) => {
      blockchainInfoContext.wallets = wallets;
      web3 = new Web3(`ws://${LOCALHOST_DOMAIN}:${port}`);
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
  "deployContract",
  function deploy(_contractName, abi, ...args) {
    const [contractName, saveAs] =
      typeof _contractName === "string"
        ? [_contractName, _contractName]
        : _contractName;
    const ctx = this;
    const contracts = (ctx.contracts =
      ctx.contracts || blockchainInfoContext.contracts);
    if (contracts[contractName]) return ctx as any;
    return execTask(
      "deployContract",
      {
        contractName,
        args: args.map((a) => (typeof a === "function" ? a(contracts) : a)),
      },
      {
        log: false,
      }
    ).then(({ address, owner }) => {
      contracts[saveAs] = {
        address: address.toLowerCase(),
        owner: owner.toLowerCase(),
        contract: new web3.eth.Contract(abi as any, address),
      };
      return ctx as any;
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
        : walletOrFn(ctx.contracts, ctx.wallets);
    const contract: GenericContract<any> =
      ctx.contracts[contractName as string].contract;
    return cy.then(
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

afterEach(() => {
  blockchainInfoContext.contracts = {};
});
