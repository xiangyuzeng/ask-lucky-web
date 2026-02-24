export function generateFollowUpSuggestions(
  lastMessage: string,
  department: string,
): string[] {
  const suggestions: string[] = [];
  const lowerMessage = lastMessage.toLowerCase();

  // Generic follow-ups based on content patterns
  if (
    lowerMessage.includes("report") ||
    lowerMessage.includes("data") ||
    lowerMessage.includes("analysis")
  ) {
    suggestions.push("Can you break this down by region?");
    suggestions.push("Show me the trend over the last 6 months");
    suggestions.push("Export this as a CSV");
  }

  if (lowerMessage.includes("error") || lowerMessage.includes("issue")) {
    suggestions.push("What caused this issue?");
    suggestions.push("How can we prevent this in the future?");
    suggestions.push("Show me similar incidents");
  }

  if (lowerMessage.includes("performance") || lowerMessage.includes("metric")) {
    suggestions.push("Compare this to last quarter");
    suggestions.push("What's driving these numbers?");
    suggestions.push("Show me the top performers");
  }

  // Department-specific suggestions
  switch (department) {
    case "marketing":
      if (suggestions.length < 3) {
        suggestions.push("What's the ROI on this campaign?");
        suggestions.push("Show customer acquisition cost trends");
      }
      break;
    case "accounting":
      if (suggestions.length < 3) {
        suggestions.push("Show the budget variance");
        suggestions.push("What are the outstanding receivables?");
      }
      break;
    case "devops":
      if (suggestions.length < 3) {
        suggestions.push("Show system resource utilization");
        suggestions.push("List recent deployments");
      }
      break;
    case "product":
      if (suggestions.length < 3) {
        suggestions.push("What's the feature adoption rate?");
        suggestions.push("Show user retention metrics");
      }
      break;
    case "supplyChain":
      if (suggestions.length < 3) {
        suggestions.push("Check inventory levels");
        suggestions.push("Show supplier performance scores");
      }
      break;
    case "executive":
      if (suggestions.length < 3) {
        suggestions.push("Summarize key takeaways");
        suggestions.push("What are the main risks?");
      }
      break;
  }

  // Fallback suggestions
  if (suggestions.length === 0) {
    suggestions.push("Tell me more about this");
    suggestions.push("What are the next steps?");
    suggestions.push("Can you provide more details?");
  }

  return suggestions.slice(0, 3);
}
