import ganache from "ganache";
import debug from "debug";
const { server } = ganache;
const logger = debug("cypress-toolkit/blockchain");

// This register the tasks for deploying a hardhat blockchain
type Addresses = {
  [address: string]: {
    balance: number;
    unlocked: number;
    secretKey: string;
  };
};
let instance: {
  process: ReturnType<typeof server>;
  rootFolder?: string;
  contracts: {
    [id: string]: {
      address: string;
    };
  };
  addresses: Addresses;
} | null;

async function startBlockchain(projectFolder?: string) {
  if (instance) {
    return instance.addresses;
  }
  if (projectFolder) logger(`Starting blockchain server at "${projectFolder}"`);
  /**
   * This will start a hardhat node
   */
  const serverInstance = server({
    gasLimit: 99000000000000,
  });
  const accounts = await serverInstance.listen(15000).then(() => {
    return Object.entries(serverInstance.provider.getInitialAccounts()).reduce(
      (r, [k, v]) => ({
        ...r,
        [k]: {
          ...v,
          balance: Number(v.balance),
          unlocked: Number(v.unlocked),
        },
      }),
      {} as Addresses
    );
  });
  instance = {
    process: serverInstance,
    rootFolder: projectFolder,
    contracts: {},
    addresses: accounts,
  };
  return accounts;
}

function initHardhat(dir: string) {
  const startingDir = process.cwd();
  process.chdir(dir);
  const hardhat = require("hardhat");
  hardhat.network.provider = instance!.process.provider;
  process.chdir(startingDir);
  return hardhat;
}

async function deployContract({
  contractName,
  args,
}: {
  contractName: string;
  args: any[];
}) {
  logger(
    `Deploying contract ${contractName} with ${args.length} parameters ${args
      .map((a) => `${a} (${Array.isArray(a) ? "array" : typeof a})`)
      .join(", ")}`
  );
  try {
    if (!instance?.rootFolder)
      throw new Error(
        `You are trying to deploy a contract without defining the Blockchain Project folder. Please define it at startBlockchain command.`
      );
    const { ethers } = initHardhat(instance!.rootFolder);
    const [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory(contractName);
    const lock = await Factory.deploy();
    await lock.deployed();

    if (args.length > 0) {
      logger(`Initializing contract with owner ${owner} and args ${args}`);
      const connection = lock.connect(owner);
      const initializationKey =
        Object.keys(connection.functions).find(
          (a) => a.split(",", args.length) && a.startsWith("initialize(")
        ) || "initialize";
      if (connection[initializationKey])
        await connection[initializationKey](...args);
    }
    return {
      address: lock.address,
      owner: owner.address,
    };
  } catch (e) {
    logger(`Something has gone wrong`, e);
    throw e;
  }
}

export function setupBlockchainTasks(on: Cypress.PluginEvents) {
  on("task", {
    startBlockchain,
    deployContract,
  } as unknown as Cypress.Tasks);
}
