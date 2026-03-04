const Documentation = require("../../models/Documentation");
const ExportLog = require("../../models/ExportLog");
const YAML = require("yaml");

/**
 * Buat Export ya
 * Supports: JSON, YAML, Markdown, HTML
 */
exports.exportDocs = async (req, res) => {
  const { id, format } = req.params;

  try {
    const doc = await Documentation.findById(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Dokumen tidak ditemukan",
      });
    }

    // Check ownership
    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke dokumen ini",
      });
    }

    const spec = doc.openApiSpec;
    const formatLower = format.toLowerCase();

    let content, contentType, filename;

    switch (formatLower) {
      case "json":
        content = JSON.stringify(spec, null, 2);
        contentType = "application/json";
        filename = `${sanitizeFilename(doc.projectName)}.json`;
        break;

      case "yaml":
      case "yml":
        content = YAML.stringify(spec);
        contentType = "text/yaml";
        filename = `${sanitizeFilename(doc.projectName)}.yaml`;
        break;

      case "markdown":
      case "md":
        content = generateMarkdown(spec, doc);
        contentType = "text/markdown";
        filename = `${sanitizeFilename(doc.projectName)}.md`;
        break;

      case "html":
        // Use HTML content from request body if provided (from frontend preview)
        // This ensures exported HTML matches the preview exactly
        if (req.body && req.body.htmlContent) {
          content = req.body.htmlContent;
        } else {
          // Fallback to backend generation if no content provided
          content = generateHTML(spec, doc);
        }
        contentType = "text/html";
        filename = `${sanitizeFilename(doc.projectName)}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Format tidak didukung. Gunakan: json, yaml, markdown, atau html",
        });
    }

    // Log export with user ID
    await ExportLog.create({
      userId: req.user._id,
      docId: doc._id,
      format: format.toUpperCase(),
    });

    // Set headers untuk download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error("Error in exportDocs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Generate Markdown documentation
 */
function generateMarkdown(spec, doc) {
  let md = `# ${spec.info.title}\n\n`;
  md += `**Version:** ${spec.info.version}\n\n`;

  if (spec.info.description) {
    md += `## Description\n\n${spec.info.description}\n\n`;
  }

  if (doc.qualityMetrics) {
    md += `## Quality Score\n\n`;
    md += `- **Score:** ${doc.qualityMetrics.score}/100 (${doc.qualityMetrics.grade || "N/A"})\n`;
    md += `- **Summary:** ${doc.qualityMetrics.summary}\n\n`;
  }

  // Servers
  if (spec.servers && spec.servers.length > 0) {
    md += `## Servers\n\n`;
    spec.servers.forEach((server) => {
      md += `- **${server.description || "Server"}:** \`${server.url}\`\n`;
    });
    md += `\n`;
  }

  // Endpoints grouped by tags
  const groupedPaths = groupPathsByTag(spec.paths);

  Object.entries(groupedPaths).forEach(([tag, paths]) => {
    md += `## ${tag}\n\n`;

    paths.forEach(({ path, method, operation }) => {
      md += `### ${method.toUpperCase()} ${path}\n\n`;

      if (operation.summary) {
        md += `**Summary:** ${operation.summary}\n\n`;
      }

      if (operation.description) {
        md += `${operation.description}\n\n`;
      }

      // Parameters
      if (operation.parameters && operation.parameters.length > 0) {
        md += `**Parameters:**\n\n`;
        md += `| Name | Location | Type | Required | Description |\n`;
        md += `|------|----------|------|----------|-------------|\n`;
        operation.parameters.forEach((param) => {
          md += `| ${param.name} | ${param.in} | ${param.schema?.type || "string"} | ${param.required ? "Yes" : "No"} | ${param.description || "-"} |\n`;
        });
        md += `\n`;
      }

      // Request Body
      if (operation.requestBody) {
        md += `**Request Body:**\n\n`;
        md += `\`\`\`json\n`;
        const example = operation.requestBody.content?.["application/json"]?.example;
        md += JSON.stringify(example || { example: "Request body" }, null, 2);
        md += `\n\`\`\`\n\n`;
      }

      // Responses
      if (operation.responses) {
        md += `**Responses:**\n\n`;
        Object.entries(operation.responses).forEach(([code, response]) => {
          md += `- **${code}:** ${response.description || "Response"}\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });
  });

  return md;
}

/**
 * Generate HTML documentation
 */
function generateHTML(spec, doc) {
  const grouped = groupPathsByTag(spec.paths);

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.info.title} - API Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6; 
      color: #333; 
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 40px 20px; 
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .version { 
      display: inline-block;
      background: rgba(255,255,255,0.2); 
      padding: 5px 15px; 
      border-radius: 20px;
      font-size: 0.9rem;
      margin-left: 10px;
    }
    .description { margin-top: 15px; font-size: 1.1rem; opacity: 0.9; }
    .quality-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      margin-top: 15px;
      font-weight: 600;
    }
    .section { 
      background: white; 
      margin-bottom: 20px; 
      padding: 25px; 
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .section h2 { 
      color: #667eea; 
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    .endpoint { 
      border-left: 4px solid #667eea;
      padding: 15px;
      margin-bottom: 20px;
      background: #f9fafb;
      border-radius: 4px;
    }
    .endpoint-header { 
      display: flex; 
      align-items: center; 
      gap: 15px;
      margin-bottom: 10px;
    }
    .method { 
      padding: 5px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.85rem;
      text-transform: uppercase;
      min-width: 70px;
      text-align: center;
    }
    .method-get { background: #3b82f6; color: white; }
    .method-post { background: #10b981; color: white; }
    .method-put { background: #f59e0b; color: white; }
    .method-delete { background: #ef4444; color: white; }
    .method-patch { background: #8b5cf6; color: white; }
    .path { 
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      color: #1f2937;
    }
    .summary { color: #6b7280; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; }
    pre { 
      background: #1f2937; 
      color: #f3f4f6; 
      padding: 15px; 
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0;
    }
    .response-code {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: monospace;
    }
    .response-2xx { background: #d1fae5; color: #065f46; }
    .response-4xx { background: #fee2e2; color: #991b1b; }
    .response-5xx { background: #fef3c7; color: #92400e; }
    footer { 
      text-align: center; 
      padding: 30px; 
      color: #6b7280;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${spec.info.title} <span class="version">v${spec.info.version}</span></h1>
      ${spec.info.description ? `<p class="description">${spec.info.description}</p>` : ""}
      ${doc.qualityMetrics ? `<div class="quality-badge">Quality Score: ${doc.qualityMetrics.score}/100 (${doc.qualityMetrics.grade})</div>` : ""}
    </header>
    
    <main>`;

  Object.entries(grouped).forEach(([tag, paths]) => {
    html += `<div class="section">
      <h2>${tag}</h2>`;

    paths.forEach(({ path, method, operation }) => {
      html += `<div class="endpoint">
        <div class="endpoint-header">
          <span class="method method-${method.toLowerCase()}">${method}</span>
          <span class="path">${path}</span>
        </div>`;

      if (operation.summary) {
        html += `<div class="summary">${operation.summary}</div>`;
      }

      if (operation.description) {
        html += `<p>${operation.description}</p>`;
      }

      // Parameters
      if (operation.parameters && operation.parameters.length > 0) {
        html += `<h4>Parameters</h4>
        <table>
          <thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>`;
        operation.parameters.forEach((param) => {
          html += `<tr>
            <td><code>${param.name}</code></td>
            <td>${param.in}</td>
            <td>${param.schema?.type || "string"}</td>
            <td>${param.required ? "Yes" : "No"}</td>
            <td>${param.description || "-"}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }

      // Request Body
      if (operation.requestBody) {
        html += `<h4>Request Body</h4>
        <pre>${JSON.stringify(operation.requestBody.content?.["application/json"]?.example || {}, null, 2)}</pre>`;
      }

      // Responses
      if (operation.responses) {
        html += `<h4>Responses</h4>`;
        Object.entries(operation.responses).forEach(([code, response]) => {
          const codeClass = code.startsWith("2") ? "response-2xx" : code.startsWith("4") ? "response-4xx" : "response-5xx";
          html += `<p><span class="response-code ${codeClass}">${code}</span> ${response.description || "Response"}</p>`;
        });
      }

      html += `</div>`;
    });

    html += `</div>`;
  });

  html += `</main>
    
    <footer>
      <p>Generated by Spec2Docs • ${new Date().toLocaleDateString()}</p>
    </footer>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Group paths by tags for better organization
 */
function groupPathsByTag(paths) {
  const grouped = {};

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const tag = operation.tags?.[0] || "General";

      if (!grouped[tag]) {
        grouped[tag] = [];
      }

      grouped[tag].push({ path, method, operation });
    });
  });

  return grouped;
}

/**
 * Sanitize filename for safe file download
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
