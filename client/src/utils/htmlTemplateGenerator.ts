// HTML Documentation Template Components
export interface ApiInfo {
  title: string;
  version: string;
  description: string;
  servers: Array<{ url: string; description: string }>;
}

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  description?: string;
  parameters?: Array<{
    name: string;
    in: string;
    type: string;
    description: string;
    required?: boolean;
  }>;
  requestBody?: {
    example: string;
  };
  responses?: Array<{
    code: string;
    description: string;
  }>;
}

export interface EndpointGroup {
  tag: string;
  icon: string;
  endpoints: Endpoint[];
}

export const generateHtmlStyles = () => `
  :root {
    --primary: #6366f1;
    --primary-light: #818cf8;
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --bg-dark: #0f0f23;
    --bg-card: #1a1a2e;
    --bg-secondary: #16213e;
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
    --border: #27272a;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    line-height: 1.6;
  }
  
  .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
  
  header {
    background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
    border-bottom: 1px solid var(--border);
    padding: 2rem 0;
    margin-bottom: 2rem;
  }
  
  .header-content { display: flex; align-items: flex-start; gap: 1.5rem; }
  
  .logo {
    width: 56px; height: 56px;
    background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  }
  
  .logo svg {
    width: 32px;
    height: 32px;
    color: white;
  }
  
  h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
  
  .version {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.75rem;
  }
  
  .description { color: var(--text-secondary); max-width: 700px; margin: 0.75rem 0; font-size: 0.95rem; }
  
  .servers { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
  
  .server-badge {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-family: 'Fira Code', monospace;
  }
  
  .ai-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15));
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    color: #fbbf24;
    margin-top: 1rem;
  }
  
  .section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  
  .section-header {
    background: var(--bg-secondary);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  
  .section-header h2 { font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
  
  .endpoint { border-bottom: 1px solid var(--border); }
  .endpoint:last-child { border-bottom: none; }
  
  .endpoint-header {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  
  .endpoint-header:hover { background: var(--bg-secondary); }
  .endpoint-header.expanded { background: var(--bg-secondary); }
  
  .endpoint-header::after {
    content: '▼';
    position: absolute;
    right: 1.5rem;
    font-size: 0.7rem;
    color: var(--text-secondary);
    transition: transform 0.2s;
  }
  
  .endpoint-header.expanded::after {
    transform: rotate(180deg);
  }
  
  .method {
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    min-width: 65px;
    text-align: center;
    font-family: 'Fira Code', monospace;
  }
  
  .method-get { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
  .method-post { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
  .method-put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  .method-delete { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
  .method-patch { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
  
  .path { font-family: 'Fira Code', monospace; font-size: 0.875rem; color: var(--text-primary); flex: 1; }
  .summary { color: var(--text-secondary); font-size: 0.875rem; margin-right: 2rem; }
  
  .endpoint-body {
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid var(--border);
    display: none;
    animation: slideDown 0.3s ease-out;
  }
  
  .endpoint-body.show {
    display: block;
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .endpoint-description { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.8; }
  
  .params-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  
  .params-table th {
    text-align: left; padding: 0.75rem;
    background: var(--bg-secondary);
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }
  
  .params-table td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
  }
  
  .param-name { font-family: 'Fira Code', monospace; color: var(--primary-light); font-size: 0.8rem; }
  .param-required { color: var(--danger); font-size: 0.7rem; margin-left: 0.5rem; font-weight: 600; }
  
  .response-code {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 0.5rem;
  }
  
  .response-2xx { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
  .response-4xx { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
  .response-5xx { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  
  .code-block-wrapper {
    position: relative;
    margin: 1rem 0;
  }
  
  .code-block {
    background: #0d1117;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'Fira Code', monospace;
    font-size: 0.8rem;
    line-height: 1.6;
    color: #c9d1d9;
  }
  
  .copy-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .copy-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
  }
  
  .copy-btn.copied {
    background: var(--success);
    border-color: var(--success);
  }
  
  .copy-btn::before {
    content: '📋';
    font-size: 0.9rem;
  }
  
  .copy-btn.copied::before {
    content: '✓';
  }
  
  .schema-section { margin-top: 1.25rem; }
  .schema-title { 
    font-size: 0.8rem; 
    font-weight: 600; 
    margin-bottom: 0.75rem; 
    color: var(--text-primary); 
    text-transform: uppercase; 
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .schema-title::before {
    content: '';
    width: 3px;
    height: 1rem;
    background: var(--primary);
    border-radius: 2px;
  }
  
  .response-item { 
    display: flex; 
    align-items: flex-start; 
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }
  .response-desc { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; }
  
  .curl-request {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }
  
  .tab {
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .tab:hover {
    color: var(--text-primary);
  }
  
  .tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
  }
  
  .tab-content {
    display: none;
  }
  
  .tab-content.active {
    display: block;
  }
  
  footer {
    text-align: center; padding: 2rem;
    color: var(--text-secondary); font-size: 0.85rem;
    border-top: 1px solid var(--border); margin-top: 2rem;
  }
  
  .footer-brand { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .footer-logo { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  
  .footer-logo svg { width: 18px; height: 18px; color: white; }
`;

