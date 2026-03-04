import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileCode2, Sparkles, Zap, Shield, Code2, FileJson, Menu, X, LogOut, User as UserIcon, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";

const expressCode = `// routes/users.js
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

app.post('/users', validate(userSchema), 
  async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
});`;

const openApiPreview = `openapi: 3.0.3
info:
  title: User Management API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Retrieve a user by ID
      description: Fetches complete user 
        profile data including...
      parameters:
        - name: id
          in: path
          required: true`;

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <FileCode2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold">Spec2Docs</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/guide">
                <Button variant="ghost">Documentation</Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/history")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/guide" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Documentation
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/history" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Powered by Gemini Model</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Documentation that
              <br />
              <span className="text-gradient">writes itself.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Automatically parse Express.js source code into OpenAPI 3.0.3 with AI-powered narrative enhancement.</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group sm:size-xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/guide">
                <Button variant="outline" size="lg" className="sm:size-xl">
                  View Documentation
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Code Comparison Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative max-w-5xl mx-auto">
            <div className="glass-card p-1 animate-glow">
              <div className="grid md:grid-cols-2 gap-0.5 bg-border/20 rounded-xl overflow-hidden">
                {/* Express Code */}
                <div className="bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Express.js Source</span>
                  </div>
                  <pre className="code-block text-xs sm:text-sm overflow-hidden">
                    <code className="text-muted-foreground">{expressCode}</code>
                  </pre>
                </div>

                {/* OpenAPI Output */}
                <div className="bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileJson className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Generated OpenAPI</span>
                  </div>
                  <pre className="code-block text-xs sm:text-sm overflow-hidden">
                    <code className="text-success/80">{openApiPreview}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Arrow Indicator */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <ArrowRight className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why developers love Spec2Docs</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">Stop writing documentation manually. Let Spec2Docs understand your code and generate professional API docs in seconds.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Generation",
                description: "Upload your Express.js project and get complete OpenAPI documentation in under 30 seconds.",
                color: "primary",
              },
              {
                icon: Sparkles,
                title: "AI-Enhanced Descriptions",
                description: "Gemini AI adds meaningful descriptions, examples, and error scenarios to every endpoint.",
                color: "ai",
              },
              {
                icon: Shield,
                title: "Industry Standard",
                description: "Generate OpenAPI 3.0.3 compliant specs that work with Swagger, Postman, and any API tool.",
                color: "success",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 group hover:border-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color === "ai" ? "text-amber-500" : feature.color === "success" ? "text-success" : "text-primary"}`} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to automate your API docs?</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of developers who save hours every week with AI-powered documentation.</p>
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group sm:size-xl">
                  Start for Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Spec2Docs</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Spec2Docs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
