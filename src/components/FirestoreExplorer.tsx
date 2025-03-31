"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type WhereFilterOp,
} from "firebase/firestore"
import { AlertCircle, Check, ChevronsUpDown, Plus, Search, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useFirebaseConfig } from "../providers/ConfigProvider"

interface QueryCondition {
  field: string
  operator: WhereFilterOp
  value: string
}

interface QueryOrder {
  field: string
  direction: "asc" | "desc"
}

const COLLECTIONS_STORAGE_KEY = "firebase-manager-collections"

export function FirestoreExplorer() {
  const { firestore } = useFirebaseConfig()
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [newCollection, setNewCollection] = useState<string>("")
  const [queryConditions, setQueryConditions] = useState<QueryCondition[]>([])
  const [queryOrders, setQueryOrders] = useState<QueryOrder[]>([])
  const [queryLimit, setQueryLimit] = useState<number>(10)
  const [results, setResults] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const operators: WhereFilterOp[] = [
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
    "array-contains",
    "array-contains-any",
    "in",
    "not-in",
  ]

  // Load saved collections from localStorage on component mount
  useEffect(() => {
    const savedCollections = localStorage.getItem(COLLECTIONS_STORAGE_KEY)
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections)
        if (Array.isArray(parsedCollections)) {
          setCollections(parsedCollections)
          if (parsedCollections.length > 0) {
            setSelectedCollection(parsedCollections[0])
          }
        }
      } catch (err) {
        console.error("Error parsing saved collections:", err)
      }
    }
  }, [])

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (collections.length > 0) {
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections))
    }
  }, [collections])

  const addCollection = () => {
    if (!newCollection.trim()) return

    if (!collections.includes(newCollection)) {
      const updatedCollections = [...collections, newCollection]
      setCollections(updatedCollections)
      setSelectedCollection(newCollection)
      setNewCollection("")
      toast.success("Collection added", {
        description: `"${newCollection}" has been added to your collections.`,
      })
    } else {
      setSelectedCollection(newCollection)
      setNewCollection("")
    }

    setOpen(false)
  }

  const removeCollection = (collectionToRemove: string) => {
    const updatedCollections = collections.filter((c) => c !== collectionToRemove)
    setCollections(updatedCollections)

    if (selectedCollection === collectionToRemove) {
      setSelectedCollection(updatedCollections.length > 0 ? updatedCollections[0] : "")
    }

    toast.success("Collection removed", {
      description: `"${collectionToRemove}" has been removed from your collections.`,
    })
  }

  const addQueryCondition = () => {
    setQueryConditions([...queryConditions, { field: "", operator: "==", value: "" }])
  }

  const removeQueryCondition = (index: number) => {
    const newConditions = [...queryConditions]
    newConditions.splice(index, 1)
    setQueryConditions(newConditions)
  }

  const updateQueryCondition = (index: number, field: keyof QueryCondition, value: string) => {
    const newConditions = [...queryConditions]
    newConditions[index] = {
      ...newConditions[index],
      [field]: field === "operator" ? (value as WhereFilterOp) : value,
    }
    setQueryConditions(newConditions)
  }

  const addQueryOrder = () => {
    setQueryOrders([...queryOrders, { field: "", direction: "asc" }])
  }

  const removeQueryOrder = (index: number) => {
    const newOrders = [...queryOrders]
    newOrders.splice(index, 1)
    setQueryOrders(newOrders)
  }

  const updateQueryOrder = (index: number, field: keyof QueryOrder, value: string) => {
    const newOrders = [...queryOrders]
    newOrders[index] = {
      ...newOrders[index],
      [field]: field === "direction" ? (value as "asc" | "desc") : value,
    }
    setQueryOrders(newOrders)
  }

  const executeQuery = async () => {
    if (!firestore || !selectedCollection) {
      toast.error("No collection selected", {
        description: "Please select or enter a collection name first.",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      const q = collection(firestore, selectedCollection)
      let queryRef = query(q)

      // Add where conditions
      queryConditions.forEach((condition) => {
        if (condition.field && condition.value) {
          let parsedValue: string | number | boolean = condition.value

          // Try to parse the value as a number or boolean if possible
          if (!isNaN(Number(parsedValue))) {
            parsedValue = Number(parsedValue)
          } else if (parsedValue === "true") {
            parsedValue = true
          } else if (parsedValue === "false") {
            parsedValue = false
          }

          queryRef = query(queryRef, where(condition.field, condition.operator, parsedValue))
        }
      })

      // Add order by
      queryOrders.forEach((order) => {
        if (order.field) {
          queryRef = query(queryRef, orderBy(order.field, order.direction))
        }
      })

      // Add limit
      if (queryLimit > 0) {
        queryRef = query(queryRef, limit(queryLimit))
      }

      const querySnapshot = await getDocs(queryRef)
      const docs: DocumentData[] = []

      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      setResults(docs)

      // If this is a new collection that was successfully queried, add it to the list
      if (!collections.includes(selectedCollection)) {
        setCollections([...collections, selectedCollection])
      }
    } catch (err: unknown) {
      console.error("Error executing query:", err)
      setError((err as Error).message || "Failed to execute query")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firestore Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="query">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="query">Query Builder</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="collection">Collection</Label>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                      {selectedCollection ? selectedCollection : "Select or enter collection..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search or add collection..."
                        value={newCollection}
                        onValueChange={setNewCollection}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {newCollection ? (
                            <Button variant="ghost" className="w-full justify-start text-left" onClick={addCollection}>
                              Add {newCollection}
                            </Button>
                          ) : (
                            "No collections found."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {collections.map((collection) => (
                            <CommandItem
                              key={collection}
                              value={collection}
                              onSelect={(currentValue) => {
                                setSelectedCollection(currentValue)
                                setOpen(false)
                              }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCollection === collection ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {collection}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-70 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeCollection(collection)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newCollection) {
                      addCollection()
                    } else {
                      setOpen(true)
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Where Conditions</Label>
                <Button variant="outline" size="sm" onClick={addQueryCondition}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Condition
                </Button>
              </div>

              {queryConditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Field"
                    value={condition.field}
                    onChange={(e) => updateQueryCondition(index, "field", e.target.value)}
                    className="flex-1"
                  />
                  <div className="w-[120px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {condition.operator}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search operator..." />
                          <CommandList>
                            <CommandEmpty>No operator found.</CommandEmpty>
                            <CommandGroup>
                              {operators.map((op) => (
                                <CommandItem
                                  key={op}
                                  value={op}
                                  onSelect={() => updateQueryCondition(index, "operator", op)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      condition.operator === op ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {op}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => updateQueryCondition(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeQueryCondition(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Order By</Label>
                <Button variant="outline" size="sm" onClick={addQueryOrder}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Order
                </Button>
              </div>

              {queryOrders.map((order, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Field"
                    value={order.field}
                    onChange={(e) => updateQueryOrder(index, "field", e.target.value)}
                    className="flex-1"
                  />
                  <div className="w-[100px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {order.direction === "asc" ? "Ascending" : "Descending"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              <CommandItem value="asc" onSelect={() => updateQueryOrder(index, "direction", "asc")}>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    order.direction === "asc" ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                Ascending
                              </CommandItem>
                              <CommandItem value="desc" onSelect={() => updateQueryOrder(index, "direction", "desc")}>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    order.direction === "desc" ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                Descending
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeQueryOrder(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                value={queryLimit}
                onChange={(e) => setQueryLimit(Number.parseInt(e.target.value) || 10)}
              />
            </div>

            <Button onClick={executeQuery} disabled={loading} className="w-full">
              {loading ? "Executing..." : "Execute Query"}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Query Results</h3>
                <span className="text-sm text-muted-foreground">
                  {results.length} document{results.length !== 1 ? "s" : ""}
                </span>
              </div>

              <Textarea readOnly className="font-mono text-sm h-[400px]" value={JSON.stringify(results, null, 2)} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

