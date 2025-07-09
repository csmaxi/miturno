"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, Package, Home } from "lucide-react"

const items = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: Home,
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

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-1 lg:gap-2">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link key={index} href={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-md px-2 lg:px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}