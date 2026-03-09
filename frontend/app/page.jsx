import React from "react";
import { ArrowRight, Star, Flame, Clock, Users } from "lucide-react";
import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
// import { SITE_STATS, FEATURES, HOW_IT_WORKS_STEPS } from "@/lib/data";
import PricingSection from "@/components/PricingSection";
import Link from "next/link";

export default async function Home() {

  const { has } = await auth()
  const subscriptionTier = has({ plan: "pro"}) ? "pro" : "free"

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <section className="pt-32 pb-20 px-4">
        <div>
          <div>
            <div>
              <Badge variant="outline" className="border-2 border-orange-600 text-orange-700 bg-orange-50 text-sm font-bold uppercase tracking-wide">🔥#1 AI Cooking Assistant</Badge>

              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-[0.9] tracking-light">
                Turn your{" "}
                <span className="italic underline decoration-4 decoration-orange-600">leftovers</span>{" "}
                into <br />
                masterpieces.
              </h1>

              <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-lg mx-auto md:mx-0 font-light">
                Snap a photo of your fridge. We&apos;ll tell you what to cook.
                Save money, reduce waste, and eat better tonight.
              </p>

              <Link href={"/dashboard"}>
                <Button size="xl" variant="primary" className="px-8 py-6 text-lg">
                  Start Cooking Free<ArrowRight className="ml-2 w-5 h-5"/>
                </Button>
              </Link>

              <p className="mt-6 text-sm text-stone-500">
                <span className="font-bold text-stone-900">10k+ cook</span>{" "} joined last month.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}