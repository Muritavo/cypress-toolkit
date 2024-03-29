import Web3 from "web3";
import { GenericContract } from "../../types/contract";
import { LOCALHOST_DOMAIN } from "../consts";
import { execTask } from "./augmentation/cypress";

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
  function ({ projectRootFolder, port = 8545, deterministic } = {}) {
    return execTask(
      "startBlockchain",
      { projectRootFolder, port, deterministic },
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
  function invoke(
    walletOrFn,
    contractName,
    contractMethodName,
    ...params: any[]
  ) {
    const ctx = blockchainInfoContext;
    const wallet =
      typeof walletOrFn === "string"
        ? walletOrFn
        : walletOrFn(ctx.contracts, ctx.wallets);
    const contract: GenericContract<any> =
      ctx.contracts[contractName as string].contract;
    const abiDefinition = (contract as any)._jsonInterface.find(
      (a: any) => a.name === contractMethodName
    );
    const state = abiDefinition.stateMutability;

    if (state === "view")
      return new Cypress.Promise((r) => {
        (contract.methods[contractMethodName as string] as any)(
          ...params.map((a) => (typeof a === "function" ? a(ctx.contracts) : a))
        )
          .call()
          .then((result: any) => r(result));
      });

    const call: any = (contract.methods[contractMethodName as string] as any)(
      ...params.map((a) => (typeof a === "function" ? a(ctx.contracts) : a))
    ).send({
      from: wallet,
      gas: 90000000,
      gasPrice: "90000000000",
    });
    return new Cypress.Promise<typeof ctx>(async (r, rej) => {
      const txHash = await new Promise<string>((r, rej) => {
        call.on("transactionHash", (tX: string) => {
          r(tX);
        });
        call.catch(rej);
      });
      while (true) {
        const transaction = await web3.eth.getTransactionReceipt(txHash);

        const isMined =
          !transaction ||
          !transaction.blockHash ||
          transaction.status === undefined
            ? undefined // I still don't know if it's loaded
            : !!transaction.status === true;
        if (isMined === undefined)
          await new Promise<void>((r) => setTimeout(() => r(), 2000));
        else {
          if (isMined) r(ctx);
          else rej(new Error(`Transaction failed, check the logs`));
          break;
        }
      }
    }) as any;
  }
);

afterEach(() => {
  blockchainInfoContext.contracts = {};
});
