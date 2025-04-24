"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Lista reducida de países
const COUNTRIES = [
  { code: "ar", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "cl", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "mx", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "pe", name: "Perú", dialCode: "+51", flag: "🇵🇪" }
] as const

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Número de WhatsApp",
  required = false,
  id,
  name,
  className
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [phoneNumber, setPhoneNumber] = useState("")

  // Efecto para inicialización
  useEffect(() => {
    if (value) {
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode)) || COUNTRIES[0]
      setSelectedCountry(country)
      setPhoneNumber(value.substring(country.dialCode.length).trim())
    } else {
      setPhoneNumber("")
    }
  }, [value])

  // Efecto para actualizaciones
  useEffect(() => {
    if (phoneNumber !== "" || value !== "") {
      const fullNumber = `${selectedCountry.dialCode}${phoneNumber}`.trim()
      if (fullNumber !== value) {
        onChange(fullNumber)
      }
    }
  }, [selectedCountry, phoneNumber]) // Intencionalmente sin onChange/value

  return (
    <div className={cn("flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between rounded-r-none border-r-0"
          >
            <div className="flex items-center gap-2 truncate">
              <span>{selectedCountry.flag}</span>
              <span className="truncate">{selectedCountry.dialCode}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandList>
              <CommandEmpty>País no encontrado</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => {
                      setSelectedCountry(country)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="ml-auto text-muted-foreground">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        name={name}
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        required={required}
        className="rounded-l-none"
      />
    </div>
  )
}