"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

interface RealTimeIndicatorProps {
  isEnabled: boolean
  isPolling: boolean
  lastUpdate: number
  onToggle: () => void
  onManualCheck: () => void
}

export function RealTimeIndicator({
  isEnabled,
  isPolling,
  lastUpdate,
  onToggle,
  onManualCheck,
}: RealTimeIndicatorProps) {
  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 minute ago"
    return `${minutes} minutes ago`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant={isEnabled ? "default" : "secondary"} className="gap-1">
        {isEnabled ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isEnabled ? "Live" : "Offline"}
      </Badge>

      {isEnabled && (
        <>
          <span className="text-muted-foreground">Last check: {formatLastUpdate(lastUpdate)}</span>

          <Button variant="ghost" size="sm" onClick={onManualCheck} disabled={isPolling} className="h-6 px-2">
            <RefreshCw className={`h-3 w-3 ${isPolling ? "animate-spin" : ""}`} />
          </Button>
        </>
      )}

      <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 px-2">
        {isEnabled ? "Disable" : "Enable"} Live Updates
      </Button>
    </div>
  )
}
