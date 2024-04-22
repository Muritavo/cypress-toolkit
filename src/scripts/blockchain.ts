import debug from "debug";
import { TASK_NODE_SERVER_READY } from "hardhat/builtin-tasks/task-names";
import {
  deployContract,
  startBlockchain,
} from "@muritavo/testing-toolkit/dist/native/blockchain";
import { createRequire } from "module";
const { pick } = createRequire(import.meta.url)("lodash");
const logger = debug("cypress-toolkit/blockchain");

// This register the tasks for deploying a hardhat blockchain
type Addresses = {
  [address: string]: {
    balance: number;
    unlocked: number;
    secretKey: string;
  };
};

export async function startBlockchainTask({
  projectRootFolder,
  port = 8545,
}: NonNullable<Parameters<BlockchainOperations.Tasks["startBlockchain"]>[0]>) {
  return await startBlockchain({ projectRootFolder, port });
}

async function deployContractTask({
  contractName,
  args,
}: {
  contractName: string;
  args: any[];
}) {
  const deployed = await deployContract({
    contractAbi: [],
    contractName,
    args,
  });
  return pick(deployed, "address", "owner");
}

export function setupBlockchainTasks(on: Cypress.PluginEvents) {
  on("task", {
    startBlockchain: startBlockchainTask,
    deployContract: deployContractTask,
  } as unknown as Cypress.Tasks);
}
