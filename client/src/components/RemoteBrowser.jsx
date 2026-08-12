import { useEffect, useRef } from 'react'
import RFB from '@novnc/novnc'

const RemoteBrowser = ({ sessionId, token, onClose }) => {
    const containerRef = useRef(null)
    const rfbRef = useRef(null)

    useEffect(() => {
        if (!sessionId || !token || !containerRef.current) {
            return
        }

        const wsUrl =
            `ws://localhost:7000?sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`

        console.log('Connecting to browser session:', sessionId)

        const rfb = new RFB(
            containerRef.current,
            wsUrl
        )

        rfb.scaleViewport = true
        rfb.resizeSession = false

        rfb.addEventListener('connect', () => {
            console.log('Connected to remote browser')
        })

        rfb.addEventListener('disconnect', (event) => {
            console.log('Disconnected from remote browser', event)

            if (onClose) {
                onClose()
            }
        })

        rfb.addEventListener('securityfailure', (event) => {
            console.error('VNC security failure:', event)
        })

        rfbRef.current = rfb

        return () => {
            console.log('Cleaning up remote browser')

            if (rfbRef.current) {
                rfbRef.current.disconnect()
                rfbRef.current = null
            }
        }
    }, [sessionId, token])

    return (
        <div
            ref={containerRef}
            className="h-[700px] w-full bg-black"
        />
    )
}

export default RemoteBrowser