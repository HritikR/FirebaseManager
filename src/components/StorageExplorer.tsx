"use client"

import type React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatFileSize } from "@/lib/utils"
import { getDownloadURL, getMetadata, listAll, ref, uploadBytes } from "firebase/storage"
import { AlertCircle, ArrowLeft, File, Folder, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useFirebaseConfig } from "../providers/ConfigProvider"

interface StorageItem {
  name: string
  fullPath: string
  isFolder: boolean
  downloadUrl?: string
  size?: number
  contentType?: string
  updated?: string
}

export function StorageExplorer() {
  const { storage } = useFirebaseConfig()
  const [currentPath, setCurrentPath] = useState("")
  const [items, setItems] = useState<StorageItem[]>([])
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!storage) return;
    fetchStorageItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage, currentPath])

  const fetchStorageItems = async () => {
    if (!storage) return

    try {
      setLoading(true)
      setError(null)

      const storageRef = ref(storage, currentPath)
      const result = await listAll(storageRef)

      const folders: StorageItem[] = result.prefixes.map((folderRef) => ({
        name: folderRef.name,
        fullPath: folderRef.fullPath,
        isFolder: true,
      }))

      const filePromises = result.items.map(async (itemRef) => {
        try {
          const [url, metadata] = await Promise.all([getDownloadURL(itemRef), getMetadata(itemRef)])

          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            isFolder: false,
            downloadUrl: url,
            size: metadata.size,
            contentType: metadata.contentType,
            updated: metadata.updated,
          }
        } catch (err) {
          console.error(`Error getting details for ${itemRef.fullPath}:`, err)
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            isFolder: false,
          }
        }
      })

      const files = await Promise.all(filePromises)
      setItems([...folders, ...files])
    } catch (err) {
      console.error("Error fetching storage items:", err)
      setError("Failed to fetch storage items")
    } finally {
      setLoading(false)
    }
  }

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath)
    setSelectedItem(null)
  }

  const navigateUp = () => {
    if (!currentPath) return

    const pathParts = currentPath.split("/")
    pathParts.pop()
    const parentPath = pathParts.join("/")
    setCurrentPath(parentPath)
    setSelectedItem(null)
  }

  const selectItem = (item: StorageItem) => {
    if (item.isFolder) {
      navigateToFolder(item.fullPath)
    } else {
      setSelectedItem(item)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!storage || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const storageRef = ref(storage, `${currentPath}/${file.name}`)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate progress since Firebase Storage doesn't provide upload progress in this context
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 200)

      await uploadBytes(storageRef, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Refresh the file list
      setTimeout(() => {
        fetchStorageItems()
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Failed to upload file")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigateUp} disabled={!currentPath}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{currentPath || "Root"}</span>
          </div>

          <div>
            <Input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
            <Label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Label>
          </div>
        </div>

        {isUploading && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <Tabs defaultValue="browser">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browser">File Browser</TabsTrigger>
            <TabsTrigger value="details">File Details</TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="mt-4">
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-2 bg-muted font-medium text-sm">
                <div className="w-8"></div>
                <div>Name</div>
                <div className="w-24 text-right">Size</div>
              </div>

              <div className="divide-y">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No files or folders</div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.fullPath}
                      className="grid grid-cols-[auto_1fr_auto] gap-4 p-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => selectItem(item)}
                    >
                      <div className="w-8 flex items-center justify-center">
                        {item.isFolder ? (
                          <Folder className="h-5 w-5 text-blue-500" />
                        ) : (
                          <File className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="truncate">{item.name}</div>
                      <div className="w-24 text-right text-sm text-muted-foreground">
                        {item.isFolder ? "" : formatFileSize(item.size)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <div className="font-medium">Name:</div>
                  <div>{selectedItem.name}</div>

                  <div className="font-medium">Path:</div>
                  <div className="break-all">{selectedItem.fullPath}</div>

                  <div className="font-medium">Type:</div>
                  <div>{selectedItem.contentType || "Unknown"}</div>

                  <div className="font-medium">Size:</div>
                  <div>{formatFileSize(selectedItem.size)}</div>

                  <div className="font-medium">Last Modified:</div>
                  <div>{formatDate(selectedItem.updated)}</div>
                </div>

                {selectedItem.downloadUrl && (
                  <div className="space-y-2">
                    <Label>Download URL</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={selectedItem.downloadUrl} className="font-mono text-xs" />
                      <Button variant="outline" onClick={() => window.open(selectedItem.downloadUrl, "_blank")}>
                        Open
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">Select a file to view details</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

