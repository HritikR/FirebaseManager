"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfigEditor } from "./ConfigEditor"
import { FirestoreExplorer } from "./FirestoreExplorer"
import { StorageExplorer } from "./StorageExplorer"
import { AuthenticationForm } from "./AuthenticationForm"

export function FirebaseManager() {
  const [activeTab, setActiveTab] = useState("config")

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Manager</h1>

      <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="firestore">Firestore</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <ConfigEditor />
        </TabsContent>

        <TabsContent value="authentication" className="mt-6">
          <AuthenticationForm />
        </TabsContent>

        <TabsContent value="firestore" className="mt-6">
          <FirestoreExplorer />
        </TabsContent>

        <TabsContent value="storage" className="mt-6">
          <StorageExplorer />
        </TabsContent>
      </Tabs>
    </div>
  )
}

