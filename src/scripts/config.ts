import setupVisualTesting from "./augmentation/visual-testing";

export default function config(on: any, config: any) {
    require('@cypress/code-coverage/task')(on, config)
    setupVisualTesting(on, config);
}