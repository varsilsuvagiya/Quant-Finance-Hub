"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface StrategyRatingProps {
  strategyId: string;
  isPublic: boolean;
  currentRating?: number;
}

export function StrategyRating({
  strategyId,
  isPublic,
  currentRating = 0,
}: StrategyRatingProps) {
  const { data: session } = useSession();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(currentRating);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isPublic && strategyId) {
      fetchRating();
    }
  }, [strategyId, isPublic]);

  const fetchRating = async () => {
    try {
      const res = await fetch(
        `/api/strategies/ratings?strategyId=${strategyId}`
      );
      const data = await res.json();
      if (data.success) {
        setAverageRating(data.data.averageRating);
        setTotalRatings(data.data.totalRatings);
        setUserRating(data.data.userRating);
      }
    } catch (error) {
      console.error("Failed to fetch rating");
    }
  };

  const handleRating = async (rating: number) => {
    if (!session) {
      toast.error("Please sign in to rate strategies");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/strategies/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          rating,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUserRating(rating);
        setAverageRating(data.data.averageRating);
        setTotalRatings(data.data.totalRatings);
        toast.success("Rating saved");
      } else {
        toast.error(data.error || "Failed to save rating");
      }
    } catch (error) {
      toast.error("Failed to save rating");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isPublic) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Rating
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={submitting || !session}
                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= (hoveredRating || userRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div>
            <p className="font-semibold">
              {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
            </p>
            <p className="text-xs text-gray-500">
              {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </p>
          </div>
        </div>
        {!session && (
          <p className="text-xs text-gray-500 mt-2">
            Sign in to rate this strategy
          </p>
        )}
      </CardContent>
    </Card>
  );
}
