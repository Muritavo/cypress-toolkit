/**
 * This is used to document the tasks interfaces
 */

export type TasksArgs = {
    /**
     * Task for starting a emulator
     */
    StartEmulatorTask: {
        projectId: string,
        databaseToImport?: string,
        UIPort: number
    }
}