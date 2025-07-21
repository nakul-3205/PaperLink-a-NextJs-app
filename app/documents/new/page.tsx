// app/(frontend)/documents/new/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Import icons
import { PlusCircle, FileText, LayoutDashboard, Settings, MoonIcon, SunIcon, LogOut, Save, XCircle } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs'; // Import Clerk hooks

export default function NewDocumentPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false); // State for loading indicator on save
  const router = useRouter();

  // Clerk user and auth for header
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

  // Theme state and logic (reused from dashboard/documents page)
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    router.push('/sign-in');
    return null;
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.emailAddresses[0]?.emailAddress || 'User';

  const userEmail = user.emailAddresses[0]?.emailAddress;

  const handleSignOut = async () => {
    await signOut(() => router.push('/'));
    toast.success("Logged out successfully!", { duration: 2000 });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Document title cannot be empty.", { duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create document');
      }

      const data = await res.json();
      toast.success("Document created successfully!", { duration: 2000 });
      router.push(`/documents/${data.id}`); // Navigate to the new doc page
    } catch (err: any) {
      console.error("Error creating document:", err);
      toast.error(`Error creating document: ${err.message || 'Unknown error'}`, { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 transition-colors duration-300">
        {/* Sidebar - Consistent with Dashboard/Documents */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary text-secondary-foreground transition-all hover:scale-105 md:h-8 md:w-8 md:text-base"
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8" // Highlighted as current page
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
          {/* Header Section - Consistent with Dashboard */}
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
                <h1 className="text-2xl font-bold text-foreground animate-fade-in-up">Create New Document</h1>
                <p className="text-sm text-muted-foreground animate-fade-in-up delay-100">Start drafting your next masterpiece.</p>
              </div>
            </div>

            {/* Main Theme Toggle in Header (right aligned) */}
            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 mr-2 transition-colors duration-200 ml-auto"
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

            {/* Action Buttons in Header */}
            <Button
              onClick={handleCreate}
              disabled={isSaving}
              className="flex items-center gap-2 animate-bounce-in"
              size="default"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Document
                </>
              )}
            </Button>
            <Link href="/documents">
                <Button variant="outline" className="flex items-center gap-2" size="default">
                    <XCircle className="h-4 w-4" />
                    Cancel
                </Button>
            </Link>
          </header>

          {/* Main Document Creation Form */}
          <main className="flex-1 items-start gap-6 p-4 sm:px-6 sm:py-0 md:gap-8 animate-fade-in">
            <Card className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-3xl font-extrabold text-foreground">New Document</CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Fill in the details to create your new document.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div>
                  <label htmlFor="document-title" className="sr-only">Document Title</label>
                  <Input
                    id="document-title"
                    placeholder="Enter document title (e.g., 'Project Proposal', 'Meeting Notes')"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold p-4 h-auto"
                  />
                </div>
                <div>
                  <label htmlFor="document-content" className="sr-only">Document Content</label>
                  <Textarea
                    id="document-content"
                    rows={15} // Increased rows for more editing space
                    placeholder="Start writing your content here... supports Markdown (coming soon!)."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] font-mono text-base resize-y" // Added monospaced font, resize
                  />
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}