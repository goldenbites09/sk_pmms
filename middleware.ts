import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // No authentication checks - all routes are public
  return NextResponse.next()
}

// No matcher means all routes are public
export const config = {
  matcher: [],
}
