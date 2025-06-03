"use client"

import { useState, useEffect } from "react"

export default function DeploymentStatus() {
  const [status, setStatus] = useState<{
    mongodb: boolean
    huggingface: boolean
    ready: boolean
  }>({
    mongodb: false,
    huggingface: false,
    ready: false,
  })

  useEffect(() => {
    checkDeploymentStatus()
  }, [])

  const checkDeploymentStatus = async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to check deployment status:", error)
    }
  }

  if (status.ready) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">All systems ready</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">System Status</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.mongodb ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-xs text-yellow-700">MongoDB: {status.mongodb ? "Connected" : "Not connected"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.huggingface ? "bg-green-500" : "bg-yellow-500"}`}></div>
          <span className="text-xs text-yellow-700">
            Text Enhancement: {status.huggingface ? "Available" : "Using fallback"}
          </span>
        </div>
      </div>
    </div>
  )
}
