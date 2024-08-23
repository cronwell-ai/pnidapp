"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(theme === "dark")
  }, [theme])

  return (
    <Switch checked={checked} onCheckedChange={() => {setTheme(theme === "dark" ? "light" : "dark")}}/>
  )
}
