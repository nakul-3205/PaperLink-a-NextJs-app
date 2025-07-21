// app/documents/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { toast } from 'sonner';

import {
  FileText, Share2, History, User, PlusCircle, ArrowLeft, Save, MoreHorizontal,
  ChevronLeft, BookText, MessageSquare, Settings, Users,
} from 'lucide-react';

// For a real app, you'd integrate a rich text editor here
// Example placeholder for the editor content
const initialEditorContent = `
    # My Awesome Document Title

    This is the content of your document. You can start typing here!

    ## Subheading

    * Item 1
    * Item 2
    * Item 3

    PaperLink supports **real-time collaboration** and seamless sharing.
    You can track changes and revert to previous versions at any time.

    ---

    ### Next Steps:
    1.  Invite collaborators.
    2.  Check out the version history.
    3.  Export your document.
`;

interface DocumentPageProps {
  params: {
    id: string; // The ID of the document from the URL
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const { id: documentId } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [documentTitle, setDocumentTitle] = useState('Loading Document...');
  const [editorContent, setEditorContent] = useState(initialEditorContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Simulate document loading
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // In a real app, you'd fetch document data here based on documentId
      // For now, simulate a delay and set dummy data
      const fetchDocument = async () => {
        await new Promise(resolve => setTimeout(500, resolve)); // Simulate network delay
        setDocumentTitle(`Document: ${documentId.substring(0, 8)}...`);
        setEditorContent(initialEditorContent); // Or fetched content
        setLastSaved(new Date().toLocaleTimeString());
      };
      fetchDocument();
    }
  }, [documentId, isLoaded, isSignedIn]);

  // Handle Clerk authentication and redirection
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 text-foreground">
        <p>Loading document...</p>
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

  const handleSaveDocument = async () => {
    setIsSaving(true);
    // Simulate API call to save document
    await new Promise(resolve => setTimeout(1000, resolve));
    setLastSaved(new Date().toLocaleTimeString());
    setIsSaving(false);
    toast.success("Document saved successfully!", { duration: 2000 });
  };

  const handleShareDocument = () => {
    toast.info("Share functionality coming soon!", { duration: 2000 });
    // In a real app, open a share modal here
  };

  const handleViewHistory = () => {
    toast.info("Version history coming soon!", { duration: 2000 });
    // In a real app, open a version history sidebar/modal here
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
          {/* Back to Dashboard Button */}
          <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only md:not-sr-only md:text-base">Dashboard</span>
          </Link>

          {/* Document Title Input */}
          <Input
            className="flex-1 max-w-[400px] text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-2"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            aria-label="Document Title"
          />

          {/* Collaboration Indicators (Placeholder) */}
          <div className="flex items-center gap-2 ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">3</span>
                  <span className="sr-only">Active Collaborators</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>3 active collaborators</p>
                <div className="flex gap-1 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user2.jpg" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user3.jpg" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Save Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDocument}
              disabled={isSaving}
              className="flex items-center gap-1 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {lastSaved && <span className="text-xs text-muted-foreground ml-2 hidden sm:block">Last saved: {lastSaved}</span>}

            {/* Share Button */}
            <Button variant="outline" size="sm" onClick={handleShareDocument} className="hidden sm:inline-flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Document Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleViewHistory} className="flex items-center gap-2 cursor-pointer">
                  <History className="h-4 w-4" /> Version History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareDocument} className="flex items-center gap-2 cursor-pointer sm:hidden">
                  <Share2 className="h-4 w-4" /> Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete Document {/* Add Trash2 icon from lucide-react */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Sidebar Toggle (for document details/history) */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild className="lg:hidden ml-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[350px] sm:w-[450px] flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2"><BookText className="h-5 w-5" /> Document Details</SheetTitle>
                  <SheetDescription>
                    Information, version history, and comments for this document.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  <h4 className="font-semibold mb-2 text-lg">Properties</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Created by:</strong> {displayName}</p>
                    <p><strong className="text-foreground">Last Modified:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                    <p><strong className="text-foreground">Document ID:</strong> {documentId}</p>
                    {/* Add more properties as needed */}
                  </div>
                  <Separator className="my-6" />
                  <h4 className="font-semibold mb-2 text-lg flex items-center gap-2"><History className="h-5 w-5" /> Version History</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Version 3 (Current)</span>
                      <span className="text-xs">Just now</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Version 2</span>
                      <span className="text-xs">Yesterday at 3:45 PM</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Version 1 (Initial)</span>
                      <span className="text-xs">July 1, 2025 at 10:00 AM</span>
                    </div>
                    <Button variant="link" size="sm" className="px-0 mt-2">View all versions</Button>
                  </div>
                  <Separator className="my-6" />
                  <h4 className="font-semibold mb-2 text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments</h4>
                  <div className="text-muted-foreground text-sm">
                    <p>No comments yet. Start a discussion!</p>
                    {/* Placeholder for comment input */}
                    <textarea
                      className="mt-4 w-full p-2 border rounded-md bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Add a comment..."
                      rows={3}
                    ></textarea>
                    <Button size="sm" className="mt-2">Add Comment</Button>
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Close Details</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

          </header>

          {/* Main Content Area: Editor and Desktop Sidebar */}
          <main className="flex flex-1 overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto editor-scroll">
              <div className="max-w-4xl mx-auto min-h-full bg-card rounded-lg shadow-sm p-6 lg:p-10 border border-border/70 flex flex-col">
                {/* This is where your rich text editor component would go */}
                {/* For now, a simple textarea or div with contentEditable */}
                <div
                  className="flex-1 outline-none text-base md:text-lg lg:text-xl leading-relaxed prose dark:prose-invert prose-p:my-1 prose-h1:mt-2 prose-h2:mt-2 prose-h3:mt-2"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                  onBlur={(e) => setEditorContent(e.currentTarget.innerHTML)}
                  style={{ minHeight: 'calc(100vh - 250px)' }} // Adjust min-height as needed
                />
              </div>
            </div>

            {/* Desktop Document Details/History Sidebar */}
            <aside className="hidden lg:flex w-[350px] flex-col border-l bg-background p-6 overflow-y-auto shadow-inner">
              <h3 className="font-bold text-2xl mb-4">Document Details</h3>
              <Separator className="mb-4" />

              <h4 className="font-semibold mb-2 text-lg">Properties</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Created by:</strong> {displayName}</p>
                <p><strong className="text-foreground">Last Modified:</strong> {lastSaved ? lastSaved : 'Never saved'}</p>
                <p><strong className="text-foreground">Document ID:</strong> {documentId}</p>
                {/* Add more properties like collaborators, creation date, etc. */}
              </div>

              <Separator className="my-6" />

              <h4 className="font-semibold mb-2 text-lg flex items-center gap-2"><History className="h-5 w-5" /> Version History</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Version 3 (Current)</span>
                  <span className="text-xs">Just now</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Version 2</span>
                  <span className="text-xs">Yesterday at 3:45 PM</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Version 1 (Initial)</span>
                  <span className="text-xs">July 1, 2025 at 10:00 AM</span>
                </div>
                <Button variant="link" size="sm" className="px-0 mt-2">View all versions</Button>
              </div>

              <Separator className="my-6" />

              <h4 className="font-semibold mb-2 text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments</h4>
              <div className="text-muted-foreground text-sm">
                <p>No comments yet. Start a discussion!</p>
                {/* Placeholder for comment input */}
                <textarea
                  className="mt-4 w-full p-2 border rounded-md bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Add a comment..."
                  rows={3}
                ></textarea>
                <Button size="sm" className="mt-2">Add Comment</Button>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}