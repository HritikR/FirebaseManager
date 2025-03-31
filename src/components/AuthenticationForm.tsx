"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useFirebaseConfig } from "../providers/ConfigProvider"

export function AuthenticationForm() {
  const { signIn } = useFirebaseConfig()
  const [editedConfig, setEditedConfig] = useState({
    Email: "",
    Password: "",
  })

  const handleInputChange = (key: string, value: string) => {
    setEditedConfig({
      ...editedConfig,
      [key]: value,
    })
  }

  const handleSave = () => {
    signIn(editedConfig.Email, editedConfig.Password)
    toast.success("Authentication", {
      description: "Signed in successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 p-4 border rounded-md">
          {Object.entries(editedConfig).map(([key, value]) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={key}>{key}</Label>
              <Input id={key} value={value as string} onChange={(e) => handleInputChange(key, e.target.value)} />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="ml-auto">
          <Lock className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}

