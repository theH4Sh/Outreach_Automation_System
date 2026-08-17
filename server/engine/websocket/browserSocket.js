const WebSocket = require('ws')
const net = require('net')
const jwt = require('jsonwebtoken')

const sessionManager = require('../sessionManager')
const { stopIntegration } = require('../integrator')

function setupBrowserSocket(httpServer) {
    const browserWss = new WebSocket.Server({
        server: httpServer,
        path: '/browser-ws'
    })

    browserWss.on('connection', (client, request) => {
        try {
            const url = new URL(
                request.url,
                `http://${request.headers.host}`
            )

            const sessionId = url.searchParams.get('sessionId');
            const token = url.searchParams.get('token');

            if (!sessionId || !token) {
                client.close(1008, "Missing session credentials")
                return;
            }

            const decoded = jwt.verify(
                token,
                process.env.SECRET
            )

            const userId = decoded._id

            if (!userId) {
                client.close(1008, 'Invalid token')
                return
            }

            //find requested session
            const session = sessionManager.getSessionById(sessionId)

            if (!session) {
                client.close(1008, 'Session not found')
                return
            }

            if (session.userId !== userId.toString()) {
                console.log(
                    `Unauthorized browser access attempt: ${userId} -> ${sessionId}`
                );

                client.close(1008, 'Unauthorized');
                return;
            }

            console.log(`Authorized browser connection: ${userId} -> ${sessionId}`)

            // Connect to THIS user's x11vnc.
            const vnc = net.createConnection({
                host: '127.0.0.1',
                port: session.vncPort
            });

            vnc.on('connect', () => {
                console.log(
                    `WS -> x11vnc connected on port ${session.vncPort}`
                );
            });

            // Browser -> x11vnc
            client.on('message', (data, isBinary) => {
                if (vnc.writable) {
                    vnc.write(data);
                }
            });

            // x11vnc -> browser
            vnc.on('data', (data) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });

            client.on('close', async () => {
                console.log(
                    `Browser WebSocket closed: ${userId} -> ${sessionId}`
                );
                
                await stopIntegration(userId);
                vnc.destroy();
            });

            client.on('error', (err) => {
                console.error('Browser WebSocket error:', err);

                vnc.destroy();
            });

            vnc.on('close', () => {
                if (client.readyState === WebSocket.OPEN) {
                    client.close();
                }
            });

            vnc.on('error', (err) => {
                console.error(
                    `x11vnc connection error on ${session.vncPort}:`,
                    err.message
                );

                if (client.readyState === WebSocket.OPEN) {
                    client.close();
                }
            })
        } catch (error) {
            console.error('Browser WebSocket authentication failed:', error.message);

            if (client.readyState === WebSocket.OPEN) {
                client.close(1008, 'Unauthorized');
            }
        }
    })

    console.log('Browser WebSocket attached to HTTP server');
    return browserWss
}


module.exports = setupBrowserSocket;