export const generateHtmlHeader = (info: ApiInfo) => `
  <header>
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
        </div>
        <div>
          <h1>${info.title} <span class="version">v${info.version}</span></h1>
          <p class="description">${info.description}</p>
          <div class="servers">
            ${info.servers.map((s) => `<span class="server-badge">${getServerIcon(s.description)} ${s.url}</span>`).join("\n            ")}
          </div>
          <div class="ai-badge">✨ AI-Enhanced Documentation by Spec2Docs</div>
        </div>
      </div>
    </div>
  </header>
`;

export const generateEndpointHtml = (endpoint: Endpoint, index: number) => {
  const hasDetails = endpoint.description || endpoint.parameters || endpoint.requestBody || endpoint.responses;
  const endpointId = `endpoint-${index}`;

  // Generate cURL command
  const curlCommand = generateCurlCommand(endpoint);

  // Generate request body example
  const requestExample = endpoint.requestBody?.example || "";

  return `
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggleEndpoint('${endpointId}')">
        <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
        <span class="path">${endpoint.path}</span>
        <span class="summary">${endpoint.summary}</span>
      </div>
      ${
        hasDetails
          ? `
      <div class="endpoint-body" id="${endpointId}">
        ${endpoint.description ? `<p class="endpoint-description">${endpoint.description}</p>` : ""}
        
        ${
          endpoint.parameters && endpoint.parameters.length > 0
            ? `
        <div class="schema-section">
          <h4 class="schema-title">Parameters</h4>
          <table class="params-table">
            <thead><tr><th>Name</th><th>Location</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              ${endpoint.parameters
                .map(
                  (p) => `
                <tr>
                  <td><span class="param-name">${p.name}</span>${p.required ? '<span class="param-required">*</span>' : ""}</td>
                  <td>${p.in}</td>
                  <td>${p.type}</td>
                  <td>${p.description}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }
        
        ${
          endpoint.requestBody
            ? `
        <div class="schema-section">
          <h4 class="schema-title">Request Body</h4>
          <div class="code-block-wrapper">
            <button class="copy-btn" onclick="copyCode(this, 'request-${endpointId}')">Copy</button>
            <pre class="code-block" id="request-${endpointId}">${escapeHtml(requestExample)}</pre>
          </div>
        </div>
        `
            : ""
        }
        
        ${
          endpoint.responses && endpoint.responses.length > 0
            ? `
        <div class="schema-section">
          <h4 class="schema-title">Responses</h4>
          ${endpoint.responses
            .map((r) => {
              const statusClass = r.code.startsWith("2") ? "response-2xx" : r.code.startsWith("4") ? "response-4xx" : "response-5xx";
              return `
            <div class="response-item">
              <span class="response-code ${statusClass}">${r.code}</span>
              <span class="response-desc">${r.description}</span>
            </div>
          `;
            })
            .join("")}
        </div>
        `
            : ""
        }
        
        <div class="curl-request">
          <div class="tabs">
            <button class="tab active" onclick="switchTab(event, 'curl-${endpointId}')">cURL</button>
            ${endpoint.requestBody ? `<button class="tab" onclick="switchTab(event, 'request-${endpointId}-tab')">Request Sample</button>` : ""}
          </div>
          
          <div class="tab-content active" id="curl-${endpointId}">
            <div class="code-block-wrapper">
              <button class="copy-btn" onclick="copyCode(this, 'curl-code-${endpointId}')">Copy</button>
              <pre class="code-block" id="curl-code-${endpointId}">${escapeHtml(curlCommand)}</pre>
            </div>
          </div>
          
          ${
            endpoint.requestBody
              ? `
          <div class="tab-content" id="request-${endpointId}-tab">
            <div class="code-block-wrapper">
              <button class="copy-btn" onclick="copyCode(this, 'request-sample-${endpointId}')">Copy</button>
              <pre class="code-block" id="request-sample-${endpointId}">${escapeHtml(requestExample)}</pre>
            </div>
          </div>
          `
              : ""
          }
        </div>
      </div>
      `
          : ""
      }
    </div>
  `;
};

