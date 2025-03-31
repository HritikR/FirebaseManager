"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileJson, Menu, Plus, Upload, X } from "lucide-react"
import { useFirebaseConfig } from "../providers/ConfigProvider"
import { toast } from "sonner"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { config } = useFirebaseConfig()

  const copyConfigToClipboard = () => {
    if (!config) return

    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    toast.success("Configuration copied", {
      description: "Firebase configuration has been copied to clipboard.",
    })
  }

  const downloadConfig = () => {
    if (!config) return

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "firebase-config.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Configuration downloaded", {
      description: "Firebase configuration has been downloaded as JSON.",
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col-reverse gap-2">
          <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full shadow-lg bg-white dark:bg-gray-800">
                <FileJson className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyConfigToClipboard}>Copy to clipboard</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadConfig}>Download as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="icon"
            variant="outline"
            className="rounded-full shadow-lg bg-white dark:bg-gray-800"
            onClick={() => window.location.reload()}
          >
            <Upload className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="rounded-full shadow-lg bg-white dark:bg-gray-800"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

