import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FileCode2, History, BookOpen, Settings, Menu, X, Sparkles, ChevronLeft, LogOut, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: FileCode2, label: "Generate", path: "/generate" },
  { icon: History, label: "History", path: "/history" },
  { icon: BookOpen, label: "Guide", path: "/guide" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileCode2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-base sm:text-lg">Spec2Docs</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{user ? getUserInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed top-16 left-0 bottom-0 z-50 w-[280px] bg-sidebar border-r border-sidebar-border"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200", location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm sm:text-base font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 280 : 80 }} className="hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <FileCode2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="font-semibold text-lg">
                  Spec2Docs
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={cn("transition-all duration-200", !sidebarOpen && "absolute right-2")}>
            <ChevronLeft className={cn("w-5 h-5 transition-transform duration-200", !sidebarOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">{item.label}</div>
              )}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-3">
          <Button variant="ghost" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className={cn("w-full justify-start gap-3 hover:bg-secondary", !sidebarOpen && "px-2 justify-center")}>
            {theme === "light" ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0" />}
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-medium">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Tooltip for collapsed state */}
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </div>
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start gap-3 hover:bg-secondary", !sidebarOpen && "px-2")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{user ? getUserInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-start overflow-hidden">
                      <p className="text-sm font-medium truncate max-w-[160px]">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user?.email}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* AI Badge */}
        <div className="p-3">
          <div className={cn("rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3", !sidebarOpen && "p-2")}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-xs font-medium text-amber-500">AI Enhanced</p>
                    <p className="text-xs text-muted-foreground">Powered by Gemini</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn("transition-all duration-300 min-h-screen pt-16 lg:pt-0", sidebarOpen ? "lg:pl-[280px]" : "lg:pl-[80px]")}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-4 lg:p-8">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
