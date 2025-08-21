"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ImageIcon, FileSpreadsheet, Presentation, File, ExternalLink, Loader2 } from "lucide-react"
import type { DriveFile } from "@/lib/dummy-data"

interface FileListProps {
  files: DriveFile[]
  isLoading?: boolean
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return ImageIcon
  if (mimeType.includes("pdf")) return FileText
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return Presentation
  if (mimeType.includes("document") || mimeType.includes("word")) return FileText
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function FileList({ files, isLoading }: FileListProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())

  const handleDownload = async (file: DriveFile) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.id))
    console.log(`[v0] Starting download of ${file.name}`)

    try {
      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, this would download from Google Drive
      // For now, we'll create a dummy download
      const link = document.createElement("a")
      link.href = file.webContentLink
      link.download = file.name
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`[v0] Download completed: ${file.name}`)
    } catch (error) {
      console.error(`[v0] Download failed for ${file.name}:`, error)
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.id)
        return newSet
      })
    }
  }

  const handleView = (file: DriveFile) => {
    console.log(`[v0] Opening file in new tab: ${file.name}`)
    window.open(file.webViewLink, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading files...</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-muted-foreground">This folder appears to be empty. Upload some files to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => {
          const FileIcon = getFileIcon(file.mimeType)
          const isDownloading = downloadingFiles.has(file.id)

          return (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <FileIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Modified {formatDate(file.modifiedTime)}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleView(file)} className="flex-1">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    className="flex-1"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
