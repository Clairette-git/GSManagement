"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Image from "next/image"

interface OptimizeWorkflowProps {
  className?: string
}

export function OptimizeWorkflow({ className }: OptimizeWorkflowProps) {
  return (
    <Card className={`bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-medium text-green-400">Optimize Workflow</h3>
        </div>

        <p className="text-sm text-gray-300 mb-6">
          Add Smart Alerts to automatically notify your team when gas levels are low.
        </p>

        <Button className="bg-green-600 hover:bg-green-700 text-white border-0">Set Up</Button>

        <div className="mt-6 relative h-32">
          <div className="absolute bottom-0 right-0">
            <div className="relative w-32 h-32">
              <Image
                src="/placeholder.svg?height=128&width=128"
                alt="Mountain illustration"
                width={128}
                height={128}
                className="opacity-80"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
