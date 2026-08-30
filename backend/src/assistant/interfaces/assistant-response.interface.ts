export interface AssistantResponse {
  action: 'NAVIGATE' | 'ANSWER' | 'CONFIRM_CRITICAL_ACTION';
  targetPath: string | null;
  spokenMessage: string;
  screenSummary: string | null;
}
