"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { StrategyCard } from "@/components/strategy-card";
import {
  StrategyCardSkeleton,
  DashboardStatsSkeleton,
} from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TradingStrategy, RiskLevel, AssetClass } from "@/types";
import { toast } from "sonner";
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  X,
  TrendingUp,
  BarChart3,
  Layers,
  Zap,
  Download,
  Heart,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] =
    useState<TradingStrategy | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    riskLevel: "Medium" as RiskLevel,
    assetClass: "Stocks" as AssetClass,
    parameters: { entry: "", exit: "", timeframe: "1h" },
    tags: "",
    backtestPerformance: "",
    isPublic: false,
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStrategies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, mounted]);

  useEffect(() => {
    if (mounted && status === "authenticated") {
      fetchStrategies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFavorites, mounted, status]);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const url = showFavorites
        ? "/api/strategies?favorites=true"
        : "/api/strategies";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStrategies(data.data);
      }
    } catch (error) {
      toast.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  };

  const filteredStrategies = useMemo(() => {
    return strategies.filter((strategy) => {
      const matchesSearch =
        searchQuery === "" ||
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        strategy.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesRisk =
        filterRisk === "all" || strategy.riskLevel === filterRisk;
      const matchesAsset =
        filterAsset === "all" || strategy.assetClass === filterAsset;

      return matchesSearch && matchesRisk && matchesAsset;
    });
  }, [strategies, searchQuery, filterRisk, filterAsset]);

  const stats = useMemo(() => {
    return {
      total: strategies.length,
      byRisk: {
        Low: strategies.filter((s) => s.riskLevel === "Low").length,
        Medium: strategies.filter((s) => s.riskLevel === "Medium").length,
        High: strategies.filter((s) => s.riskLevel === "High").length,
        "Very High": strategies.filter((s) => s.riskLevel === "Very High")
          .length,
      },
      byAsset: {
        Stocks: strategies.filter((s) => s.assetClass === "Stocks").length,
        Crypto: strategies.filter((s) => s.assetClass === "Crypto").length,
        Forex: strategies.filter((s) => s.assetClass === "Forex").length,
        Futures: strategies.filter((s) => s.assetClass === "Futures").length,
        Options: strategies.filter((s) => s.assetClass === "Options").length,
      },
    };
  }, [strategies]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      riskLevel: "Medium",
      assetClass: "Stocks",
      parameters: { entry: "", exit: "", timeframe: "1h" },
      tags: "",
      backtestPerformance: "",
      isPublic: false,
    });
    setEditingStrategy(null);
  };

  const handleCreate = async () => {
    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
          parameters: formData.parameters,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Strategy created successfully!");
        setCreateDialogOpen(false);
        resetForm();
        fetchStrategies();
      } else {
        toast.error(data.error || "Failed to create strategy");
      }
    } catch (error) {
      toast.error("Failed to create strategy");
    }
  };

  const handleEdit = (strategy: TradingStrategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      riskLevel: strategy.riskLevel,
      assetClass: strategy.assetClass,
      parameters: strategy.parameters as {
        entry: string;
        exit: string;
        timeframe: string;
      },
      tags: strategy.tags?.join(", ") || "",
      backtestPerformance: strategy.backtestPerformance || "",
      isPublic: strategy.isPublic || false,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingStrategy) return;

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/strategies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editingStrategy._id,
          ...formData,
          tags,
          parameters: formData.parameters,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Strategy updated successfully!");
        setEditDialogOpen(false);
        resetForm();
        fetchStrategies();
      } else {
        toast.error(data.error || "Failed to update strategy");
      }
    } catch (error) {
      toast.error("Failed to update strategy");
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/strategies/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (data.success) {
        const generated = data.data;
        setFormData({
          name: generated.name,
          description: generated.description,
          riskLevel: generated.riskLevel,
          assetClass: generated.assetClass,
          parameters: generated.parameters,
          tags: generated.tags?.join(", ") || "",
          backtestPerformance: generated.backtestPerformance || "",
          isPublic: false,
        });
        setGenerateDialogOpen(false);
        setCreateDialogOpen(true);
        toast.success("Strategy generated! Review and save it.");
      } else {
        toast.error(data.error || "Failed to generate strategy");
      }
    } catch (error) {
      toast.error("Failed to generate strategy");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this strategy?")) return;

    try {
      const res = await fetch(`/api/strategies?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Strategy deleted successfully");
        fetchStrategies();
      } else {
        toast.error(data.error || "Failed to delete strategy");
      }
    } catch (error) {
      toast.error("Failed to delete strategy");
    }
  };

  const handleToggleTemplate = async (strategy: TradingStrategy) => {
    try {
      if (strategy.isTemplate) {
        // Remove template status
        const res = await fetch(
          `/api/strategies/templates?id=${strategy._id}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (data.success) {
          toast.success("Template status removed");
          fetchStrategies();
        } else {
          toast.error(data.error || "Failed to remove template status");
        }
      } else {
        // Mark as template
        const res = await fetch("/api/strategies/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategyId: strategy._id }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Strategy marked as template");
          fetchStrategies();
        } else {
          toast.error(data.error || "Failed to mark as template");
        }
      }
    } catch (error) {
      toast.error("Failed to update template status");
    }
  };

  // Show loading state during initial load or when not mounted
  if (
    !mounted ||
    status === "loading" ||
    (loading && strategies.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <DashboardStatsSkeleton />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StrategyCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Redirect if not authenticated (handled in useEffect, but show loading here)
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">Redirecting to login...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">Please sign in to continue</div>
          </div>
        </main>
      </div>
    );
  }

  const StrategyForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Strategy name"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Detailed description"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Risk Level</Label>
          <Select
            value={formData.riskLevel}
            onValueChange={(value: RiskLevel) =>
              setFormData({ ...formData, riskLevel: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Very High">Very High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Asset Class</Label>
          <Select
            value={formData.assetClass}
            onValueChange={(value: AssetClass) =>
              setFormData({ ...formData, assetClass: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Stocks">Stocks</SelectItem>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="Forex">Forex</SelectItem>
              <SelectItem value="Futures">Futures</SelectItem>
              <SelectItem value="Options">Options</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Entry Condition</Label>
        <Input
          value={formData.parameters.entry}
          onChange={(e) =>
            setFormData({
              ...formData,
              parameters: { ...formData.parameters, entry: e.target.value },
            })
          }
          placeholder="e.g., RSI < 30"
        />
      </div>
      <div>
        <Label>Exit Condition</Label>
        <Input
          value={formData.parameters.exit}
          onChange={(e) =>
            setFormData({
              ...formData,
              parameters: { ...formData.parameters, exit: e.target.value },
            })
          }
          placeholder="e.g., RSI > 70"
        />
      </div>
      <div>
        <Label>Timeframe</Label>
        <Input
          value={formData.parameters.timeframe}
          onChange={(e) =>
            setFormData({
              ...formData,
              parameters: {
                ...formData.parameters,
                timeframe: e.target.value,
              },
            })
          }
          placeholder="e.g., 1h, 4h, 1d"
        />
      </div>
      <div>
        <Label>Backtest Performance (optional)</Label>
        <Input
          value={formData.backtestPerformance}
          onChange={(e) =>
            setFormData({ ...formData, backtestPerformance: e.target.value })
          }
          placeholder="e.g., Win Rate: 68%, Sharpe: 1.8"
        />
      </div>
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="momentum, RSI, crypto"
        />
      </div>
      <Button onClick={isEdit ? handleUpdate : handleCreate} className="w-full">
        {isEdit ? "Update Strategy" : "Create Strategy"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and analyze your trading strategies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription>Total Strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All strategies</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Low Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.byRisk.Low}</div>
              <p className="text-xs text-gray-500 mt-1">Conservative</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardDescription>Medium Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.byRisk.Medium}</div>
              <p className="text-xs text-gray-500 mt-1">Balanced</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardDescription>High Risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.byRisk.High + stats.byRisk["Very High"]}
              </div>
              <p className="text-xs text-gray-500 mt-1">Aggressive</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search strategies..."
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
                Showing {filteredStrategies.length} of {strategies.length}{" "}
                strategies
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

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={showFavorites ? "default" : "outline"}
            className="gap-2"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Heart
              className={`h-4 w-4 ${showFavorites ? "fill-red-500" : ""}`}
            />
            {showFavorites ? "All Strategies" : "Favorites"}
          </Button>
          <Dialog
            open={generateDialogOpen}
            onOpenChange={setGenerateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Strategy with AI</DialogTitle>
                <DialogDescription>
                  Describe the trading strategy you want to create
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Strategy Description</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Create a momentum strategy for crypto that uses RSI and MACD indicators with a 4-hour timeframe"
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Strategy
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Strategy</DialogTitle>
                <DialogDescription>
                  Add a new trading strategy to your collection
                </DialogDescription>
              </DialogHeader>
              <StrategyForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Strategies Grid */}
        {filteredStrategies.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {strategies.length === 0
                  ? "No strategies yet"
                  : "No strategies match your filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {strategies.length === 0
                  ? "Get started by creating your first trading strategy"
                  : "Try adjusting your search or filters"}
              </p>
              {strategies.length === 0 ? (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Strategy
                </Button>
              ) : (
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
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy._id}
                strategy={strategy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleTemplate={handleToggleTemplate}
              />
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Strategy</DialogTitle>
              <DialogDescription>
                Update your trading strategy details
              </DialogDescription>
            </DialogHeader>
            <StrategyForm isEdit />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
