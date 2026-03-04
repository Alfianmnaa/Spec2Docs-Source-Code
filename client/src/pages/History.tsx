import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FileArchive, Search, Clock, MoreVertical, Eye, Trash2, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { docsApi, Documentation } from "@/services/docsService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setIsLoading(true);
      const response = await docsApi.getAll();
      const data = response?.data;
      // Handle both response formats: array or object with docs property
      if (Array.isArray(data)) {
        setDocs(data);
      } else if (data && "docs" in data) {
        setDocs(data.docs);
      } else {
        setDocs([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load documentation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await docsApi.delete(id);
      toast.success("Documentation deleted successfully");
      loadDocs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete documentation");
    }
  };

  const filteredDocs = docs?.filter((doc) => doc.projectName.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const hasHistory = !isLoading && docs.length > 0;
  const hasFilteredResults = filteredDocs.length > 0;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Documentation History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">View and manage your generated documentation</p>
          </div>
          <Link to="/generate">
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              New Documentation
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : hasHistory ? (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search documentation..." className="pl-10 bg-secondary" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {hasFilteredResults ? (
              /* Grid */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((item, index) => (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card p-5 group hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileArchive className="w-5 h-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/viewer/${item._id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item._id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <h3 className="font-semibold mb-1 line-clamp-2">{item.projectName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.sourceFileName || item.fileName || "N/A"}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Quality Score</span>
                      <span className={cn("text-sm font-semibold", getScoreColor(item.qualityMetrics?.score || item.qualityScore || 0))}>{item.qualityMetrics?.score || item.qualityScore || 0}/100</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>

                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate(`/viewer/${item._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Documentation
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* No Search Results */
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mb-6">
                  <Search className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">No results found</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">No documentation matches "{searchQuery}". Try a different search term.</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FileArchive className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">No documentation yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">Upload your first Express.js project to generate beautiful API documentation automatically.</p>
            <Link to="/generate">
              <Button variant="hero" size="lg">
                <Plus className="w-4 h-4" />
                Generate Your First Documentation
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
