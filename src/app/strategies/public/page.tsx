"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { StrategyCard } from "@/components/strategy-card";
import { StrategyCardSkeleton } from "@/components/loading-skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingStrategy } from "@/types";
import { Search, Filter, X, Globe, TrendingUp } from "lucide-react";

export default function PublicStrategiesPage() {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterAsset, setFilterAsset] = useState<string>("all");

  useEffect(() => {
    fetchPublicStrategies();
  }, []);

  const fetchPublicStrategies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/strategies?public=true");
      const data = await res.json();
      if (data.success) {
        setStrategies(data.data);
      }
    } catch (error) {
      console.error("Failed to load strategies");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Public Strategies
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and explore trading strategies shared by the community
          </p>
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

        {/* Strategies Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StrategyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredStrategies.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {strategies.length === 0
                  ? "No public strategies yet"
                  : "No strategies match your filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {strategies.length === 0
                  ? "Be the first to share a strategy with the community"
                  : "Try adjusting your search or filters"}
              </p>
              {strategies.length > 0 && (
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
                showActions={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
