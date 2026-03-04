import { useState, useEffect } from "react";
import { docsApi, ParserResult } from "@/services/docsService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParserResultsDialogProps {
  documentationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ParserResultsDialog({ documentationId, isOpen, onClose }: ParserResultsDialogProps) {
  const [parserResult, setParserResult] = useState<ParserResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && documentationId) {
      fetchParserResults();
    }
  }, [isOpen, documentationId]);

  const fetchParserResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await docsApi.getParserResults(documentationId);
      setParserResult(response.data);
    } catch (err: any) {
      console.error("Error fetching parser results:", err);
      setError(err.response?.data?.message || "Failed to load parser results");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Error details copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Parser Results
          </DialogTitle>
          <DialogDescription>Detailed information about the parsing process and any issues encountered</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && parserResult && (
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {getStatusIcon(parserResult.completionStatus)}
                  Parsing Summary
                </h3>
                <Badge className={getStatusColor(parserResult.completionStatus)}>{parserResult.completionStatus.toUpperCase()}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-2xl">{parserResult.summary.totalFiles}</div>
                  <div className="text-gray-600">Total Files</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="font-semibold text-2xl text-green-600">{parserResult.summary.successfulFiles}</div>
                  <div className="text-gray-600">Successful</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-md">
                  <div className="font-semibold text-2xl text-red-600">{parserResult.summary.failedFiles}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="font-semibold text-2xl text-blue-600">{parserResult.summary.totalEndpoints}</div>
                  <div className="text-gray-600">Endpoints</div>
                </div>
              </div>

              {/* Warnings */}
              {parserResult.warnings.length > 0 && (
                <div className="space-y-2">
                  {parserResult.warnings.map((warning, index) => (
                    <Alert key={index} variant="default" className="border-yellow-400 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Results Accordion */}
            <Accordion type="multiple" className="space-y-2">
              {/* Successful Files */}
              {parserResult.successfulParsing.length > 0 && (
                <AccordionItem value="successful" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Successfully Parsed Files ({parserResult.successfulParsing.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {parserResult.successfulParsing.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                          <div>
                            <div className="font-medium text-sm">{file.file}</div>
                            <div className="text-xs text-gray-600">{file.path}</div>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {file.endpointCount} endpoint{file.endpointCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Failed Files */}
              {parserResult.failedParsing.length > 0 && (
                <AccordionItem value="failed" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">Failed to Parse ({parserResult.failedParsing.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {parserResult.failedParsing.map((file, index) => (
                        <div key={index} className="p-4 bg-red-50 rounded-md border border-red-200 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{file.file}</div>
                              <div className="text-xs text-gray-600">{file.path}</div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`File: ${file.file}\nError: ${file.error}\nType: ${file.errorType}${file.line ? `\nLine: ${file.line}` : ""}`)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                {file.errorType}
                              </Badge>
                              {file.line && (
                                <Badge variant="outline" className="text-xs">
                                  Line {file.line}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-red-800 font-mono bg-red-100 p-2 rounded">{file.error}</div>
                            {file.details && <div className="text-xs text-gray-600 mt-1">{file.details}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Skipped Files */}
              {parserResult.skippedFiles.length > 0 && (
                <AccordionItem value="skipped" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold">Skipped Files ({parserResult.skippedFiles.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {parserResult.skippedFiles.map((file, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                          <div className="font-medium text-sm">{file.file}</div>
                          <div className="text-xs text-gray-600">{file.path}</div>
                          <div className="text-sm text-yellow-800 mt-1">{file.reason}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
