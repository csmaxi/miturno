import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Configurar headers para el back/forward cache
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  response.headers.set('Vary', 'Accept-Encoding')
  
  // Agregar headers de seguridad y rendimiento
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Optimizar para el back/forward cache
  response.headers.set('Surrogate-Control', 'max-age=31536000, immutable')
  
  // Add specific cache headers for checkout success page
  if (request.nextUrl.pathname === '/checkout/success') {
    response.headers.set('Surrogate-Key', 'checkout-success')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 