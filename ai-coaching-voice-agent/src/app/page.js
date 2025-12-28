"use client";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@stackframe/stack";
import { Brain, Mic, BookOpen, Languages, Heart, Sparkles, ArrowRight, CheckCircle2, Zap, Users, Globe } from "lucide-react";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";

export default function Home() {
  const user = useUser();

  const features = [
    { icon: BookOpen, title: "Smart Lectures", desc: "AI-powered personalized lectures on any topic" },
    { icon: Mic, title: "Mock Interviews", desc: "Practice interviews with real-time AI feedback" },
    { icon: Languages, title: "Language Skills", desc: "Improve your language proficiency naturally" },
    { icon: Heart, title: "Meditation", desc: "Guided meditation sessions for mindfulness" },
  ];

  const benefits = [
    "Real-time voice conversations with AI",
    "Personalized learning paths",
    "Instant feedback and notes",
    "Track your progress over time",
    "Available 24/7, anywhere",
    "Multiple learning modes",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-fuchsia-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-violet-600" />
            <span className="text-2xl font-bold bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Brane Storm
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-700 hover:text-violet-600 hover:bg-violet-50">Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/handler/sign-in">
                  <Button variant="ghost" className="text-gray-700 hover:text-violet-600 hover:bg-violet-50">Sign In</Button>
                </Link>
                <Link href="/handler/sign-up">
                  <Button className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-violet-200 shadow-sm">
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-900 leading-tight tracking-tight">
                Learn Smarter with
                <br />
                <span className="bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Voice AI Coaching
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
                Experience personalized learning through natural voice conversations. 
                Master interviews, languages, and new topics with your AI companion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={user ? "/dashboard" : "/handler/sign-up"}>
                  <Button size="lg" className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg px-8 py-6 shadow-xl shadow-violet-500/30 transition-all hover:scale-105">
                    Start Learning Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-gray-200 hover:border-violet-200 hover:bg-violet-50 text-gray-700">
                  Watch Demo
                </Button>
              </div>
            </div>
          </BlurFade>

          {/* Stats */}
          <BlurFade delay={0.3}>
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-200 shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-violet-600">10K+</div>
                <div className="text-gray-600 font-medium">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-fuchsia-600">50K+</div>
                <div className="text-gray-600 font-medium">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-violet-600">4.9★</div>
                <div className="text-gray-600 font-medium">User Rating</div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Learning Modes</h2>
              <p className="text-xl text-gray-600 font-medium">Choose how you want to learn and grow</p>
            </div>
          </BlurFade>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <BlurFade key={feature.title} delay={0.1 + index * 0.1}>
                <div className="group p-8 rounded-3xl bg-linear-to-br from-white to-violet-50 hover:from-violet-100 hover:to-fuchsia-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100 hover:border-violet-200">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/20">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <BlurFade delay={0.1}>
              <div>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose Brane Storm?</h2>
                <p className="text-xl text-gray-600 mb-8 font-medium">
                  Our AI understands you. It adapts to your learning style, 
                  pace, and goals to provide the most effective learning experience.
                </p>
                <div className="grid gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      <span className="text-lg text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-violet-400 to-fuchsia-400 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-linear-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">AI Coaching Session</div>
                      <div className="text-sm text-gray-500">Real-time conversation</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-violet-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                      <p className="text-sm text-violet-900 font-medium">Hello! I'm ready to help you practice for your interview. What role are you preparing for?</p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tr-none p-4 max-w-xs ml-auto">
                      <p className="text-sm text-gray-800">I'm preparing for a software engineer position at a tech company.</p>
                    </div>
                    <div className="bg-violet-100 rounded-2xl rounded-tl-none p-4 max-w-xs">
                      <p className="text-sm text-violet-900 font-medium">Great choice! Let's start with some behavioral questions...</p>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <BlurFade delay={0.1}>
          <div className="max-w-4xl mx-auto bg-linear-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-violet-500/30">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-xl mb-8 opacity-90 font-medium">
              Join thousands of learners already using Brane Storm to achieve their goals.
            </p>
            <Link href={user ? "/dashboard" : "/handler/sign-up"}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-50 text-lg px-8 py-6 shadow-lg transition-transform hover:scale-105">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="w-8 h-8 text-violet-400" />
              <span className="text-2xl font-bold">Brane Storm</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Brane Storm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


