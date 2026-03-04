import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FileCode2, Eye, EyeOff, Github, Mail, Lock, User, Check, X, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [validation, setValidation] = useState({
    email: null as boolean | null,
    password: null as boolean | null,
    username: null as boolean | null,
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateUsername = (username: string) => {
    return username.length >= 3;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "email") {
      setValidation((prev) => ({
        ...prev,
        email: value ? validateEmail(value) : null,
      }));
    } else if (field === "password") {
      setValidation((prev) => ({
        ...prev,
        password: value ? validatePassword(value) : null,
      }));
    } else if (field === "username") {
      setValidation((prev) => ({
        ...prev,
        username: value ? validateUsername(value) : null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Login successful!");
      } else {
        await register(formData.username, formData.email, formData.password);
        toast.success("Registration successful!");
      }
      navigate("/generate");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ valid }: { valid: boolean | null }) => {
    if (valid === null) return null;
    return valid ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <FileCode2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl sm:text-2xl">Spec2Docs</span>
          </Link>

          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200", isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn("flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200", !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username - Only for signup */}
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={cn("pl-10 pr-10 bg-secondary border-border", validation.username === false && "border-destructive")}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <ValidationIcon valid={validation.username} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn("pl-10 pr-10 bg-secondary border-border", validation.email === false && "border-destructive")}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ValidationIcon valid={validation.email} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={cn("pl-10 pr-16 bg-secondary border-border", validation.password === false && "border-destructive")}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <ValidationIcon valid={validation.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {!isLogin && <p className="text-xs text-muted-foreground">At least 8 characters</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div> */}

            {/* GitHub OAuth */}
            {/* <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button> */}
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
