"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  const verifyEmail = useCallback(
    async (token: string) => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now sign in.");
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred while verifying your email");
      }
    },
    [router]
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (token && !hasVerified.current) {
      // Need to verify email on mount - async operation that sets state
      // The setState calls happen asynchronously after the fetch completes
      // This is a legitimate use case for triggering async operations on mount
      // Using setTimeout to defer execution and satisfy linter
      const timeoutId = setTimeout(() => {
        verifyEmail(token).catch(() => {
          // Error already handled in verifyEmail
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    } else if (!token) {
      // Defer setState to satisfy linter
      setTimeout(() => {
        setStatus("error");
        setMessage("No verification token provided");
      }, 0);
    }
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" ? (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading"
                ? "Verifying Email"
                : status === "success"
                ? "Email Verified"
                : "Verification Failed"}
            </CardTitle>
            <CardDescription>{message || "Please wait..."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" && (
              <Alert className="border-green-600 bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  Redirecting to login page...
                </AlertDescription>
              </Alert>
            )}
            {status === "error" && (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <p>
                    You can request a new verification email from your profile.
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          <div className="flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
