import { motion } from "framer-motion";
import { FileArchive, Upload, Sparkles, Download, ArrowRight, Code2, FileJson, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: FileArchive,
    title: "Zip Your Project",
    description: "Package your Express.js project files into a ZIP archive. Include all route files and middleware.",
    color: "primary",
  },
  {
    icon: Upload,
    title: "Upload to Spec2Docs",
    description: "Drag and drop your ZIP file or click to browse. We support projects of any size.",
    color: "primary",
  },
  {
    icon: Sparkles,
    title: "AI Refines Documentation",
    description: "Gemini 2.5 analyzes your code and generates meaningful descriptions, examples, and schemas.",
    color: "ai",
  },
  {
    icon: Download,
    title: "Export for Integration",
    description: "Download your documentation in OpenAPI YAML, JSON, Markdown, or HTML format for use with Swagger or Postman.",
    color: "success",
  },
];

const tips = [
  {
    icon: Code2,
    title: "Use JSDoc Comments",
    description: "Add JSDoc comments to your route handlers for richer AI-generated descriptions.",
    example: `/**
 * @description Get user by ID
 * @param {string} id - User ID
 * @returns {User} User object
 */
app.get('/users/:id', handler);`,
  },
  {
    icon: FileJson,
    title: "Define Schemas",
    description: "Use validation libraries like Joi or Zod to define request/response schemas for accurate documentation.",
    example: `const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user'])
});`,
  },
  {
    icon: Zap,
    title: "Consistent Naming",
    description: "Use consistent naming patterns for routes, parameters, and responses to improve AI understanding.",
    example: `// Good: RESTful patterns
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id`,
  },
];

export default function Guide() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-bold mb-4">
            Implementation Guide
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to generate professional API documentation from your Express.js project.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative mb-16">
          {/* Connection Line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="glass-card p-6 md:pl-20 relative">
                <div
                  className={`absolute left-4 top-6 w-10 h-10 rounded-xl flex items-center justify-center  md:flex ${
                    step.color === "ai" ? "bg-gradient-to-br from-amber-500 to-orange-500" : step.color === "success" ? "bg-success" : "bg-primary"
                  }`}
                >
                  <step.icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex items-center gap-3 mb-2 md:hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color === "ai" ? "bg-gradient-to-br from-amber-500 to-orange-500" : step.color === "success" ? "bg-success" : "bg-primary"}`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden md:inline">Step {index + 1}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:inline" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">💡 Pro Tips for Better Documentation</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-2">{tip.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">{tip.description}</p>
                <pre className="code-block text-xs overflow-x-auto">
                  <code>{tip.example}</code>
                </pre>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="glass-card p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">Generate your first API documentation in under a minute.</p>
          <Link to="/generate">
            <Button variant="hero" size="lg">
              Start Generating
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
