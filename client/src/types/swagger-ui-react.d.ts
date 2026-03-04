declare module "swagger-ui-react" {
  import { ComponentType } from "react";

  interface SwaggerUIProps {
    spec?: object;
    url?: string;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    displayRequestDuration?: boolean;
    filter?: boolean | string;
    maxDisplayedTags?: number;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    supportedSubmitMethods?: string[];
    validatorUrl?: string | null;
    onComplete?: (system: any) => void;
    requestInterceptor?: (request: any) => any;
    responseInterceptor?: (response: any) => any;
    tryItOutEnabled?: boolean;
    deepLinking?: boolean;
    persistAuthorization?: boolean;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module "swagger-ui-react/swagger-ui.css";
