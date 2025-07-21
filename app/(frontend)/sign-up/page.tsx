// app/sign-up/page.tsx
'use client'

import { useSignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const router = useRouter()

  // Initialize theme state to 'light' (or any default) for SSR
  // This value will be used for the *initial* render on both server and client.
  const [theme, setTheme] = useState('light');
  // Use a `mounted` state to indicate when client-side logic has run
  const [mounted, setMounted] = useState(false);

  // Effect 1: Initialize theme ONCE on component mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure window is available (though 'use client' handles this)
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Calculate the initial theme based on client preferences/storage
      const initialClientTheme = storedTheme || (prefersDark ? 'dark' : 'light');

      // Only update state if the initial client theme is different from the SSR default ('light')
      if (initialClientTheme !== theme) {
        setTheme(initialClientTheme);
      }
      // Regardless, mark as mounted after checking storage/preferences
      setMounted(true);
    }
  }, []); // Empty dependency array means this effect runs only ONCE after the initial render

  // Effect 2: Apply the theme class to HTML and update localStorage whenever `theme` changes
  useEffect(() => {
    if (mounted) { // Ensure this only runs AFTER the first useEffect has completed its initial setup
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]); // Depend on theme and mounted. `mounted` ensures it runs after initial setup.

  // Effect to show toast when entering OTP verification state for the first time
  useEffect(() => {
    if (pendingVerification) {
      toast.info(`A 6-digit verification code has been sent to ${email}.`, {
        description: "Please check your inbox (and spam folder) for the code.",
        duration: 5000,
        id: 'otp-sent-initial'
      });
    }
  }, [pendingVerification, email]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        // When user toggles, immediately update localStorage and class (via Effect 2)
        // No need to explicitly call localStorage.setItem here if Effect 2 handles it.
        return newTheme;
    });
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;
    setError('');

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName,
        lastName: lastName,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success("Account Created! 🎉", {
            description: "Welcome to PaperLink! Redirecting to your dashboard...",
            duration: 3000,
            onAutoClose: () => router.push('/dashboard'),
        });
        return;
      }

      if (result.status === 'needs_email_address_verification' || result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else {
        console.error("Unexpected sign up status:", result.status, result);
        const errorMessage = result.errors?.[0]?.message || 'An unexpected sign up step occurred. Please try again.';
        setError(errorMessage);
        toast.error("Sign-Up Failed 🙁", { description: errorMessage, duration: 5000 });
      }

    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || 'Something went wrong during sign up. Please try again.';
      setError(errorMessage);
      toast.error("Sign-Up Failed 🙁", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleVerifyEmail = async () => {
    if (!isLoaded) return;
    setError('');

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      toast.error("Invalid Code Length", {
        description: "The verification code must be 6 digits long.",
        duration: 3000,
      });
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success("Account Created! 🎉", {
          description: "Welcome to PaperLink! Redirecting to your dashboard...",
          duration: 3000,
          onAutoClose: () => router.push('/dashboard'),
        });
      } else {
        console.error("Clerk verification status not 'complete':", JSON.stringify(completeSignUp, null, 2));
        const errorMessage = completeSignUp.errors?.[0]?.message || 'Verification not complete. Please check the code or try again.';
        setError(errorMessage);
        toast.error("Verification Failed ❌", {
          description: errorMessage,
          duration: 5000,
        });
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || 'Something went wrong during verification. Please try again.';
      setError(errorMessage);
      toast.error("Verification Error 🙁", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !email) return;
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.info("Code Re-sent! 📬", {
        description: "A new verification code has been sent to your email.",
        duration: 3000,
        id: 'otp-resend'
      });
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      toast.error("Failed to Resend Code 🚫", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

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


      {/* Left Section: Marketing/Illustration - Hidden on small screens */}
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
            Welcome to <span className="text-yellow-300 dark:text-teal-300">PaperLink</span> 🔗
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-90 animate-fade-in-up delay-100 mt-4">
            Connect, collaborate, and create with ease. Join our vibrant community today!
          </p>
        </div>
      </div>

      {/* Right Section: Sign-Up Form / OTP Verification */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="bg-card text-card-foreground p-8 sm:p-10 rounded-lg shadow-2xl w-full max-w-md border border-border transition-all duration-500 hover:shadow-xl">
          {!pendingVerification ? (
            // Sign-Up Form
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Sign Up</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Create your PaperLink account</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md animate-fade-in border border-destructive">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleSignUp}
                  className="w-full py-2 sm:py-3 text-base sm:text-lg font-semibold transform hover:-translate-y-0.5"
                  size="lg"
                  disabled={!isLoaded || !firstName || !lastName || !email || !password}
                >
                  Sign Up
                </Button>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/sign-in" className="text-primary hover:underline font-semibold">
                  Sign In
                </a>
              </p>
            </>
          ) : (
            // OTP Verification Form
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Verify Email</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  A verification code has been sent to <span className="font-semibold">{email}</span>. Please enter it below.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    type="text"
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCode(value);
                    }}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md animate-fade-in border border-destructive">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleVerifyEmail}
                  className="w-full py-2 sm:py-3 text-base sm:text-lg font-semibold transform hover:-translate-y-0.5"
                  size="lg"
                  disabled={!isLoaded || code.length !== 6}
                >
                  Verify Email
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  className="w-full mt-4"
                  disabled={!isLoaded}
                >
                  Resend Code
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}