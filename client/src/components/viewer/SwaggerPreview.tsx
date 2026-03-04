import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "@/styles/swagger-dark.css";
import { useTheme } from "@/components/ThemeProvider";

interface SwaggerPreviewProps {
  spec: object;
}

export function SwaggerPreview({ spec }: SwaggerPreviewProps) {
  const { theme } = useTheme();

  return (
    <div className={theme === "dark" ? "swagger-ui-dark bg-slate-900 min-h-full p-4" : "swagger-ui-light bg-white min-h-full p-4"}>
      <SwaggerUI spec={spec} docExpansion="list" defaultModelsExpandDepth={-1} displayRequestDuration={true} />
    </div>
  );
}