function generateCurlCommand(endpoint: Endpoint): string {
  let curl = `curl -X ${endpoint.method} `;

  // Add base URL placeholder
  curl += `"{{baseUrl}}${endpoint.path}" `;

  // Add headers
  curl += `\\\n  -H "Accept: application/json" `;

  if (endpoint.requestBody) {
    curl += `\\\n  -H "Content-Type: application/json" `;
  }

  // Add request body
  if (endpoint.requestBody) {
    const bodyData = endpoint.requestBody.example;
    curl += `\\\n  -d '${bodyData}'`;
  }

  return curl;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const generateEndpointGroupHtml = (group: EndpointGroup, groupIndex: number) => `
  <section class="section">
    <div class="section-header"><h2>${group.icon} ${group.tag}</h2></div>
    ${group.endpoints.map((endpoint, index) => generateEndpointHtml(endpoint, groupIndex * 100 + index)).join("\n    ")}
  </section>
`;

export const generateHtmlFooter = () => `
  <footer>
    <div class="footer-brand">
      <div class="footer-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
      </div>
      <strong>Spec2Docs</strong>
    </div>
    <p>Generated automatically from Express.js source code</p>
    <p style="margin-top: 0.5rem;">© 2026 Spec2Docs. All rights reserved.</p>
  </footer>
`;

export const generateCompleteHtml = (info: ApiInfo, groups: EndpointGroup[]) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${info.title} - Spec2Docs</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>${generateHtmlStyles()}</style>
  <script>
    function toggleEndpoint(id) {
      const body = document.getElementById(id);
      const header = body.previousElementSibling;
      
      if (body.classList.contains('show')) {
        body.classList.remove('show');
        header.classList.remove('expanded');
      } else {
        body.classList.add('show');
        header.classList.add('expanded');
      }
    }
    
    function copyCode(button, codeId) {
      const code = document.getElementById(codeId);
      const text = code.textContent;
      
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      });
    }
    
    function switchTab(event, tabId) {
      // Get parent tabs container
      const tabsContainer = event.target.closest('.curl-request');
      
      // Hide all tabs
      const tabs = tabsContainer.querySelectorAll('.tab');
      const contents = tabsContainer.querySelectorAll('.tab-content');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      // Show selected tab
      event.target.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }
  </script>
</head>
<body>
  ${generateHtmlHeader(info)}
  <main class="container">
    ${groups.map((group, index) => generateEndpointGroupHtml(group, index)).join("\n    ")}
  </main>
  ${generateHtmlFooter()}
</body>
</html>`;

function getServerIcon(description: string): string {
  if (description.toLowerCase().includes("production")) return "🌐";
  if (description.toLowerCase().includes("staging")) return "🧪";
  if (description.toLowerCase().includes("development")) return "💻";
  return "🔗";
}
