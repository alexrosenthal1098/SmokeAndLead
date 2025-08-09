import { PlayerId } from "@smoke-and-lead/server/src/model/Player"
import crypto from "crypto"
import { Socket } from "socket.io"
import { GameId } from "./GameManager"

type Session = {
  playerId: PlayerId
  socket: Socket
  room?: GameId // TODO: Add room when applicable
  connectToken: string
  lastActive: number
}

class SessionManager {
  private sessions: Map<PlayerId, Session> = new Map()

  constructor(gracePeriodMs = 30000, cleanupCheckMs = 5000) {
    // Periodically check for expired sessions
    setInterval(() => {
      const now = Date.now()
      for (const [playerId, session] of this.sessions) {
        if (now - session.lastActive > gracePeriodMs) {
          this.deleteSession(playerId)
        }
      }
    }, cleanupCheckMs)
  }

  createOrRestoreSession(
    socket: Socket,
    playerId: PlayerId,
    connectToken?: string
  ): Session | undefined {
    let session = this.sessions.get(playerId)

    if (!session) {
      // new session
      const newToken = crypto.randomUUID().toString()
      session = {
        playerId,
        socket,
        connectToken: newToken,
        lastActive: Date.now(),
      }
      this.sessions.set(playerId, session)

      console.log(`New player ${playerId} connected`)
    } else {
      // existing session
      if (!connectToken || session.connectToken != connectToken) {
        return undefined
      }
      session.lastActive = Date.now()
      session.socket = socket

      console.log(`Player ${playerId} reconnected`)
    }

    return session
  }

  updateActivity(playerId: PlayerId) {
    const session = this.sessions.get(playerId)
    if (session) {
      session.lastActive = Date.now()
    }
  }

  getSession(playerId: PlayerId) {
    return this.sessions.get(playerId)
  }

  deleteSession(playerId: PlayerId) {
    const session = this.sessions.get(playerId)
    if (session) {
      console.log(`[SessionManager] Cleaning up session for ${playerId}`)
      this.sessions.delete(playerId)

      /// TODO: Game manager stuff, emove player from game
    }
  }
}

export const sessionManager = new SessionManager()
