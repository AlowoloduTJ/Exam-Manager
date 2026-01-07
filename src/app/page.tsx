"use client";

import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 text-center">
          {/* Coming Soon Badge */}
          <AnimatedGradientText>
            <Badge variant="secondary" className="border-none bg-transparent px-0 text-sm">
              🚀 Coming Soon
            </Badge>
          </AnimatedGradientText>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Transforming Academic Assessment
            </span>
            <br />
            <span className="bg-gradient-to-r from-foreground/70 to-foreground/50 bg-clip-text text-transparent">
              with AI-Powered Integrity
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Secure, fair, and efficient examination management for higher-education institutions. 
            On-premise deployment with full institutional control.
          </p>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Problem & Audience Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Card className="border-2">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mb-4 w-fit mx-auto">
                The Challenge
              </Badge>
              <CardTitle className="text-3xl sm:text-4xl">
                Universities Need Better Examination Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-lg text-muted-foreground">
                Universities face persistent challenges in delivering secure, fair, and efficient 
                examinations because existing systems cannot reliably manage large question banks, 
                handwritten assessments, multi-examiner marking, and real-time examination integrity 
                within a single, secure platform.
              </p>
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">Target Audience</h3>
                <p className="text-muted-foreground">
                  Public and private universities, polytechnics, and colleges of education.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Solution Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              Our Solution
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI-Driven Examination Management Platform
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">🤖</div>
                <CardTitle>AI-Powered Proctoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verifies student identity, monitors focus and environmental noise, and enforces 
                  examination rules without manual invigilation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">✍️</div>
                <CardTitle>Multi-Format Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Supports objective tests, essays, technical drawings, and laboratory reports. 
                  Processes both digital and scanned handwritten submissions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">⚖️</div>
                <CardTitle>Fair Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Multi-examiner evaluation engine distributes scripts, analyzes score variance, 
                  and flags scripts requiring moderation for fairness.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">📊</div>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate institution-wide reports, performance trends, and audit-ready results 
                  for authorized university officials.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">🔒</div>
                <CardTitle>On-Premise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All data encrypted and stored within university servers, ensuring privacy, 
                  regulatory compliance, and full institutional control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 text-3xl">⚡</div>
                <CardTitle>Efficient Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reduces administrative burden, accelerates result processing, and strengthens 
                  academic integrity across diverse academic programs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Card className="relative overflow-hidden border-2">
            <BorderBeam size={250} duration={12} delay={0} />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl">
                Get Notified When We Launch
              </CardTitle>
              <CardDescription className="text-base">
                Be among the first to experience secure, AI-powered examination management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Add backend integration
                  alert("Thank you! We'll notify you when we launch.");
                }}
              >
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    className="w-full"
                    aria-label="Email address for launch notifications"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Notify Me
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Exam Manager Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
