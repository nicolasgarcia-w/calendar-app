import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const publicRoutes = ['/login']
const adminRoutes = ['/admin']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get('session')?.value
  const session = await decrypt(token)

  // Redirect authenticated users away from login
  if (publicRoutes.includes(path) && session) {
    const dest = session.role === 'admin' ? '/admin' : '/home'
    return NextResponse.redirect(new URL(dest, req.nextUrl))
  }

  // Require auth for everything except public routes
  if (!publicRoutes.includes(path) && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Block partner from admin routes
  if (adminRoutes.some((r) => path.startsWith(r)) && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/home', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest).*)'],
}
