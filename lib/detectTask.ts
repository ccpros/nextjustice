export function detectTaskFromInput(content: string): string {
    const input = content.toLowerCase();
  
    if (input.includes("summarize") || input.includes("summary")) {
      return "summarize";
    }
  
    if (input.includes("analyze") || input.includes("explain deeply")) {
      return "deep-analysis";
    }
  
    if (input.includes("legal") || input.includes("statute") || input.includes("court")) {
      return "legal-logic";
    }
  
    return "chat"; // default
  }
  