// app/(frontend)/dashboard/page.tsx
'use client' // This page needs to be client-side to handle theme state and local storage

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs'; // Use useAuth and useUser for client-side
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, LayoutDashboard, Settings, MoonIcon, SunIcon, LogOut, Github, BookText, Share2, HelpCircle, Lightbulb } from 'lucide-react'; // Added Lightbulb icon
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // Theme state and logic (re-using the robust logic from your sign-up page)
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialClientTheme = storedTheme || (prefersDark ? 'dark' : 'light');

      if (initialClientTheme !== theme) {
        setTheme(initialClientTheme);
      }
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Handle Clerk authentication and redirection
  if (!isLoaded) {
    // Optionally render a loading spinner or skeleton here
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 text-foreground">
        <p>Loading dashboard...</p>
        {/* You could add a spinner component here */}
      </div>
    );
  }

  if (!isSignedIn || !user) {
    router.push('/sign-in'); // Redirect client-side if not signed in
    return null; // Return null to prevent rendering
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.emailAddresses[0]?.emailAddress || 'User';

  const userEmail = user.emailAddresses[0]?.emailAddress;

  const handleSignOut = async () => {
    await signOut(() => router.push('/'));
    toast.success("Logged out successfully!", { duration: 2000 });
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 transition-colors duration-300">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground transition-all hover:scale-105 md:h-8 md:w-8 md:text-base"
              aria-label="Dashboard Home"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/documents"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8"
                  aria-label="All Documents"
                >
                  <FileText className="h-5 w-5" />
                  <span className="sr-only">Documents</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">All Documents</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/documents/new"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8"
                  aria-label="Create New Document"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">New Document</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Create New Document</TooltipContent>
            </Tooltip>
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-[60px]">
          {/* Header Section */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 shadow-sm sm:shadow-none">
            {/* User Profile Info and Dropdown */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="overflow-hidden rounded-full h-10 w-10">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.imageUrl} alt={`${displayName}'s profile`} />
                      <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      {userEmail && <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer flex items-center gap-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div>
                <h1 className="text-2xl font-bold text-foreground animate-fade-in-up">Welcome, {displayName}!</h1>
                {userEmail && (
                  <p className="text-sm text-muted-foreground animate-fade-in-up delay-100">Ready to create? ✨</p>
                )}
              </div>
            </div>

            {/* Main Theme Toggle in Header (right aligned, before New Document) */}
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 mr-2 transition-colors duration-200"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? (
                      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    ) : (
                      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Theme ({theme === 'light' ? 'Dark' : 'Light'})</TooltipContent>
              </Tooltip>
            )}

            {/* Create New Document Button in Header (right aligned) */}
            <div className="ml-auto">
              <Link href="/documents/new">
                <Button className="flex items-center gap-2 animate-bounce-in" size="default">
                  <PlusCircle className="h-4 w-4" />
                  New Document
                </Button>
              </Link>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {/* Main Document Area - Currently Empty State */}
            <div className="grid auto-rows-max items-start gap-6 md:gap-8 lg:col-span-2 xl:col-span-3">
              <Card className="min-h-[300px] flex flex-col justify-center items-center text-center p-8 sm:p-12 transition-all duration-300 hover:shadow-lg border-2 border-dashed border-border/50">
                <CardHeader className="pb-3 text-center w-full"> {/* Center aligns content within header */}
                  <CardTitle className="flex flex-col items-center gap-3"> {/* Center aligns title and icon */}
                    <FileText className="h-16 w-16 text-primary/70 mb-2 animate-pop-in" />
                    <span className="text-2xl font-extrabold">Your Digital Workspace Awaits!</span>
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2 max-w-lg mx-auto"> {/* Max-width and auto margins to center text block */}
                    It looks like you haven't created any documents yet. This is where your creations will appear.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6 w-full"> {/* Center aligns content within CardContent */}
                  <p className="mb-8 max-w-md text-sm text-muted-foreground text-center"> {/* Centered paragraph */}
                    Start by drafting your first idea, organizing notes, or collaborating on a project. PaperLink makes it easy.
                  </p>
                  <Link href="/documents/new">
                    <Button size="lg" className="flex items-center gap-2 px-8 py-3 text-lg font-semibold animate-button-press">
                      <PlusCircle className="h-5 w-5" />
                      Create Your First Document
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Placeholder for Recent Activity/Quick Access */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <BookText className="h-5 w-5 text-indigo-500" />
                      Quick Access
                    </CardTitle>
                    <CardDescription>Jump back into your recent work or popular templates.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground/80">
                      <p className="text-base mb-3">
                        Your most recent documents will appear here for quick access! 🚀
                      </p>
                      <p className="text-sm">
                        Start creating to populate your workspace.
                      </p>
                      <Link href="/documents" className="mt-4 inline-flex items-center text-primary hover:underline text-sm font-medium">
                        <FileText className="h-4 w-4 mr-1" /> View all documents
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-green-500" />
                      Shared With You
                    </CardTitle>
                    <CardDescription>Documents others have shared for collaboration.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground/80">
                      <p className="text-base mb-3">No shared documents yet.</p>
                      <p className="text-sm">Collaborate with others by inviting them to your documents!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Sidebar for System Insights/Tips */}
            <div className="grid auto-rows-max items-start gap-6 md:gap-8 xl:col-span-1">
                <Card className="transition-all duration-300 hover:shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-orange-500" />
                            PaperLink Tips
                        </CardTitle>
                        <CardDescription>
                            Maximize your productivity with these helpful insights.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Link href="/documents/new" className="block group">
                                <div className="flex items-start gap-3 text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                                    <PlusCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">Quick Start</h4>
                                        <p className="text-muted-foreground group-hover:text-foreground/80">Instantly create a new document to capture your ideas.</p>
                                    </div>
                                </div>
                            </Link>
                            <Separator />
                            <Link href="/templates" className="block group">
                                <div className="flex items-start gap-3 text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                                    <BookText className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">Template Library</h4>
                                        <p className="text-muted-foreground group-hover:text-foreground/80">Explore pre-designed layouts to kickstart your projects.</p>
                                    </div>
                                </div>
                            </Link>
                            <Separator />
                            <Link href="https://github.com/nakul-3205/PaperLink-a-NextJs-app" target="_blank" rel="noopener noreferrer" className="block group">
                                <div className="flex items-start gap-3 text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                                    <Github className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-foreground">View Repository</h4>
                                        <p className="text-muted-foreground group-hover:text-foreground/80">Check out the project on GitHub and explore the codebase.</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/help" className="mt-4 inline-flex items-center text-primary hover:underline text-sm font-medium">
                                <HelpCircle className="h-4 w-4 mr-1" />
                                View Help Center
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}