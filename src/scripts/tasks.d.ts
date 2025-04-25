/**
 * This is used to document the tasks interfaces
 */

export type TasksArgs = {
  /**
   * Task for starting a emulator
   */
  StartEmulatorTask: Parameters<
    typeof import("@muritavo/testing-toolkit/dist/native/emulator")["startEmulator"]
  >[0];

  /**
   * Task for reading a file that possible doesn't exists
   */
  readFileMaybe: {
    filepath: string;
    encoding?: BufferEncoding;
  };

  registerEmulator: Parameters<
    typeof import("@muritavo/testing-toolkit/dist/native/emulator")["registerEmulator"]
  >[0];
};
