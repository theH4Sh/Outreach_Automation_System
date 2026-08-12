const crypto = require('crypto')

const sessions = new Map()

let nextDisplay = 99;
let nextVncPort = 5900;
// let nextWebPort = 6080;

const createSession = (userId) => {
    const key = userId.toString()
    if (sessions.has(key)) {
        throw new Error('Session already exists for this profile')
    }

    const session = {
        sessionId: crypto.randomUUID(),
        userId: key,

        display: nextDisplay++,
        vncPort: nextVncPort++,
        // webPort: nextWebPort++,

        xvfb: null,
        x11vnc: null,
        novnc: null,
        browser: null
    }

    sessions.set(key, session);

    return session;
}

const getSession = (userId) => {
    return sessions.get(userId.toString())
}

const deleteSession = (userId) => {
    return sessions.delete(userId.toString())
}

const getSessionById = (sessionId) => {
    for (const session of sessions.values()) {
        if (session.sessionId === sessionId) {
            return session;
        }
    }

    return null;
}

module.exports = {
    createSession,
    getSession,
    deleteSession,
    getSessionById
}