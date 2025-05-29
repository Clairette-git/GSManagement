"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Download } from "lucide-react"

interface SignaturesModalProps {
  supplyId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignaturesModal({ supplyId, open, onOpenChange }: SignaturesModalProps) {
  const [signatures, setSignatures] = useState<{
    recipient_signature: string | null
    deliverer_signature: string | null
    recipient_name: string
    deliverer_name: string
  }>({
    recipient_signature: null,
    deliverer_signature: null,
    recipient_name: "",
    deliverer_name: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSignatures = async () => {
      if (!open || !supplyId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/supplies/${supplyId}/signatures`)

        if (!response.ok) {
          throw new Error(`Failed to fetch signatures: ${response.status}`)
        }

        const data = await response.json()

        setSignatures({
          recipient_signature: data.recipient_signature || null,
          deliverer_signature: data.deliverer_signature || null,
          recipient_name: data.recipient_name || "Unknown Recipient",
          deliverer_name: data.deliverer_name || "Unknown Deliverer",
        })
      } catch (err) {
        console.error("Error fetching signatures:", err)
        setError(err instanceof Error ? err.message : "Failed to load signatures")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignatures()
  }, [supplyId, open])

  const downloadSignature = (dataUrl: string, name: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${name.replace(/\s+/g, "_")}_signature.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Supply Signatures</DialogTitle>
          <DialogDescription className="text-gray-500">View the signatures captured for this supply</DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="recipient" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recipient">Recipient</TabsTrigger>
              <TabsTrigger value="deliverer">Deliverer</TabsTrigger>
            </TabsList>

            <TabsContent value="recipient" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">Signed by: {signatures.recipient_name}</div>

                {signatures.recipient_signature ? (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <img
                      src={signatures.recipient_signature || "/placeholder.svg"}
                      alt="Recipient Signature"
                      className="max-w-full h-auto"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-gray-300 text-gray-700"
                      onClick={() =>
                        downloadSignature(
                          signatures.recipient_signature || "",
                          `${signatures.recipient_name}_recipient`,
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Signature
                    </Button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-center py-8">
                    <p className="text-gray-500">No recipient signature available</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="deliverer" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">Signed by: {signatures.deliverer_name}</div>

                {signatures.deliverer_signature ? (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <img
                      src={signatures.deliverer_signature || "/placeholder.svg"}
                      alt="Deliverer Signature"
                      className="max-w-full h-auto"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-gray-300 text-gray-700"
                      onClick={() =>
                        downloadSignature(
                          signatures.deliverer_signature || "",
                          `${signatures.deliverer_name}_deliverer`,
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Signature
                    </Button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50 text-center py-8">
                    <p className="text-gray-500">No deliverer signature available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
