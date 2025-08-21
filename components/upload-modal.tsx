"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { uploadFileToDrive, type DriveFile } from "@/lib/dummy-data"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  uploadedFile?: DriveFile
  error?: string
}

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: string
  onFilesUploaded: (files: DriveFile[]) => void
}

export function UploadModal({ open, onOpenChange, folderId, onFilesUploaded }: UploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newUploadFiles: UploadFile[] = files.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      progress: 0,
      status: "pending",
    }))

    setUploadFiles((prev) => [...prev, ...newUploadFiles])

    // Reset the input so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const startUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)
    const uploadedFiles: DriveFile[] = []

    // Upload files one by one to show individual progress
    for (const uploadFile of uploadFiles) {
      if (uploadFile.status !== "pending") continue

      try {
        // Update status to uploading
        setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f)))

        console.log(`[v0] Starting upload: ${uploadFile.file.name}`)

        // Upload with progress tracking
        const uploadedFile = await uploadFileToDrive(uploadFile.file, folderId, (progress) => {
          setUploadFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f)))
        })

        // Mark as completed
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "completed" as const, progress: 100, uploadedFile } : f,
          ),
        )

        uploadedFiles.push(uploadedFile)
      } catch (error) {
        console.error(`[v0] Upload failed for ${uploadFile.file.name}:`, error)

        // Mark as error
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "error" as const, error: "Upload failed" } : f)),
        )
      }
    }

    setIsUploading(false)

    // Notify parent component of successful uploads
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setUploadFiles([])
      onOpenChange(false)
    }
  }

  const completedCount = uploadFiles.filter((f) => f.status === "completed").length
  const errorCount = uploadFiles.filter((f) => f.status === "error").length
  const canUpload = uploadFiles.length > 0 && !isUploading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Files
          </DialogTitle>
          <DialogDescription>Select multiple files to upload to your Google Drive folder.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* File Selection */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>

          {/* Upload Progress Summary */}
          {uploadFiles.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount > 0 && <span className="text-green-600">{completedCount} completed</span>}
              {completedCount > 0 && errorCount > 0 && <span className="mx-2">•</span>}
              {errorCount > 0 && <span className="text-red-600">{errorCount} failed</span>}
              {(completedCount > 0 || errorCount > 0) && <span className="mx-2">•</span>}
              <span>{uploadFiles.length} total files</span>
            </div>
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadFiles.map((uploadFile) => (
                <Card key={uploadFile.id} className="p-0">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate" title={uploadFile.file.name}>
                            {uploadFile.file.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {uploadFile.status === "pending" && !isUploading && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(uploadFile.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            {uploadFile.status === "uploading" && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                            {uploadFile.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.file.size)}</p>

                        {uploadFile.status === "uploading" && (
                          <div className="mt-2">
                            <Progress value={uploadFile.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{uploadFile.progress}% uploaded</p>
                          </div>
                        )}

                        {uploadFile.status === "error" && uploadFile.error && (
                          <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Cancel"}
          </Button>
          <Button onClick={startUpload} disabled={!canUpload}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${uploadFiles.length} file${uploadFiles.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
