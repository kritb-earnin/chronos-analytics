import { useChronos } from 'chronos-analytics'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Demonstrates hard-navigate offload: when the user leaves the page (tab close,
 * navigate away, or the buttons below), Chronos flushes on visibility hidden
 * and on pagehide either calls provider.sendBeacon (if payload ≤64KB) or
 * persists to localStorage for replay on next load.
 */
export function HardNavigateDemo(): React.ReactElement {
  const { emit } = useChronos()

  const emitThenNavigateAway = (): void => {
    emit('offload_demo', { source: 'hard_navigate_demo', at: Date.now() })
    // Navigate away before the mock 800ms "send" completes so the event stays
    // in the queue; on pagehide Chronos will call sendBeacon (see console).
    setTimeout(() => {
      window.location.href = 'about:blank'
    }, 400)
  }

  const emitThenReload = (): void => {
    emit('offload_demo', { source: 'reload_demo', at: Date.now() })
    setTimeout(() => {
      window.location.reload()
    }, 400)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hard navigate offload</CardTitle>
        <CardDescription>
          Chronos flushes the queue when the page becomes hidden (visibilitychange)
          and on pagehide uses sendBeacon (if implemented and payload ≤64KB) or
          persists unsent events to localStorage for replay when you return.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Open the browser console, then click a button below. You should see either
          &quot;[Mock analytics] sendBeacon (hard navigate offload) N event(s)&quot; when
          leaving, or normal &quot;sent&quot; logs when the mock delay completes.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={emitThenNavigateAway}>
            Emit event then navigate away
          </Button>
          <Button variant="outline" onClick={emitThenReload}>
            Emit event then reload
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
