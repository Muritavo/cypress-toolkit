/**
 * This is used to document the tasks interfaces
 */

export type TasksArgs = {
  /**
   * Task for starting a emulator
   */
  StartEmulatorTask: {
    projectId: string;
    databaseToImport?: string;
    UIPort: number;
    suiteId: string;
    ports: number[];
    shouldSaveData: boolean;
    only:
      | ("functions" | "hosting" | "firestore" | "storage" | "auth")[]
      | string[];
  };

  /**
   * Task for reading a file that possible doesn't exists
   */
  readFileMaybe: {
    filepath: string,
    encoding?: BufferEncoding
  }
};
