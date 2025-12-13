"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TradingStrategy } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  TrendingUp,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Heart,
  Copy,
  Download,
  Star,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Props for StrategyCard component
 * @interface StrategyCardProps
 */
interface StrategyCardProps {
  /** The trading strategy data to display */
  strategy: TradingStrategy;
  /** Callback function when strategy is edited */
  onEdit?: (strategy: TradingStrategy) => void;
  /** Callback function when strategy is deleted */
  onDelete?: (id: string) => void;
  /** Callback function when template status is toggled */
  onToggleTemplate?: (strategy: TradingStrategy) => void;
  /** Whether to show action buttons (edit, delete, etc.) */
  showActions?: boolean;
  /** Callback function when favorite status changes */
  onFavoriteChange?: () => void;
}

/**
 * StrategyCard Component
 *
 * Displays a trading strategy in a card format with actions, badges, and metadata.
 * Supports favorites, copying, exporting, and template management.
 *
 * @param {StrategyCardProps} props - Component props
 * @returns {JSX.Element} Strategy card component
 * @example
 * <StrategyCard
 *   strategy={strategy}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onToggleTemplate={handleToggleTemplate}
 * />
 */
/**
 * StrategyCard Component
 *
 * Displays a trading strategy in a card format with actions, badges, and metadata.
 * Supports favorites, copying, exporting, and template management.
 *
 * @param {StrategyCardProps} props - Component props
 * @returns {JSX.Element} Strategy card component
 * @example
 * <StrategyCard
 *   strategy={strategy}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onToggleTemplate={handleToggleTemplate}
 * />
 */
export function StrategyCard({
  strategy,
  onEdit,
  onDelete,
  onToggleTemplate,
  showActions = true,
  onFavoriteChange,
}: StrategyCardProps) {
  /** Whether this strategy is favorited by the current user */
  const [isFavorite, setIsFavorite] = useState(false);
  /** Loading state for async operations */
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (strategy.isPublic && showActions) {
      checkFavorite();
    }
  }, [strategy._id, strategy.isPublic, showActions]);

  const checkFavorite = async () => {
    try {
      const res = await fetch(
        `/api/strategies/favorite?strategyId=${strategy._id}`
      );
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const riskColors = {
    Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Very High": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/strategies/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId: strategy._id }),
      });

      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);
        toast.success(
          data.favorited ? "Added to favorites" : "Removed from favorites"
        );
        onFavoriteChange?.();
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("/api/strategies/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId: strategy._id }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Strategy copied successfully!");
      } else {
        toast.error(data.error || "Failed to copy strategy");
      }
    } catch (error) {
      toast.error("Failed to copy strategy");
    }
  };

  const handleExport = async (e: React.MouseEvent, format: "json" | "csv") => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(
        `/api/strategies/export?format=${format}&id=${strategy._id}`
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `strategy-${strategy.name}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Strategy exported as ${format.toUpperCase()}`);
      } else {
        toast.error("Failed to export strategy");
      }
    } catch (error) {
      toast.error("Failed to export strategy");
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
              {strategy.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1.5 text-sm">
              {strategy.description}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
              {strategy.isPublic && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleFavorite}
                  disabled={loading}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(strategy)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/strategies/${strategy._id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {strategy.isPublic && (
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Strategy
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => handleExport(e, "json")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleExport(e, "csv")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                  {onToggleTemplate && (
                    <DropdownMenuItem
                      onClick={() => onToggleTemplate(strategy)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {strategy.isTemplate
                        ? "Remove Template"
                        : "Mark as Template"}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(strategy._id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {strategy.isTemplate && (
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 font-medium"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Template
            </Badge>
          )}
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
          {strategy.averageRating && strategy.averageRating > 0 && (
            <Badge variant="secondary" className="font-medium">
              <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
              {strategy.averageRating.toFixed(1)}
            </Badge>
          )}
          {strategy.tags?.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {strategy.tags && strategy.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{strategy.tags.length - 2}
            </Badge>
          )}
        </div>

        {strategy.backtestPerformance && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="line-clamp-1">{strategy.backtestPerformance}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(strategy.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <Link href={`/strategies/${strategy._id}`}>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              View Details
              <Eye className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
