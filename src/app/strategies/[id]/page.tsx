"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingStrategy } from "@/types";
import { StrategyComments } from "@/components/strategy-comments";
import { StrategyRating } from "@/components/strategy-rating";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  BarChart3,
  TrendingUp,
  FileText,
  Tag,
  Clock,
  Copy,
  Download,
  Heart,
  Share2,
} from "lucide-react";

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [strategy, setStrategy] = useState<TradingStrategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStrategy();
    }
  }, [params.id]);

  const fetchStrategy = async () => {
    try {
      // Try to get from all strategies first (includes user's own)
      const res = await fetch("/api/strategies");
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(
          (s: TradingStrategy) => s._id === params.id
        );
        if (found) {
          setStrategy(found);
          // Also fetch comments and ratings if public
          if (found.isPublic) {
            fetchCommentsAndRatings();
          }
        } else {
          // Try public strategies
          const publicRes = await fetch("/api/strategies?public=true");
          const publicData = await publicRes.json();
          if (publicData.success) {
            const publicFound = publicData.data.find(
              (s: TradingStrategy) => s._id === params.id
            );
            if (publicFound) {
              setStrategy(publicFound);
              fetchCommentsAndRatings();
            } else {
              toast.error("Strategy not found");
              router.push("/dashboard");
            }
          } else {
            toast.error("Strategy not found");
            router.push("/dashboard");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load strategy");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsAndRatings = async () => {
    // Comments and ratings are fetched by their respective components
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-24 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!strategy) return null;

  const riskColors = {
    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Very High": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-3">
                    {strategy.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {strategy.description.split("\n")[0]}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`${riskColors[strategy.riskLevel]} font-medium`}
                    variant="outline"
                  >
                    <BarChart3 className="mr-1 h-3 w-3" />
                    {strategy.riskLevel}
                  </Badge>
                  <Badge variant="outline" className="font-medium">
                    {strategy.assetClass}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {strategy.description}
              </p>
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Trading Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(strategy.parameters).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-base font-semibold">
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance & Tags */}
          <div className="grid md:grid-cols-2 gap-6">
            {strategy.backtestPerformance && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Backtest Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {strategy.backtestPerformance}
                  </p>
                </CardContent>
              </Card>
            )}

            {strategy.tags && strategy.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {strategy.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          {strategy.isPublic && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/strategies/copy", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ strategyId: strategy._id }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast.success("Strategy copied!");
                          router.push("/dashboard");
                        } else {
                          toast.error(data.error || "Failed to copy");
                        }
                      } catch (error) {
                        toast.error("Failed to copy strategy");
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Strategy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `/api/strategies/export?format=json&id=${strategy._id}`
                        );
                        if (res.ok) {
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `strategy-${
                            strategy.name
                          }-${Date.now()}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success("Strategy exported!");
                        }
                      } catch (error) {
                        toast.error("Failed to export");
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/strategies/${strategy._id}`
                      );
                      toast.success("Link copied to clipboard!");
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          <StrategyRating
            strategyId={strategy._id}
            isPublic={strategy.isPublic}
            currentRating={strategy.averageRating}
          />

          {/* Comments */}
          <StrategyComments
            strategyId={strategy._id}
            isPublic={strategy.isPublic}
          />

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created:{" "}
                    {new Date(strategy.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {strategy.updatedAt !== strategy.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Updated:{" "}
                      {new Date(strategy.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
                {strategy.copyCount && strategy.copyCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    <span>Copied {strategy.copyCount} times</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
