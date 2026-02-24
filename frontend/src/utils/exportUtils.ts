import type { ChatMessage } from "../types";

export async function exportToPDF(
  messages: ChatMessage[],
  title: string,
): Promise<void> {
  // Dynamic import to avoid loading heavy libraries upfront
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");

  const content = document.getElementById("chat-messages");
  if (!content) return;

  const canvas = await html2canvas(content, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

export function exportToMarkdown(
  messages: ChatMessage[],
  title: string,
): string {
  let markdown = `# ${title}\n\n`;
  markdown += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

  for (const msg of messages) {
    if (msg.type !== "chat") continue;

    const role = msg.role === "user" ? "**User**" : "**Assistant**";
    markdown += `${role}:\n\n${msg.content}\n\n---\n\n`;
  }

  return markdown;
}

export function exportToSlack(messages: ChatMessage[]): string {
  let slack = "";

  for (const msg of messages) {
    if (msg.type !== "chat") continue;

    const emoji = msg.role === "user" ? ":bust_in_silhouette:" : ":robot_face:";
    slack += `${emoji} *${msg.role === "user" ? "User" : "Assistant"}*\n`;
    slack += `${msg.content}\n\n`;
  }

  return slack;
}

export function exportToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        const stringValue = String(value ?? "");
        // Escape quotes and wrap in quotes if contains comma or newline
        if (
          stringValue.includes(",") ||
          stringValue.includes("\n") ||
          stringValue.includes('"')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
