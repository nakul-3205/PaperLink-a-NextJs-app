// app/(frontend)/documents/page.tsx
'use client' // This page needs to be client-side to handle theme state, local storage, and interactivity

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input'; // For search input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For filter/sort
import { toast } from 'sonner';
import { PlusCircle, FileText, LayoutDashboard, Settings, MoonIcon, SunIcon, LogOut, Search, Filter, SortAsc, SortDesc, EllipsisVertical, Folder, Edit, Trash2, Download, Share2 } from 'lucide-react';

// --- Mock Data for Documents (Now empty, ready for actual data fetching) ---
const mockDocuments: any[] = []; // Changed to an empty array
// --- End Mock Data ---

export default function DocumentsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // Theme state and logic
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  
  // Document states
  const [documents, setDocuments] = useState(mockDocuments); // Will be an empty array initially
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'document', 'folder'
  const [sortBy, setSortBy] = useState('lastModifiedDesc'); // 'lastModifiedDesc', 'lastModifiedAsc', 'titleAsc', 'titleDesc'

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
        <p>Loading documents...</p>
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

  // --- Filtering and Sorting Logic ---
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'lastModifiedDesc') {
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
    if (sortBy === 'lastModifiedAsc') {
      return new Date(a.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
    if (sortBy === 'titleAsc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'titleDesc') {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 transition-colors duration-300">
        {/* Sidebar - Remains consistent with Dashboard */}
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8"
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
                <h1 className="text-2xl font-bold text-foreground animate-fade-in-up">Your Documents</h1>
                <p className="text-sm text-muted-foreground animate-fade-in-up delay-100">Manage all your files and folders here.</p>
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

            {/* Create New Document Button in Header */}
            <Link href="/documents/new">
              <Button className="flex items-center gap-2 animate-bounce-in" size="default">
                <PlusCircle className="h-4 w-4" />
                New Document
              </Button>
            </Link>
          </header>

          {/* Documents Content */}
          <main className="grid flex-1 items-start gap-6 p-4 sm:px-6 sm:py-0 md:gap-8 animate-fade-in">
            {/* Control Bar: Search, Filter, Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-background border shadow-sm">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-9 w-full sm:max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="folder">Folders</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    {sortBy.includes('Desc') ? <SortDesc className="mr-2 h-4 w-4" /> : <SortAsc className="mr-2 h-4 w-4" />}
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastModifiedDesc">Last Modified (Newest)</SelectItem>
                    <SelectItem value="lastModifiedAsc">Last Modified (Oldest)</SelectItem>
                    <SelectItem value="titleAsc">Title (A-Z)</SelectItem>
                    <SelectItem value="titleDesc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Document List Display */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDocuments.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 min-h-[200px] flex flex-col items-center justify-center p-8 text-center border-dashed border-2 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold mb-2">No documents match your criteria.</p>
                  <p className="text-sm max-w-sm">Try adjusting your search, filters, or sorting options.</p>
                  <Button onClick={() => { setSearchTerm(''); setFilterType('all'); setSortBy('lastModifiedDesc'); }} variant="outline" className="mt-6">
                    Reset Filters
                  </Button>
                </Card>
              ) : (
                filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-3">
                        {doc.type === 'document' ? (
                          <FileText className="h-6 w-6 text-primary" />
                        ) : (
                          <Folder className="h-6 w-6 text-yellow-500" />
                        )}
                        <CardTitle className="text-lg font-semibold truncate max-w-[200px]">{doc.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EllipsisVertical className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {doc.type === 'document' && (
                             <DropdownMenuItem asChild>
                               <Link href={`/documents/edit/${doc.id}`} className="flex items-center cursor-pointer w-full">
                                 <Edit className="mr-2 h-4 w-4" /> Edit
                               </Link>
                             </DropdownMenuItem>
                           )}
                           {doc.type === 'document' && (
                             <DropdownMenuItem onClick={() => toast.info(`Downloading ${doc.title}...`)} className="flex items-center cursor-pointer">
                               <Download className="mr-2 h-4 w-4" /> Download
                             </DropdownMenuItem>
                           )}
                          <DropdownMenuItem onClick={() => toast.info(`Sharing ${doc.title}...`)} className="flex items-center cursor-pointer">
                            <Share2 className="mr-2 h-4 w-4" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.error(`Deleting ${doc.title}...`)} className="text-destructive flex items-center cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-muted-foreground">
                      <p>Last Modified: {new Date(doc.lastModified).toLocaleDateString()} {new Date(doc.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p>Created by: {doc.createdBy}</p>
                      {doc.type === 'document' && <p>Size: {doc.size}</p>}
                      {doc.type === 'folder' && <p>{doc.itemCount} items</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}