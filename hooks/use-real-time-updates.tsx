"use client"

import { useEffect, useRef, useState } from "react"
import type { DriveFile } from "@/lib/dummy-data"
import { useToast } from "@/hooks/use-toast"

interface UseRealTimeUpdatesProps {
  folderId: string
  currentFiles: DriveFile[]
  onFilesUpdate: (files: DriveFile[]) => void
  isEnabled: boolean
}

export function useRealTimeUpdates({ folderId, currentFiles, onFilesUpdate, isEnabled }: UseRealTimeUpdatesProps) {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()
  const lastUpdateRef = useRef<number>(Date.now())

  // Simulate new files being added by other users
  const simulateNewFiles = (): DriveFile[] => {
    const possibleNewFiles: Omit<DriveFile, "id" | "modifiedTime">[] = [
      {
        name: "New Document.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 256000,
        webViewLink: "https://drive.google.com/file/d/new1/view",
        webContentLink: "https://drive.google.com/uc?id=new1&export=download",
      },
      {
        name: "Updated Spreadsheet.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 512000,
        webViewLink: "https://drive.google.com/file/d/new2/view",
        webContentLink: "https://drive.google.com/uc?id=new2&export=download",
      },
      {
        name: "Team Photo 2024.jpg",
        mimeType: "image/jpeg",
        size: 2048000,
        webViewLink: "https://drive.google.com/file/d/new3/view",
        webContentLink: "https://drive.google.com/uc?id=new3&export=download",
      },
    ]

    // Randomly decide if new files should be added (20% chance)
    if (Math.random() > 0.8) {
      const randomFile = possibleNewFiles[Math.floor(Math.random() * possibleNewFiles.length)]
      return [
        {
          ...randomFile,
          id: `new-${Date.now()}-${Math.random()}`,
          modifiedTime: new Date().toISOString(),
        },
      ]
    }

    return []
  }

  const checkForUpdates = async () => {
    if (!isEnabled || !folderId) return

    try {
      setIsPolling(true)
      console.log("[v0] Checking for file updates...")

      // In a real implementation, this would check for actual changes
      // For demo purposes, we'll simulate new files occasionally
      const newFiles = simulateNewFiles()

      if (newFiles.length > 0) {
        console.log(
          "[v0] New files detected:",
          newFiles.map((f) => f.name),
        )

        // Update the file list with new files
        const updatedFiles = [...newFiles, ...currentFiles]
        onFilesUpdate(updatedFiles)

        // Show toast notification
        toast({
          title: "New files detected",
          description: `${newFiles.length} new file${newFiles.length !== 1 ? "s" : ""} added to the folder`,
        })

        lastUpdateRef.current = Date.now()
      }
    } catch (error) {
      console.error("[v0] Failed to check for updates:", error)
    } finally {
      setIsPolling(false)
    }
  }

  useEffect(() => {
    if (!isEnabled || !folderId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
      return
    }

    // Start polling every 30 seconds
    intervalRef.current = setInterval(checkForUpdates, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEnabled, folderId, currentFiles.length])

  return {
    isPolling,
    lastUpdate: lastUpdateRef.current,
    manualCheck: checkForUpdates,
  }
}
