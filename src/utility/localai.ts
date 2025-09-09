
function buildQwenPrompt(
  messages: { content: string; role: "system" | "user" | "assistant" }[]
) {
  return (
    messages
      .map((msg) => {
        return `<|${msg.role}|>\n${msg.content.trim()}`;
      })
      .join("\n") + "\n<|assistant|>"
  );
}

export function buildPrompt(
  system: string,
  _request: string,
  training: readonly (readonly [
    trainingRequest: string,
    trainingAnswer: string
  ])[] = [],
  restrictions?: string,
  model: "llama" | "qwen" = "llama",
  thinking: boolean = false
) {
  const suffix = restrictions ? `\n${restrictions}` : "";
  const request = _request.trim();
  if (model === "qwen")
    return buildQwenPrompt([
      {
        role: "system",
        content: `${system} ${thinking ? "/think" : "/no_think"}`,
      },
      ...training
        .map(([user, assistant]) => [
          { role: "user" as const, content: user + suffix },
          { role: "assistant" as const, content: assistant },
        ])
        .reduce((acc, msgs) => [...acc, ...msgs], []),
      { role: "user" as const, content: request + suffix },
    ]);
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
