import { convertToYaml } from "./openApiSpec";

export type ExportFormat = "yaml" | "json" | "html" | "markdown";

export const exportOpenApiSpec = (spec: object, format: ExportFormat, htmlContent?: string) => {
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case "json":
      content = JSON.stringify(spec, null, 2);
      filename = "openapi-spec.json";
      mimeType = "application/json";
      break;
    case "html":
      if (!htmlContent) {
        throw new Error("HTML content is required for HTML export");
      }
      content = htmlContent;
      filename = "api-documentation.html";
      mimeType = "text/html";
      break;
    case "markdown":
      // Markdown will be generated on backend
      content = "";
      filename = "api-documentation.md";
      mimeType = "text/markdown";
      break;
    default:
      content = convertToYaml(spec as any);
      filename = "openapi-spec.yaml";
      mimeType = "text/yaml";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
