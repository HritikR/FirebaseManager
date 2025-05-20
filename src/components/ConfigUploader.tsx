"use client"

import type React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useFirebaseConfig } from "../providers/ConfigProvider"

interface FirebaseConfigUploaderProps {
  onConfigUploaded: () => void
}

export function FirebaseConfigUploader({ onConfigUploaded }: FirebaseConfigUploaderProps) {
  const { config, setConfig } = useFirebaseConfig()
  const [configText, setConfigText] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (config) return;
    console.log("Paste your Firebase config JSON in the console")
    const timer = setInterval(() => {
      // @ts-expect-error firebaseConfig will be injected by user via devtools
      if (typeof firebaseConfig !== "undefined" && firebaseConfig !== null) {
        // @ts-expect-error firebaseConfig will be injected by user via devtools
        setConfig(firebaseConfig);
        onConfigUploaded();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config, setConfig, onConfigUploaded]);



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        setConfigText(content)
      } catch (err: unknown) {
        console.error(err)
        setError("Failed to read file")
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = () => {
    if (!configText) {
      setError("No configuration provided")
      return
    }
    try {
      const config = JSON.parse(configText)

      // Validate required fields
      const requiredFields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
      const missingFields = requiredFields.filter((field) => !config[field])

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`)
        return
      }

      setConfig(config)
      setError(null)
      onConfigUploaded()
    } catch (err: unknown) {
      console.error(err)
      setError("Invalid JSON format")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Firebase Configuration</CardTitle>
        <CardDescription>Upload or paste your Firebase configuration JSON</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <label htmlFor="file-upload" className="relative cursor-pointer text-primary hover:text-primary/90">
                  <span>Upload a file</span>
                  <Input id="file-upload" type="file" accept=".json" className="sr-only" onChange={handleFileUpload} />
                </label>
                <p className="text-xs text-muted-foreground">JSON up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Paste your Firebase config JSON here..."
            className="min-h-[200px] font-mono text-sm"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Connect to Firebase
        </Button>
      </CardFooter>
    </Card>
  )
}

