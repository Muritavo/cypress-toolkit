import {
  deployContract,
  deployGraph,
  startBlockchain,
  stopBlockchain,
  blockchainLogger,
  bindToBlockchain,
  impersonateAccount,
  updateSnapshot,
  restoreSnapshot,
  createSnapshot,
} from "@muritavo/testing-toolkit/dist/native/blockchain";
import { createRequire } from "module";
const { pick } = createRequire(import.meta.url)("lodash");

let stopBlockchainTimer: NodeJS.Timeout | undefined;

export async function startBlockchainTask({
  projectRootFolder,
  port = 8545,
  graphqlProject,
  deployTags
}: NonNullable<Parameters<BlockchainOperations.Tasks["startBlockchain"]>[0]>) {
  if (stopBlockchainTimer) {
    clearTimeout(stopBlockchainTimer);
    stopBlockchainTimer = undefined;
  }
  return await startBlockchain({ projectRootFolder, port, graphqlProject, deployTags });
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

async function scheduleStopBlockchainTask() {
  blockchainLogger("The blockchain will stop if no tests are run");
  if (stopBlockchainTimer) clearTimeout(stopBlockchainTimer);
  stopBlockchainTimer = setTimeout(() => {
    blockchainLogger("Stopping blockchain");
    stopBlockchain();
    stopBlockchainTimer = undefined;
  }, 1000 * 60 * 30);

  return null;
}

export function setupBlockchainTasks(on: Cypress.PluginEvents) {
  on("task", {
    startBlockchain: startBlockchainTask,
    deployContract: deployContractTask,
    deployGraph: deployGraphTask,
    scheduleStopBlockchain: scheduleStopBlockchainTask,
    bindToBlockchain: (props) =>
      bindToBlockchain({
        projectFolder: props.projectRootFolder,
        graphqlProject: props.graphqlProject,
        hardhatConfigImportPromiseFactory: async () => {
          const a = await import(`${props.projectRootFolder}/hardhat.config.ts`)
            .then((m) => m.default)
            .then((m) => ("default" in m ? m.default : m));
          return a;
        },
        port: props.port,
        deployTags: props.deployTags,
      }),
    impersonateAccount: (account) =>
      impersonateAccount(account).then(() => null),
    updateBlockchainSnapshot: () => updateSnapshot().then(() => null),
    restoreSnapshot(snapshotId) {
      return restoreSnapshot(snapshotId)
    },
    createSnapshot() {
      return createSnapshot()
    },
  } satisfies BlockchainOperations.Tasks as Cypress.Tasks);
}
