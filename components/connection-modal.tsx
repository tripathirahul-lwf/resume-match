"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FolderOpen } from "lucide-react"

interface ConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (folderLink: string) => void
  isConnecting: boolean
}

export function ConnectionModal({ open, onOpenChange, onConnect, isConnecting }: ConnectionModalProps) {
  const [folderLink, setFolderLink] = useState("")

  const handleConnect = () => {
    if (folderLink.trim()) {
      onConnect(folderLink.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && folderLink.trim() && !isConnecting) {
      handleConnect()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Connect to Google Drive
          </DialogTitle>
          <DialogDescription>
            Enter your Google Drive shared folder link with editor permissions to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-link">Shared Folder Link</Label>
            <Input
              id="folder-link"
              placeholder="https://drive.google.com/drive/folders/..."
              value={folderLink}
              onChange={(e) => setFolderLink(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isConnecting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConnecting}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={!folderLink.trim() || isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
