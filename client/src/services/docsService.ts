import axiosInstance from "@/lib/axios";

export interface Documentation {
  _id: string;
  id?: string;
  projectName: string;
  sourceFileName?: string;
  fileName?: string;
  endpointCount?: number;
  qualityScore?: number;
  qualityGrade?: string;
  aiEnhanced?: boolean;
  aiEnrichmentStatus?: "success" | "failed" | "skipped";
  parsingStats?: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    skippedFiles: number;
  };
  openApiSpec: any;
  spec?: any;
  aiDescription?: string;
  qualityMetrics: {
    score: number;
    grade: string;
    breakdown: {
      basicInfo: { score: number; maxScore: number };
      endpoints: { score: number; maxScore: number };
      descriptions: { score: number; maxScore: number };
      examples: { score: number; maxScore: number };
      schemas: { score: number; maxScore: number };
      errorHandling: { score: number; maxScore: number };
      security: { score: number; maxScore: number };
    };
    suggestions: string[];
    summary: string;
  };
  status?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ParsingFile {
  file: string;
  path: string;
}

export interface SuccessfulParsing extends ParsingFile {
  endpointCount: number;
}

export interface FailedParsing extends ParsingFile {
  error: string;
  errorType: string;
  line?: number;
  details?: string;
}

export interface SkippedFile extends ParsingFile {
  reason: string;
}

export interface ParserWarning {
  type: string;
  message: string;
  files: string[];
}

export interface ParserResult {
  _id: string;
  documentationId: string;
  userId: string;
  summary: {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    skippedFiles: number;
    totalEndpoints: number;
  };
  successfulParsing: SuccessfulParsing[];
  failedParsing: FailedParsing[];
  skippedFiles: SkippedFile[];
  warnings: ParserWarning[];
  completionStatus: "success" | "partial" | "failed";
  createdAt: string;
  updatedAt?: string;
}

export interface GenerateDocResponse {
  success: boolean;
  message: string;
  data: Documentation & {
    parsingStats?: {
      totalFiles: number;
      successfulFiles: number;
      failedFiles: number;
      skippedFiles: number;
    };
    parserResultId?: string;
  };
}

export interface ListDocsResponse {
  success: boolean;
  data: {
    docs: Documentation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ParserResultResponse {
  success: boolean;
  data: ParserResult;
}

export const docsApi = {
  generate: async (formData: FormData): Promise<GenerateDocResponse> => {
    const response = await axiosInstance.post("/api/docs/generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAll: async (page = 1, limit = 10): Promise<ListDocsResponse> => {
    const response = await axiosInstance.get(`/api/docs?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Documentation }> => {
    const response = await axiosInstance.get(`/api/docs/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/docs/${id}`);
    return response.data;
  },

  getParserResults: async (id: string): Promise<ParserResultResponse> => {
    const response = await axiosInstance.get(`/api/docs/${id}/parser-results`);
    return response.data;
  },

  export: async (id: string, format: "json" | "yaml" | "markdown" | "html", htmlContent?: string): Promise<Blob> => {
    try {
      if (format === "html" && htmlContent) {
        // Send HTML content in request body for HTML exports
        const response = await axiosInstance.post(`/api/docs/export/${id}/${format}`, { htmlContent }, { responseType: "blob" });
        return response.data;
      } else {
        // Use GET for other formats
        const response = await axiosInstance.get(`/api/docs/export/${id}/${format}`, {
          responseType: "blob",
        });
        return response.data;
      }
    } catch (error: any) {
      // Handle blob error responses
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || "Export failed");
        } catch {
          throw new Error(text || "Export failed");
        }
      }
      throw error;
    }
  },
};
