declare namespace AIOperations {
  interface Commands<A extends any = any> {
    /**
     * This interfaces with chatgpt compatible api to generate images. It also caches them so you don't need to call the service everytime
     * @param model One of the available models
     * @param prompt The prompt to be sent
     * @param subdir A subdirectory to store this image into. You can use this to organize multiple images and manually change them
     */
    generateImage(
      model: string,
      prompt: string,
      resolution: readonly [width: number, height: number],
      subdir?: string
    ): Cypress.Chainable<string>;

    /**
     * This implements a logic that generates a prompt ready for llama instruction calls.
     * Take the explanations for each argument with a grain of salt.
     * They are described based on my personal experience and may not be so efficient.
     *
     * @param model The model to use
     * @param system This setups the system. Here you should describe what globally it can do and behave as.
     * @param prompt Your prompt/request.
     * @param training Here you will pass example request/response to fine tune the model. For example, it can be used to guide to a response template format.
     * @param suffix OPTIONAL I like to work with this to define how my prompt should return and fix little mistakes the model will be making. If provided, it will simply concatenate to the end of the prompt and traning prompts
     * @param subdir A subdirectory to store this response. You can use this to organize multiple requests and manually change them
     */
    promptLlama(
      model: string,
      system: string,
      prompt: string,
      training: readonly (readonly [prompt: string, answer: string])[],
      suffix?: string,
      folder?: string,
      max_tokens?: number
    ): Cypress.Chainable<string>;
  }
}
