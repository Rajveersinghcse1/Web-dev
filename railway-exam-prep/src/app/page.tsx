'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Train,
  Brain,
  Trophy,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  Users,
  ChevronRight,
  Star,
  Clock,
  BarChart3
} from 'lucide-react';
import { categoryConfig } from '@/lib/utils';

const examCategories = [
  { name: 'ALP', fullName: 'Assistant Loco Pilot', description: 'Technical & aptitude tests for locomotive pilots', questions: '5000+' },
  { name: 'NTPC', fullName: 'Non-Technical Popular Categories', description: 'For graduate-level railway positions', questions: '8000+' },
  { name: 'D Group', fullName: 'Group D', description: 'Entry-level railway recruitment', questions: '6000+' },
  { name: 'Sectional Controller', fullName: 'Sectional Controller', description: 'Train control room operations', questions: '3000+' },
  { name: 'Technician', fullName: 'Railway Technician', description: 'Technical grade positions', questions: '4000+' },
];

const features = [
  { icon: Brain, title: 'AI-Powered Learning', description: 'Gemini AI analyzes your performance and creates personalized study plans' },
  { icon: TrendingUp, title: 'Exam Trend Analysis', description: 'AI identifies repeated questions and predicts important topics' },
  { icon: Target, title: 'Adaptive Difficulty', description: 'Questions adjust from beginner to pro based on your progress' },
  { icon: Trophy, title: 'Gamification', description: 'XP, levels, streaks, and leaderboards to keep you motivated' },
  { icon: BookOpen, title: 'Study Materials', description: 'Notes, flashcards, and video explanations for every topic' },
  { icon: BarChart3, title: 'Detailed Analytics', description: 'Topic-wise analysis, time tracking, and improvement suggestions' },
];

const stats = [
  { value: '26,000+', label: 'Questions' },
  { value: '50,000+', label: 'Students' },
  { value: '94%', label: 'Success Rate' },
  { value: '5', label: 'Exam Categories' },
];

export default function HomePage() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Train className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold gradient-text">RailwayPrep</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/exams" className="text-slate-300 hover:text-white transition">Exams</Link>
              <Link href="/study" className="text-slate-300 hover:text-white transition">Study</Link>
              <Link href="/leaderboard" className="text-slate-300 hover:text-white transition">Leaderboard</Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-slate-300 hover:text-white transition">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Powered by Gemini AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Master Railway Exams
              <br />
              <span className="gradient-text">With AI Intelligence</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              The most advanced exam preparation platform for Railway recruitment.
              AI analyzes trends, identifies repeated questions, and creates personalized tests
              to take you from beginner to pro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/exams" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Start Practicing <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/study" className="btn-secondary text-lg px-8 py-4">
                Explore Study Materials
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Exam</h2>
            <p className="text-slate-400 text-lg">Comprehensive preparation for all Railway recruitment exams</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examCategories.map((category, index) => {
              const config = categoryConfig[category.name] || categoryConfig.ALP;
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link href={`/exams/${category.name.toLowerCase().replace(' ', '-')}`}>
                    <div className={`glass-card p-6 cursor-pointer card-hover ${hoveredCategory === category.name ? 'glow' : ''}`}>
                      <div className={`w-16 h-16 rounded-2xl ${config.gradient} flex items-center justify-center text-3xl mb-4`}>
                        {config.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-slate-400 mb-2">{category.fullName}</p>
                      <p className="text-slate-300 text-sm mb-4">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-400">{category.questions} Questions</span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why RailwayPrep?</h2>
            <p className="text-slate-400 text-lg">Cutting-edge features to accelerate your preparation</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Trend Analysis Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">AI-Powered Analysis</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Smart Exam Preparation
                <br />
                <span className="gradient-text">Backed by Data</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Trend Detection</h4>
                    <p className="text-slate-400 text-sm">AI analyzes 8+ years of PYQs to identify increasing/decreasing topic patterns</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Repeated Question Finder</h4>
                    <p className="text-slate-400 text-sm">Identifies questions that appear multiple times across exams</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Topic Importance Scoring</h4>
                    <p className="text-slate-400 text-sm">Know exactly which topics to prioritize based on importance scores</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Test Generation</h4>
                    <p className="text-slate-400 text-sm">Creates tests focused on high-probability questions and your weak areas</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <h4 className="text-lg font-semibold mb-4">Topic Importance Preview - NTPC</h4>
              <div className="space-y-4">
                {[
                  { topic: 'General Awareness', importance: 92, trend: 'increasing' },
                  { topic: 'Mathematics', importance: 85, trend: 'stable' },
                  { topic: 'Reasoning', importance: 78, trend: 'increasing' },
                  { topic: 'General Science', importance: 65, trend: 'stable' },
                  { topic: 'Current Affairs', importance: 88, trend: 'increasing' },
                ].map((item) => (
                  <div key={item.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${item.trend === 'increasing' ? 'text-green-400' : 'text-slate-400'}`}>
                          {item.trend === 'increasing' ? '↑' : '→'} {item.trend}
                        </span>
                        <span className="text-sm font-semibold text-blue-400">{item.importance}%</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of aspirants who have cracked railway exams using our AI-powered platform.
                Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  Start Free Trial <ChevronRight className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-5 h-5" />
                  <span>50,000+ students already enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Train className="w-6 h-6 text-blue-500" />
              <span className="font-bold">RailwayPrep</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
            </div>
            <div className="text-sm text-slate-500">
              © 2025 RailwayPrep. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
