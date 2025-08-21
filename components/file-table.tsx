"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, ImageIcon, Video, Music, Archive, File } from "lucide-react"
import type { DriveFile } from "@/lib/dummy-data"
import { useToast } from "@/hooks/use-toast"

interface FileTableProps {
  files: DriveFile[]
  isLoading?: boolean
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
  if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />
  if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />
  if (mimeType.includes("pdf") || mimeType.includes("document")) return <FileText className="h-4 w-4" />
  if (mimeType.includes("zip") || mimeType.includes("archive")) return <Archive className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getFileTypeLabel = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "Image"
  if (mimeType.startsWith("video/")) return "Video"
  if (mimeType.startsWith("audio/")) return "Audio"
  if (mimeType.includes("pdf")) return "PDF"
  if (mimeType.includes("document")) return "Document"
  if (mimeType.includes("spreadsheet")) return "Spreadsheet"
  if (mimeType.includes("presentation")) return "Presentation"
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "Archive"
  return "File"
}

export function FileTable({ files, isLoading }: FileTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, "view" | "download" | null>>({})
  const { toast } = useToast()

  const handleView = async (file: DriveFile) => {
    setLoadingStates((prev) => ({ ...prev, [file.id]: "view" }))

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.open(file.webViewLink, "_blank")
      toast({
        title: "Opening file",
        description: `${file.name} opened in new tab`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [file.id]: null }))
    }
  }

  const handleDownload = async (file: DriveFile) => {
    setLoadingStates((prev) => ({ ...prev, [file.id]: "download" }))

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const link = document.createElement("a")
      link.href = file.downloadUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: `${file.name} is being downloaded`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [file.id]: null }))
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden lg:table-cell">Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-muted-foreground">This folder appears to be empty.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="hidden lg:table-cell">Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(file.mimeType)}
                  <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary" className="text-xs">
                  {getFileTypeLabel(file.mimeType)}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{formatFileSize(file.size)}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {new Date(file.modifiedTime).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(file)}
                    disabled={loadingStates[file.id] === "view"}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={loadingStates[file.id] === "download"}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Download</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
