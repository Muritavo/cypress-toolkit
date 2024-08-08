import {
  deployContract,
  deployGraph,
  startBlockchain,
  stopBlockchain,
} from "@muritavo/testing-toolkit/dist/native/blockchain";
import { createRequire } from "module";
const { pick } = createRequire(import.meta.url)("lodash");

export async function startBlockchainTask({
  projectRootFolder,
  port = 8545,
  graphqlProject,
}: NonNullable<Parameters<BlockchainOperations.Tasks["startBlockchain"]>[0]>) {
  return await startBlockchain({ projectRootFolder, port, graphqlProject });
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

async function deployGraphTask({
  contractAddresses,
  graphFolderPath,
  graphDeployName,
  networkName,
}: Parameters<Cypress.Tasks["deployGraph"]>[0]) {
  await deployGraph(
    graphFolderPath,
    contractAddresses,
    graphDeployName,
    networkName
  );
  return null;
}

async function stopBlockchainTask() {
  await stopBlockchain();

  return null;
}

export function setupBlockchainTasks(on: Cypress.PluginEvents) {
  on("task", {
    startBlockchain: startBlockchainTask,
    deployContract: deployContractTask,
    deployGraph: deployGraphTask,
    stopBlockchain: stopBlockchainTask,
  } as unknown as Cypress.Tasks);
}
