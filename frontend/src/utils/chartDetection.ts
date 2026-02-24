export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export type ChartType = "line" | "bar" | "pie" | "area";

interface DetectionResult {
  isChartData: boolean;
  chartType: ChartType;
  data: ChartData | null;
}

export function detectChartData(content: string): DetectionResult {
  const lines = content.trim().split("\n");

  // Try to detect markdown table
  const tableMatch = detectMarkdownTable(lines);
  if (tableMatch.isChartData) {
    return tableMatch;
  }

  // Try to detect CSV-like data
  const csvMatch = detectCSVData(lines);
  if (csvMatch.isChartData) {
    return csvMatch;
  }

  return { isChartData: false, chartType: "bar", data: null };
}

function detectMarkdownTable(lines: string[]): DetectionResult {
  // Find table header and separator
  const headerIndex = lines.findIndex(
    (line) => line.includes("|") && !line.match(/^\s*\|?\s*[-:]+\s*\|/),
  );
  const separatorIndex = lines.findIndex((line) =>
    line.match(/^\s*\|?\s*[-:]+\s*\|/),
  );

  if (headerIndex === -1 || separatorIndex === -1) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const headerLine = lines[headerIndex];
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h);

  // Need at least 2 columns (label + value)
  if (headers.length < 2) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const dataLines = lines.slice(separatorIndex + 1).filter((line) => {
    const trimmed = line.trim();
    return trimmed && trimmed.includes("|") && !trimmed.match(/^\s*[-:]+\s*$/);
  });

  if (dataLines.length < 2) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const labels: string[] = [];
  const datasets: { label: string; data: number[] }[] = [];

  // Initialize datasets for numeric columns
  headers.slice(1).forEach((header) => {
    datasets.push({ label: header, data: [] });
  });

  let hasNumericData = false;

  for (const line of dataLines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c);
    if (cells.length < 2) continue;

    labels.push(cells[0]);

    cells.slice(1).forEach((cell, idx) => {
      const num = parseNumber(cell);
      if (!isNaN(num) && datasets[idx]) {
        datasets[idx].data.push(num);
        hasNumericData = true;
      }
    });
  }

  if (!hasNumericData || labels.length < 2) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const chartType = inferChartType(labels, datasets);

  return {
    isChartData: true,
    chartType,
    data: { labels, datasets },
  };
}

function detectCSVData(lines: string[]): DetectionResult {
  const dataLines = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed && (trimmed.includes(",") || trimmed.includes("\t"));
  });

  if (dataLines.length < 3) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const delimiter = dataLines[0].includes("\t") ? "\t" : ",";
  const headers = dataLines[0].split(delimiter).map((h) => h.trim());

  if (headers.length < 2) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const labels: string[] = [];
  const datasets: { label: string; data: number[] }[] = [];

  headers.slice(1).forEach((header) => {
    datasets.push({ label: header, data: [] });
  });

  let hasNumericData = false;

  for (let i = 1; i < dataLines.length; i++) {
    const cells = dataLines[i].split(delimiter).map((c) => c.trim());
    if (cells.length < 2) continue;

    labels.push(cells[0]);

    cells.slice(1).forEach((cell, idx) => {
      const num = parseNumber(cell);
      if (!isNaN(num) && datasets[idx]) {
        datasets[idx].data.push(num);
        hasNumericData = true;
      }
    });
  }

  if (!hasNumericData || labels.length < 2) {
    return { isChartData: false, chartType: "bar", data: null };
  }

  const chartType = inferChartType(labels, datasets);

  return {
    isChartData: true,
    chartType,
    data: { labels, datasets },
  };
}

function parseNumber(value: string): number {
  // Remove currency symbols, commas, percentages
  const cleaned = value.replace(/[$€¥£,]/g, "").replace(/%$/, "");
  return parseFloat(cleaned);
}

function inferChartType(
  labels: string[],
  datasets: { label: string; data: number[] }[],
): ChartType {
  // If labels look like dates/times, use line chart
  const datePatterns = [
    /^\d{4}[-/]\d{2}[-/]\d{2}$/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/,
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
    /^Q[1-4]\s*\d{4}$/i,
    /^\d{4}$/,
    /^Week\s*\d+$/i,
  ];

  const looksLikeTimeSeries = labels.some((label) =>
    datePatterns.some((pattern) => pattern.test(label)),
  );

  if (looksLikeTimeSeries) {
    return "line";
  }

  // If only one dataset with few items, pie chart might work
  if (datasets.length === 1 && labels.length <= 8) {
    const allPositive = datasets[0].data.every((d) => d >= 0);
    if (allPositive) {
      return "pie";
    }
  }

  // Default to bar chart
  return "bar";
}
