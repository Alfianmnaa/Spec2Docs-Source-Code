import { ApiInfo, EndpointGroup, Endpoint } from "./htmlTemplateGenerator";

export const mapOpenApiToHtmlData = (spec: any): { info: ApiInfo; groups: EndpointGroup[] } => {
  const info: ApiInfo = {
    title: spec.info.title,
    version: spec.info.version,
    description: spec.info.description,
    servers: spec.servers.map((s: any) => ({
      url: s.url,
      description: s.description,
    })),
  };

  const groupMap = new Map<string, EndpointGroup>();

  // Process all paths
  Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, details]: [string, any]) => {
      if (typeof details !== "object" || !details.tags) return;

      const tag = details.tags[0];
      if (!groupMap.has(tag)) {
        groupMap.set(tag, {
          tag,
          icon: getTagIcon(tag),
          endpoints: [],
        });
      }

      const endpoint: Endpoint = {
        method: method.toUpperCase() as Endpoint["method"],
        path,
        summary: details.summary || "",
        description: details.description,
        parameters: details.parameters?.map((p: any) => ({
          name: p.name,
          in: p.in,
          type: p.schema?.type || "string",
          description: p.description || "",
          required: p.required || false,
        })),
        requestBody: details.requestBody?.content?.["application/json"]?.example
          ? {
              example: JSON.stringify(details.requestBody.content["application/json"].example, null, 2),
            }
          : undefined,
        responses: Object.entries(details.responses || {}).map(([code, resp]: [string, any]) => ({
          code,
          description: resp.description || "",
        })),
      };

      groupMap.get(tag)!.endpoints.push(endpoint);
    });
  });

  const groups = Array.from(groupMap.values());

  return { info, groups };
};

function getTagIcon(tag: string): string {
  const iconMap: Record<string, string> = {
    Users: "👤",
    Authentication: "🔐",
    Posts: "📝",
    Comments: "💬",
    Products: "🛍️",
    Orders: "📦",
    Payments: "💳",
    Settings: "⚙️",
    Analytics: "📊",
    Notifications: "🔔",
  };

  return iconMap[tag] || "📌";
}
