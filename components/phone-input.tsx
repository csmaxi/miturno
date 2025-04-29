"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { COUNTRIES } from "@/lib/constants"
import { usePhoneStore } from "@/lib/store/phone-store"

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
  const [open, setOpen] = React.useState(false)
  const { selectedCountry, phoneNumber, setSelectedCountry, setPhoneNumber, getFullNumber } = usePhoneStore()

  // Efecto para inicialización
  React.useEffect(() => {
    if (value) {
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode)) || COUNTRIES[0]
      setSelectedCountry(country)
      setPhoneNumber(value.substring(country.dialCode.length).trim())
    } else {
      setPhoneNumber("")
    }
  }, [value, setSelectedCountry, setPhoneNumber])

  // Efecto para actualizaciones
  React.useEffect(() => {
    if (phoneNumber !== "" || value !== "") {
      const fullNumber = getFullNumber()
      if (fullNumber !== value) {
        onChange(fullNumber)
      }
    }
  }, [selectedCountry, phoneNumber, value, onChange, getFullNumber])

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[130px] justify-between"
          >
            {selectedCountry.flag} {selectedCountry.dialCode}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandEmpty>No se encontró el país.</CommandEmpty>
            <CommandGroup>
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
                  {country.flag} {country.name} ({country.dialCode})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder={placeholder}
        required={required}
        id={id}
        name={name}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}