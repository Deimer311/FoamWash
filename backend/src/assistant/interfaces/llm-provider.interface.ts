export interface ILlmProvider {
  generateStructuredResponse<T>(
    systemPrompt: string,
    userPrompt: string,
    jsonSchema?: object,
  ): Promise<T>;
}
