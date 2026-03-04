import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Sparkles, Check, Code2, FileCode2, Eye, Loader2, Maximize2, Minimize2, FileWarning } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SwaggerPreview } from "@/components/viewer/SwaggerPreview";
import { HtmlPreview } from "@/components/viewer/HtmlPreview";
import ParserResultsDialog from "@/components/ParserResultsDialog";
import { convertToYaml } from "@/utils/openApiSpec";
import { generateCompleteHtml } from "@/utils/htmlTemplateGenerator";
import { mapOpenApiToHtmlData } from "@/utils/specToHtmlMapper";
import { copyToClipboard, ExportFormat } from "@/utils/exportUtils";
import { useParams, useNavigate } from "react-router-dom";
import { docsApi, Documentation } from "@/services/docsService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("yaml");
  const [copied, setCopied] = useState(false);
  const [previewType, setPreviewType] = useState<"swagger" | "html">("swagger");
  const [doc, setDoc] = useState<Documentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isParserDialogOpen, setIsParserDialogOpen] = useState(false);
  const [parsingStats, setParsingStats] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      toast.error("Documentation ID is required");
      navigate("/history");
      return;
    }

    loadDoc();
  }, [id]);

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to exit fullscreen
      if (e.key === "Escape" && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
      // F to toggle fullscreen (when not typing in input)
      if (e.key === "f" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsPreviewFullscreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewFullscreen]);

  const loadDoc = async () => {
    try {
      setIsLoading(true);
      const response = await docsApi.getById(id!);
      console.log("Loaded documentation:", response.data);
      setDoc(response.data);

      // Check if parser results exist
      try {
        const parserResponse = await docsApi.getParserResults(id!);
        setParsingStats(parserResponse.data.summary);
      } catch (parserError: any) {
        // Parser results might not exist for older docs
        console.log("No parser results available:", parserError.response?.status);
      }
    } catch (error: any) {
      console.error("Load doc error:", error);
      toast.error(error.response?.data?.message || "Failed to load documentation");
      navigate("/history");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate OpenAPI spec from loaded doc
  const openApiSpec = useMemo(() => {
    if (!doc?.openApiSpec) {
      console.warn("No openApiSpec in doc:", doc);
      return null;
    }
    return doc.openApiSpec;
  }, [doc]);

  // Convert to YAML - only if spec exists and has required fields
  const openApiYaml = useMemo(() => {
    if (!openApiSpec || !openApiSpec.info || !openApiSpec.info.title) {
      console.warn("Invalid OpenAPI spec structure:", openApiSpec);
      return "";
    }
    try {
      return convertToYaml(openApiSpec);
    } catch (error) {
      console.error("Error converting to YAML:", error);
      return "";
    }
  }, [openApiSpec]);

  // Generate HTML content
  const htmlContent = useMemo(() => {
    if (!openApiSpec || !openApiSpec.paths) {
      console.warn("No paths in openApiSpec for HTML generation");
      return "";
    }
    try {
      const { info, groups } = mapOpenApiToHtmlData(openApiSpec);
      return generateCompleteHtml(info, groups);
    } catch (error) {
      console.error("Error generating HTML:", error);
      return "";
    }
  }, [openApiSpec]);

  const handleCopy = async () => {
    const success = await copyToClipboard(openApiYaml);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      if (!id) return;
      // Pass htmlContent for HTML exports to ensure consistency with preview
      const blob = await docsApi.export(id, exportFormat, exportFormat === "html" ? htmlContent : undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc?.projectName || "documentation"}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Documentation exported as ${exportFormat.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to export documentation");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading documentation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!doc || !openApiSpec) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">Documentation not found</p>
            <p className="text-muted-foreground mb-4">The requested documentation could not be loaded</p>
            <Button onClick={() => navigate("/history")}>Back to History</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!doc) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Documentation not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{doc.projectName}</h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-muted-foreground">
              <span className="whitespace-nowrap">{doc.aiEnhanced ? "AI-enhanced documentation" : "Generated documentation"}</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">{doc.endpointCount || Object.keys(doc.openApiSpec?.paths || {}).length} endpoints</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">Score: {doc.qualityMetrics?.score || doc.qualityScore || 0}/100</span>
              {parsingStats && parsingStats.failedFiles > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <Button variant="link" size="sm" className="h-auto p-0 text-yellow-600 hover:text-yellow-700" onClick={() => setIsParserDialogOpen(true)}>
                    <FileWarning className="w-4 h-4 mr-1" />
                    <span className="whitespace-nowrap">
                      {parsingStats.failedFiles} file{parsingStats.failedFiles !== 1 ? "s" : ""} failed
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Export Bar */}
          <div className="flex items-center gap-3 p-2 bg-card rounded-xl border border-border flex-shrink-0">
            {parsingStats !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setIsParserDialogOpen(true)} className="relative">
                    <FileWarning className="w-4 h-4" />
                    {parsingStats.failedFiles > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {parsingStats.failedFiles}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Parsing Results</TooltipContent>
              </Tooltip>
            )}
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <SelectTrigger className="w-[140px] bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yaml">OpenAPI YAML</SelectItem>
                <SelectItem value="json">OpenAPI JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="hero" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className={cn("grid gap-6 transition-all duration-300", isPreviewFullscreen ? "grid-cols-1" : "xl:grid-cols-2")}>
          {/* Left Side - Preview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cn("glass-card overflow-hidden flex flex-col min-w-0", isPreviewFullscreen && "col-span-full")} style={{ height: "calc(100vh - 180px)" }}>
            {/* Preview Tabs */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 min-w-0">
                <Eye className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="truncate">Preview</span>
              </h2>
              <div className="flex items-center gap-2">
                <Tabs value={previewType} onValueChange={(v) => setPreviewType(v as "swagger" | "html")}>
                  <TabsList className="bg-secondary">
                    <TabsTrigger value="swagger" className="gap-2 text-xs sm:text-sm">
                      <Code2 className="w-4 h-4" />
                      Swagger
                    </TabsTrigger>
                    <TabsTrigger value="html" className="gap-2 text-xs sm:text-sm">
                      <FileCode2 className="w-4 h-4" />
                      HTML
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)} className="flex-shrink-0">
                      {isPreviewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isPreviewFullscreen ? "Exit fullscreen" : "Expand preview"} <span className="text-muted-foreground">(F or ESC)</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">{previewType === "swagger" ? <SwaggerPreview spec={openApiSpec} /> : <HtmlPreview htmlContent={htmlContent} />}</div>
          </motion.div>

          {/* Right Side - OpenAPI Spec Editor & AI Quality */}
          <AnimatePresence>
            {!isPreviewFullscreen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-6 min-w-0">
                {/* OpenAPI Spec Editor */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card overflow-hidden flex flex-col min-w-0" style={{ height: "calc(100vh - 280px)" }}>
                  <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-2">
                    <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 min-w-0">
                      <Code2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="truncate">OpenAPI Specification</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-success" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <pre className="flex-1 overflow-auto custom-scrollbar p-4 m-0 bg-[#0d1117] min-w-0">
                    <code className="text-xs sm:text-sm text-[#c9d1d9] font-mono whitespace-pre">{openApiYaml}</code>
                  </pre>
                </motion.div>

                {/* AI Quality Widget */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 sm:p-6 ai-glow min-w-0">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold">Quality Score</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Grade: {doc.qualityMetrics?.grade || doc.qualityGrade || "N/A"}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-2xl sm:text-3xl font-bold text-success">{doc.qualityMetrics?.score || doc.qualityScore || 0}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.qualityMetrics?.score || doc.qualityScore || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-success rounded-full"
                    />
                  </div>

                  {/* Quality Breakdown */}
                  {doc.qualityMetrics?.breakdown && (
                    <div className="mb-4">
                      <h4 className="text-xs sm:text-sm font-medium mb-3">Quality Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(doc.qualityMetrics.breakdown).map(([key, value]: [string, any], index) => {
                          const percentage = value.maxScore ? (value.score / value.maxScore) * 100 : 0;
                          const label = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim();
                          return (
                            <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">
                                  {value.score}/{value.maxScore}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                                  className={`h-full rounded-full ${percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {doc.qualityMetrics?.summary && (
                    <div className="mb-4 p-3 bg-secondary/50 rounded-lg border border-border min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{doc.qualityMetrics.summary}</p>
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium mb-2">Improvement Suggestions</h4>
                    {doc.qualityMetrics?.suggestions && doc.qualityMetrics.suggestions.length > 0 ? (
                      <ul className="space-y-1.5">
                        {doc.qualityMetrics.suggestions.map((suggestion, index) => (
                          <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground min-w-0">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                            <span className="break-words min-w-0">{suggestion}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground italic">No suggestions - excellent documentation quality!</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Parser Results Dialog */}
      {id && <ParserResultsDialog documentationId={id} isOpen={isParserDialogOpen} onClose={() => setIsParserDialogOpen(false)} />}
    </DashboardLayout>
  );
}
