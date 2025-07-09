"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, Package, Menu, X } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const items = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: Calendar,
  },
  {
    title: "Turnos",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Servicios",
    href: "/dashboard/services",
    icon: Package,
  },
  {
    title: "Equipo",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    title: "Disponibilidad",
    href: "/dashboard/availability",
    icon: Calendar,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mr-2">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>MiTurno Dashboard</SheetTitle>
          </SheetHeader>
          <nav className="grid items-start gap-2 mt-6">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
                  <span
                    className={cn(
                      "group flex items-center rounded-md px-3 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span>{item.title}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
} 