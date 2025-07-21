// app/(frontend)/sign-in/page.tsx
'use client'

import { useSignIn } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // <--- Ensured Link is imported
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons' // For theme icons
import { toast } from 'sonner'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Theme state and logic (consistent with SignUpPage)
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

  const handleSignIn = async () => {
    if (!isLoaded) return
    setError('') // Clear previous errors

    try {
      const result = await signIn.create({ identifier: email, password })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success("Signed in successfully! 🎉", {
            description: "Welcome back to PaperLink! Redirecting to your dashboard...",
            duration: 3000,
            onAutoClose: () => router.push('/dashboard'),
        });
      } else {
        // This block might be hit for multi-factor authentication steps if configured
        // For a simple email/password flow, usually `complete` is the only status after successful credential submission.
        console.error("Unexpected sign in status:", result.status, result);
        const errorMessage = result.errors?.[0]?.message || 'An unexpected sign in step occurred. Please try again.';
        setError(errorMessage);
        toast.error("Sign-In Failed 🙁", { description: errorMessage, duration: 5000 });
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || 'Something went wrong during sign in. Please try again.';
      setError(errorMessage);
      toast.error("Sign-In Failed 🙁", {
        description: errorMessage,
        duration: 5000,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-background text-foreground overflow-hidden relative">
      {/* Theme Toggle Button - only render after mounted to avoid hydration mismatch */}
      {mounted && (
        <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
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

      {/* Left Section: Marketing/Illustration - Exactly like Signup */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen items-center justify-center p-12 overflow-hidden
                    bg-gradient-to-br from-blue-700 to-purple-800 dark:from-gray-900 dark:to-black
                    text-white">
        {/* Subtle Aceternity-like grid/dots effect */}
        <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(var(--tw-gradient-stops))] from-blue-400/30 to-transparent dark:from-gray-700/30 dark:to-transparent animate-pulse-slow"></div>
        </div>

        {/* Wave SVG Background */}
        <div className="absolute bottom-0 left-0 w-full h-auto text-white dark:text-gray-800 opacity-20 dark:opacity-10">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
                <path
                    fill="currentColor"
                    fillOpacity="0.1"
                    d="M0,192L48,192C96,192,192,192,288,181.3C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
                <path
                    fill="currentColor"
                    fillOpacity="0.2"
                    d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,208C672,192,768,160,864,154.7C960,149,1056,171,1152,186.7C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
            </svg>
        </div>

        <div className="relative z-10 text-center p-6 drop-shadow-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight animate-fade-in-up">
            Welcome Back to <span className="text-yellow-300 dark:text-teal-300">PaperLink</span> 🔗
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-90 animate-fade-in-up delay-100 mt-4">
            Your ideas are waiting. Sign in to resume your creative flow.
          </p>
        </div>
      </div>

      {/* Right Section: Sign-In Form - Similar to Signup, adapted for Signin */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <Card className="p-8 sm:p-10 rounded-lg shadow-2xl w-full max-w-md border border-border transition-all duration-500 hover:shadow-xl">
          <CardHeader className="text-center mb-8">
            <CardTitle className="text-3xl sm:text-4xl font-extrabold mb-2">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md animate-fade-in border border-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={handleSignIn}
              className="w-full py-2 sm:py-3 text-base sm:text-lg font-semibold transform hover:-translate-y-0.5"
              size="lg"
              disabled={!isLoaded || !email || !password}
            >
              Sign In
            </Button>
          </CardContent>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don’t have an account?{' '}
            <Link href="/sign-up" className="text-primary hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}