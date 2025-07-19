import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/user(.*)',
  
])
export default clerkMiddleware(async (auth, req) => {
  const {userId}=await auth()
  if(!userId && !isPublicRoute(req)){
    const url=new URL('/sign-up',req.url)
    return NextResponse.redirect(url)
  }
  if(userId && isPublicRoute(req)){
    const url=new URL('/dashboard',req.url)
    return NextResponse.redirect(url)
  }
 
  

})
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}