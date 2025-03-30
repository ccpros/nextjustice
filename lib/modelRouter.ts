export function selectModelByTask(task: string): string {
    switch (task) {
      case "summarize":
      case "memory-trim":
        return "llama3-8b-8192"; // Fast + efficient summarization
  
      case "deep-analysis":
      case "legal-logic":
        return "deepseek-chat"; // Optional, for smart reasoning
  
      case "chat":
      case "default":
      default:
        return "qwen-qwq-32b"; // Sydney's default convo model
    }
  }
  