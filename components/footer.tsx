import Link from "next/link"
import { Calendar } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span className="text-lg font-semibold">MiTurno</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            Acerca de
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Términos
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacidad
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contacto
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} MiTurno. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
