export function buildPrompt(
  system: string,
  _request: string,
  training: readonly (readonly [
    trainingRequest: string,
    trainingAnswer: string
  ])[] = [],
  restrictions?: string
) {
  const suffix = restrictions ? `\n${restrictions}` : "";
  const request = _request.trim();
  const prompt = `<s>[INST]<<SYS>>\n${system}\n<</SYS>>\n${
    !training.length
      ? `${request}${suffix} [/INST]`
      : training.reduce(
          (end, [request, answer], i, { length }) =>
            `${
              i < length - 1 ? "<s>[INST] " : ""
            }${request}${suffix} [/INST] ${answer} </s>${end}`,
          `<s>[INST] ${request}${suffix} [/INST] `
        )
  }`;

  return prompt;
}
