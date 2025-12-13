import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Strategy Generation",
      description:
        "Generate trading strategies using advanced AI powered by Groq. Describe your idea and get a complete strategy in seconds.",
    },
    {
      icon: BarChart3,
      title: "Strategy Management",
      description:
        "Create, edit, and organize your trading strategies in one place. Track performance and manage risk levels.",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description:
        "Monitor backtest results and track strategy performance metrics to make data-driven decisions.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description:
        "Categorize strategies by risk level and asset class. Stay organized and make informed trading decisions.",
    },
    {
      icon: Globe,
      title: "Public Marketplace",
      description:
        "Browse and discover strategies shared by the community. Learn from others and share your own.",
    },
    {
      icon: Zap,
      title: "Fast & Responsive",
      description:
        "Built with Next.js 16 and modern technologies for a smooth, fast experience across all devices.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                AI-Powered Trading Strategies
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Quant Finance Hub
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create, manage, and learn quantitative trading strategies with the
              power of AI. Build your trading system with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/strategies/public">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-lg px-8"
                >
                  <Globe className="h-5 w-5" />
                  Browse Strategies
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you build and manage trading
              strategies effectively
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-purple-500"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                Ready to get started?
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Join thousands of traders building better strategies with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
