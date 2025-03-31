"use client"

import { FirebaseConfigUploader } from "@/components/ConfigUploader"
import { FirebaseManager } from "@/components/FirebaseManager"
import { FloatingActionButton } from "@/components/FloatingActionButton"
import { FirebaseConfigProvider } from "@/providers/ConfigProvider"
import { useState } from "react"

const Home = () => {
  const [configUploaded, setConfigUploaded] = useState(false)

  return (
    <main className="min-h-screen p-4 md:p-8">
      <FirebaseConfigProvider>
        {!configUploaded ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <FirebaseConfigUploader onConfigUploaded={() => setConfigUploaded(true)} />
          </div>
        ) : (
          <>
            <FirebaseManager />
            <FloatingActionButton />
          </>
        )}
      </FirebaseConfigProvider>
    </main>
  )
}

export default Home;