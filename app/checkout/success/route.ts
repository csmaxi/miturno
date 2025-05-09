import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
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
  response.headers.set('Surrogate-Key', 'checkout-success')
  
  return response
} 