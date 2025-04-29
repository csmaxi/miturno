import { create } from 'zustand'
import { COUNTRIES } from '@/lib/constants'

interface PhoneState {
  selectedCountry: typeof COUNTRIES[0]
  phoneNumber: string
  setSelectedCountry: (country: typeof COUNTRIES[0]) => void
  setPhoneNumber: (number: string) => void
  getFullNumber: () => string
}

export const usePhoneStore = create<PhoneState>((set, get) => ({
  selectedCountry: COUNTRIES[0],
  phoneNumber: '',
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setPhoneNumber: (number) => set({ phoneNumber: number }),
  getFullNumber: () => {
    const { selectedCountry, phoneNumber } = get()
    return `${selectedCountry.dialCode}${phoneNumber}`.trim()
  },
})) 