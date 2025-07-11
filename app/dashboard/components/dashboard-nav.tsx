"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, Package, Home, Clock, BarChart3 } from "lucide-react"

const items = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: Home,
    color: "text-blue-600",
    activeColor: "text-blue-700",
  },
  {
    title: "Turnos",
    href: "/dashboard/appointments",
    icon: Calendar,
    color: "text-green-600",
    activeColor: "text-green-700",
  },
  {
    title: "Servicios",
    href: "/dashboard/services",
    icon: Package,
    color: "text-purple-600",
    activeColor: "text-purple-700",
  },
  {
    title: "Equipo",
    href: "/dashboard/team",
    icon: Users,
    color: "text-orange-600",
    activeColor: "text-orange-700",
  },
  {
    title: "Disponibilidad",
    href: "/dashboard/availability",
    icon: Clock,
    color: "text-indigo-600",
    activeColor: "text-indigo-700",
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-600",
    activeColor: "text-gray-700",
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 lg:gap-3">
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link key={index} href={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-xl px-4 lg:px-5 py-3 lg:py-4 text-base lg:text-lg font-semibold transition-all duration-200 hover:bg-accent hover:shadow-md",
                isActive 
                  ? "bg-accent shadow-md" 
                  : "hover:bg-accent/50"
              )}
            >
              <div className={cn(
                "mr-3 lg:mr-4 p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-background shadow-sm" 
                  : "bg-muted/50 group-hover:bg-background group-hover:shadow-sm"
              )}>
                <Icon className={cn(
                  "h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0",
                  isActive ? item.activeColor : item.color
                )} />
              </div>
              <span className="truncate">{item.title}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}