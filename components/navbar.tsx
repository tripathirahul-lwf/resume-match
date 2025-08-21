"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FolderOpen, LogOut, User, Unplug } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface NavbarProps {
  onLoginClick: () => void
  folderUrl?: string
  onDisconnect?: () => void
  isConnected?: boolean
}

export function Navbar({ onLoginClick, folderUrl, onDisconnect, isConnected }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth()

  const getTruncatedUrl = (url: string) => {
    if (url.length <= 40) return url
    return `${url.substring(0, 20)}...${url.substring(url.length - 17)}`
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">Drive Manager</h1>
              {isConnected && folderUrl && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]" title={folderUrl}>
                  {getTruncatedUrl(folderUrl)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && onDisconnect && (
              <Button onClick={onDisconnect} variant="outline" size="sm" className="gap-2 bg-transparent">
                <Unplug className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLoginClick} variant="default">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
