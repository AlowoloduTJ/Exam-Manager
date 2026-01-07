"use client";

import { AnimatedGradientText } from "./animated-gradient-text";
import { BorderBeam } from "./border-beam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ComingSoonHero() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Badge */}
        <AnimatedGradientText>
          <Badge variant="secondary" className="border-none bg-transparent px-0">
            🚀 Coming Soon
          </Badge>
        </AnimatedGradientText>

        {/* Main heading */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Exam Manager
          </span>
          <br />
          <span className="bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent">
            Platform
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          An AI-driven examination management platform designed for higher-education
          institutions. Secure, fair, and efficient.
        </p>

        {/* CTA Card with Border Beam */}
        <Card className="relative overflow-hidden border-2 p-8">
          <BorderBeam size={250} duration={12} delay={0} />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Get notified when we launch
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto">
                Notify Me
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </Card>

        {/* Features grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <div className="mb-2 text-2xl">🔒</div>
            <h3 className="mb-2 font-semibold">Secure</h3>
            <p className="text-sm text-muted-foreground">
              On-premise deployment with full data control
            </p>
          </Card>
          <Card className="p-6">
            <div className="mb-2 text-2xl">🤖</div>
            <h3 className="mb-2 font-semibold">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent proctoring and evaluation
            </p>
          </Card>
          <Card className="p-6">
            <div className="mb-2 text-2xl">⚡</div>
            <h3 className="mb-2 font-semibold">Efficient</h3>
            <p className="text-sm text-muted-foreground">
              Streamlined workflows and faster results
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
