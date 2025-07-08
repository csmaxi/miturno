"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, Package, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

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
    icon: Clock,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <nav className="grid items-start gap-2">
            {items.map((item, index) => {
              const Icon = item.icon
              return (
                <Link key={index} href={item.href}>
                  <span
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent" : "transparent"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 