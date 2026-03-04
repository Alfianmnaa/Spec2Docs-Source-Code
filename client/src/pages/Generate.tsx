import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileArchive, Sparkles, Check, Loader2, AlertCircle, Download, Settings2, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { docsApi } from "@/services/docsService";
import { toast } from "sonner";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export default function Generate() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [aiEnhancement, setAiEnhancement] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { id: "unzip", label: "Unzipping Source Code", status: "pending" },
    { id: "parse", label: "AST Parsing and Route Discovery", status: "pending" },
    { id: "enhance", label: "AI Enhancing Descriptions", status: "pending" },
    { id: "finalize", label: "Finalizing Documentation", status: "pending" },
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith(".zip")) {
        setFile(droppedFile);
        setProjectName(droppedFile.name.replace(".zip", ""));
      } else {
        toast.error("Unsupported format. Please upload a .zip file");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".zip")) {
        setFile(selectedFile);
        setProjectName(selectedFile.name.replace(".zip", ""));
      } else {
        toast.error("Unsupported format. Please upload a .zip file");
        e.target.value = ""; // Reset file input
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setProjectName("");
  };

  const handleGenerate = async () => {
    if (!file || !projectName) {
      toast.error("Please provide a file and project name");
      return;
    }

    setIsGenerating(true);
    // Reset steps to pending
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" })));

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectName", projectName);
      formData.append("useAI", aiEnhancement.toString());

      // Step 1: Unzipping
      setSteps((prev) => prev.map((step, index) => (index === 0 ? { ...step, status: "processing" } : step)));
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSteps((prev) => prev.map((step, index) => (index === 0 ? { ...step, status: "completed" } : step)));

      // Step 2: AST Parsing and Route Discovery - Start API call
      setSteps((prev) => prev.map((step, index) => (index === 1 ? { ...step, status: "processing" } : step)));

      // Start the actual API call
      const apiPromise = docsApi.generate(formData);

      // Show parsing progress
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSteps((prev) => prev.map((step, index) => (index === 1 ? { ...step, status: "completed" } : step)));

      // Step 3: AI Enhancement
      setSteps((prev) => prev.map((step, index) => (index === 2 ? { ...step, status: "processing" } : step)));

      // Show AI enhancement progress
      const aiDelay = aiEnhancement ? 3000 : 800;

      // Wait for both AI delay AND API response
      const [response] = await Promise.all([apiPromise, new Promise((resolve) => setTimeout(resolve, aiDelay))]);

      setSteps((prev) => prev.map((step, index) => (index === 2 ? { ...step, status: "completed" } : step)));

      // Step 4: Finalizing
      setSteps((prev) => prev.map((step, index) => (index === 3 ? { ...step, status: "processing" } : step)));
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSteps((prev) => prev.map((step, index) => (index === 3 ? { ...step, status: "completed" } : step)));

      toast.success("Documentation generated successfully!");

      // Show AI enrichment status notification
      if (response.data.aiEnrichmentStatus === "success") {
        toast.success("✨ AI Enrichment Success", {
          description: "Your documentation has been enhanced with AI-generated descriptions",
        });
      } else if (response.data.aiEnrichmentStatus === "failed") {
        toast.warning("⚠️ AI Enrichment Failed", {
          description: "Documentation generated with basic descriptions",
        });
      }

      // Show parsing stats notification
      if (response.data.parsingStats) {
        const stats = response.data.parsingStats;
        if (stats.failedFiles > 0) {
          toast.warning("⚠️ Parsing Warnings", {
            description: `${stats.successfulFiles} files parsed successfully, ${stats.failedFiles} files failed`,
          });
        }
      }

      // Navigate to viewer with the generated doc ID
      setTimeout(() => {
        navigate(`/viewer/${response.data.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Generation error:", error);
      // Mark current/all steps as failed
      setSteps((prev) => prev.map((step) => (step.status === "processing" ? { ...step, status: "failed" } : step)));
      toast.error(error.response?.data?.message || "Failed to generate documentation");
      setIsGenerating(false);
    }
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);

    for (let i = 0; i < steps.length; i++) {
      // Set current step to processing
      setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, status: "processing" } : step)));

      // Wait for step to complete
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Set current step to completed
      setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, status: "completed" } : step)));
    }

    // Navigate to viewer after completion
    setTimeout(() => {
      navigate("/viewer");
    }, 500);
  };

  const StepIndicator = ({ step, index }: { step: Step; index: number }) => {
    const getStepIcon = () => {
      switch (step.status) {
        case "completed":
          return <Check className="w-4 h-4" />;
        case "processing":
          return <Loader2 className="w-4 h-4 animate-spin" />;
        case "failed":
          return <AlertCircle className="w-4 h-4" />;
        default:
          return <span className="text-sm font-medium">{index + 1}</span>;
      }
    };

    return (
      <div className="flex items-start gap-4">
        <div className="relative">
          <motion.div
            className={cn("stepper-dot", step.status === "completed" && "completed", step.status === "processing" && "active", step.status === "pending" && "pending", step.status === "failed" && "border-destructive bg-destructive/20")}
            animate={step.status === "processing" ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{
              repeat: step.status === "processing" ? Infinity : 0,
              duration: 1.5,
            }}
          >
            {getStepIcon()}
          </motion.div>
          {step.status === "processing" && <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />}
        </div>
        <div className="flex-1 pb-8">
          <p className={cn("font-medium", step.status === "completed" && "text-success", step.status === "processing" && "text-primary", step.status === "failed" && "text-destructive", step.status === "pending" && "text-muted-foreground")}>
            {step.label}
          </p>
          {step.status === "processing" && <p className="text-sm text-muted-foreground mt-1">Processing...</p>}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Documentation</h1>
          <p className="text-muted-foreground">Upload your Express.js project to generate OpenAPI documentation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Source Code
              </h2>

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn("upload-zone cursor-pointer", isDragging && "dragging")}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <FileArchive className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-1">Drop your project ZIP here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <p className="text-xs text-muted-foreground">Supports .zip files containing Express.js projects</p>
                    <input id="file-input" type="file" accept=".zip" className="hidden" onChange={handleFileSelect} />
                  </motion.div>
                ) : (
                  <motion.div key="file-preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileArchive className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile} disabled={isGenerating}>
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Progress Stepper */}
            {isGenerating && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  Generation Progress
                </h2>
                <div className="relative">
                  <div className="stepper-line" />
                  {steps.map((step, index) => (
                    <StepIndicator key={step.id} step={step} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Configuration Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Configuration
              </h2>

              <div className="space-y-5">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input id="project-name" placeholder="my-express-api" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-secondary" disabled={isGenerating} />
                </div>

                {/* AI Enhancement Toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">AI Narrative Enrichment</p>
                      <p className="text-xs text-muted-foreground">Powered by Gemini 2.5</p>
                    </div>
                  </div>
                  <Switch checked={aiEnhancement} onCheckedChange={setAiEnhancement} disabled={isGenerating} />
                </div>

                {/* Generate Button */}
                <Button variant="hero" size="lg" className="w-full" disabled={!file || !projectName || isGenerating} onClick={handleGenerate}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate Documentation
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="glass-card p-6">
              <h3 className="font-medium mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Include JSDoc comments for better AI descriptions</li>
                <li>• Use consistent route naming patterns</li>
                <li>• Define request/response schemas for accuracy</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
