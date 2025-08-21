"use client"

import { useState, useEffect } from "react"
import { ConnectionModal } from "@/components/connection-modal"
import { LoginModal } from "@/components/login-modal"
import { UploadModal } from "@/components/upload-modal"
import { FileTable } from "@/components/file-table"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Plus } from "lucide-react"
import { type DriveFile, fetchDriveFiles, DUMMY_FOLDER_ID } from "@/lib/dummy-data"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [showConnectionModal, setShowConnectionModal] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedFolderId, setConnectedFolderId] = useState<string>("")
  const [connectedFolderUrl, setConnectedFolderUrl] = useState<string>("")
  const [files, setFiles] = useState<DriveFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  const { isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!isConnected || !connectedFolderId) return

    const interval = setInterval(async () => {
      try {
        const fetchedFiles = await fetchDriveFiles(connectedFolderId)
        setFiles((prevFiles) => {
          // Only update if there are actual changes
          if (JSON.stringify(prevFiles) !== JSON.stringify(fetchedFiles)) {
            const newFiles = fetchedFiles.filter((newFile) => !prevFiles.some((prevFile) => prevFile.id === newFile.id))
            if (newFiles.length > 0) {
              toast({
                title: "New files detected",
                description: `${newFiles.length} new file(s) added to the folder`,
              })
            }
            return fetchedFiles
          }
          return prevFiles
        })
      } catch (error) {
        console.error("Auto-refresh failed:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isConnected, connectedFolderId, toast])

  const handleConnect = async (folderLink: string) => {
    setIsConnecting(true)

    try {
      const folderId = DUMMY_FOLDER_ID
      setConnectedFolderId(folderId)
      setConnectedFolderUrl(folderLink)

      setIsLoadingFiles(true)
      const fetchedFiles = await fetchDriveFiles(folderId)
      setFiles(fetchedFiles)

      setIsConnected(true)
      setShowConnectionModal(false)

      toast({
        title: "Connected successfully",
        description: "Your Google Drive folder has been connected",
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Google Drive folder",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
      setIsLoadingFiles(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectedFolderId("")
    setConnectedFolderUrl("")
    setFiles([])
    logout()
    setShowConnectionModal(true)

    toast({
      title: "Disconnected",
      description: "You have been disconnected from the folder",
    })
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    } else {
      setShowUploadModal(true)
    }
  }

  const handleLoginSuccess = () => {
    setShowUploadModal(true)
  }

  const handleFilesUploaded = (uploadedFiles: DriveFile[]) => {
    setFiles((prevFiles) => [...uploadedFiles, ...prevFiles])
    setShowUploadModal(false)

    toast({
      title: "Upload complete",
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onLoginClick={() => setShowLoginModal(true)}
        folderUrl={connectedFolderUrl}
        onDisconnect={handleDisconnect}
        isConnected={isConnected}
      />

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <CardTitle>Welcome to Drive Manager</CardTitle>
                <CardDescription>Connect your Google Drive folder to start managing files</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowConnectionModal(true)} className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Connect Drive Folder
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Your Files</h2>
                <p className="text-muted-foreground">Connected to folder </p>
              </div>
              <Button onClick={handleUploadClick} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Upload Files
              </Button>
            </div>

            <FileTable files={files} isLoading={isLoadingFiles} />
          </div>
        )}
      </main>

      {/* Modals */}
      <ConnectionModal
        open={showConnectionModal}
        onOpenChange={setShowConnectionModal}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onSuccess={handleLoginSuccess} />

      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        folderId={connectedFolderId}
        onFilesUploaded={handleFilesUploaded}
      />
    </div>
  )
}
