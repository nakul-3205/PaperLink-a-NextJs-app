// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { ArrowRight, FileText, Share2, History, ShieldCheck } from 'lucide-react'

// Import the new components
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { WavyBackground } from "@/components/ui/wavy-background";
import { WobbleCard } from "@/components/ui/wobble-card";

// Define the words for the TextGenerateEffect
const heroWords = `Connect, Collaborate, Create. Seamlessly share ideas and documents in real-time. Where innovation takes shape, together.`;

export default function HomePage() {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialClientTheme = storedTheme || (prefersDark ? 'dark' : 'light')

      if (initialClientTheme !== theme) {
        setTheme(initialClientTheme)
      }
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // Define dynamic colors for WavyBackground based on theme
  const wavyBackgroundColors = theme === 'dark'
    ? ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"] // Earthy dark tones for dark mode waves
    : ["#8b5cf6", "#a78bfa", "#c4b5fd", "#e0c2ff"]; // Vibrant to pastel purples for light mode waves

  const wavyBackgroundFill = theme === 'dark' ? "#0f172a" : "#f5f3ff"; // Dark background for dark mode, very light purple for light mode

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 relative overflow-hidden">
      {/* Absolute positioned theme toggle */}
      {mounted && (
        <div className="absolute top-6 right-6 z-30 flex items-center space-x-2">
          {theme === 'light' ? (
            <SunIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <MoonIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      )}

      {/* Hero Section with Wavy Background */}
      <WavyBackground
        className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-24 relative z-10"
        colors={wavyBackgroundColors}
        backgroundFill={wavyBackgroundFill}
        waveWidth={80}
        speed="normal"
        waveOpacity={0.6}
        blur={8}
      >
        <div className="relative z-20 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          {/* Hero text color for light mode: text-gray-800, for dark mode: dark:text-white */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight drop-shadow-lg [text-shadow:0px_0px_20px_rgba(0,0,0,0.5)] text-gray-800 dark:text-white">
            PaperLink
          </h1>

          {/* Text Generate Effect for the tagline - also uses adaptive colors */}
          <TextGenerateEffect
            words={heroWords}
            className="text-lg md:text-xl lg:text-2xl text-center font-normal leading-relaxed text-gray-700 dark:text-gray-200"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-700">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                // Adjusted Sign In button for light mode: dark border, dark text
                className="px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group
                           border-gray-700 text-gray-700 hover:bg-gray-100
                           dark:border-white dark:text-white dark:hover:bg-white/10"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </WavyBackground>

      {/* Feature Section with Wobble Cards */}
      <section className="py-16 px-4 md:px-8 bg-background transition-colors duration-500 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground animate-fade-in">
          Designed for Your Workflow
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          {/* Card 1: Real-time Editing */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-blue-700 dark:bg-blue-900 min-h-[400px] flex items-center justify-center p-8 md:p-12"
          >
            <div className="max-w-md text-center md:text-left">
              <FileText className="h-10 w-10 text-white mb-4" />
              <h3 className="text-left text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white mb-4">
                Collaborate in Real-time, Seamlessly
              </h3>
              <p className="mt-4 text-left text-base/6 text-blue-100 dark:text-blue-200">
                Co-author documents with your team, seeing every change instantly as it happens, eliminating version conflicts.
              </p>
            </div>
          </WobbleCard>

          {/* Card 2: Version History */}
          <WobbleCard
            containerClassName="col-span-1 bg-purple-700 dark:bg-purple-900 min-h-[400px] flex items-center justify-center p-8 md:p-12"
          >
            <div className="max-w-md text-center md:text-left">
              <History className="h-10 w-10 text-white mb-4" />
              <h3 className="text-left text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white mb-4">
                Full Version History & Snapshots
              </h3>
              <p className="mt-4 text-left text-base/6 text-purple-100 dark:text-purple-200">
                Never lose a single change. Revert to any previous version of your document with ease and confidence.
              </p>
            </div>
          </WobbleCard>

          {/* Card 3: Secure Sharing & Permissions */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-3 bg-teal-700 dark:bg-teal-900 min-h-[400px] flex items-center justify-center p-8 md:p-12"
          >
            <div className="max-w-2xl text-center">
              <ShieldCheck className="h-10 w-10 text-white mb-4 mx-auto" />
              <h3 className="text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white mb-4">
                Secure Sharing & Granular Permissions
              </h3>
              <p className="mt-4 max-w-4xl text-base/6 text-teal-100 dark:text-teal-200 mx-auto">
                Share your documents securely with anyone, anywhere, while maintaining complete control over who can view, edit, or comment.
              </p>
            </div>
          </WobbleCard>
        </div>
      </section>

      {/* Footer - "Made by" credit */}
      <footer className="p-4 text-center text-sm text-muted-foreground bg-background/50 backdrop-blur-sm z-20 border-t border-border/50">
        Made with ❤️ by <span className="font-semibold text-foreground">Nakul Kejriwal</span>
      </footer>
    </div>
  );
}