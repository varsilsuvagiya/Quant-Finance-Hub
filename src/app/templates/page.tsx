"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { StrategyCard } from "@/components/strategy-card";
import { StrategyCardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TradingStrategy } from "@/types";
import { toast } from "sonner";
import {
  Search,
  Filter,
  X,
  Sparkles,
  FileText,
  Download,
  Copy,
} from "lucide-react";

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<TradingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TradingStrategy | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [usingTemplate, setUsingTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/strategies/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesRisk =
        filterRisk === "all" || template.riskLevel === filterRisk;
      const matchesAsset =
        filterAsset === "all" || template.assetClass === filterAsset;

      return matchesSearch && matchesRisk && matchesAsset;
    });
  }, [templates, searchQuery, filterRisk, filterAsset]);

  const handleUseTemplate = (template: TradingStrategy) => {
    setSelectedTemplate(template);
    setTemplateName(`${template.name} (Copy)`);
    setUseTemplateDialogOpen(true);
  };

  const confirmUseTemplate = async () => {
    if (!selectedTemplate) return;

    setUsingTemplate(true);
    try {
      const res = await fetch("/api/strategies/use-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate._id,
          name: templateName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Strategy created from template!");
        setUseTemplateDialogOpen(false);
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Failed to use template");
      }
    } catch (error) {
      toast.error("Failed to use template");
    } finally {
      setUsingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Strategy Templates
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Browse pre-built trading strategy templates and use them as starting
            points for your own strategies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Very High">Very High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAsset} onValueChange={setFilterAsset}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Forex">Forex</SelectItem>
                  <SelectItem value="Futures">Futures</SelectItem>
                  <SelectItem value="Options">Options</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(filterRisk !== "all" || filterAsset !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTemplates.length} of {templates.length}{" "}
                templates
              </span>
              {(filterRisk !== "all" || filterAsset !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRisk("all");
                    setFilterAsset("all");
                  }}
                  className="h-7"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StrategyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {templates.length === 0
                  ? "No templates available yet"
                  : "No templates match your filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {templates.length === 0
                  ? "Templates will appear here once they are created"
                  : "Try adjusting your search or filters"}
              </p>
              {templates.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterRisk("all");
                    setFilterAsset("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template._id}
                className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 relative"
              >
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Template
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{template.riskLevel}</Badge>
                    <Badge variant="outline">{template.assetClass}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Link href={`/strategies/${template._id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Use Template Dialog */}
        <Dialog
          open={useTemplateDialogOpen}
          onOpenChange={setUseTemplateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use Template</DialogTitle>
              <DialogDescription>
                Create a new strategy from this template. You can customize it
                after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Strategy Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter strategy name"
                />
              </div>
              <Button
                onClick={confirmUseTemplate}
                disabled={usingTemplate || !templateName.trim()}
                className="w-full"
              >
                {usingTemplate ? (
                  "Creating..."
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Create Strategy from Template
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
