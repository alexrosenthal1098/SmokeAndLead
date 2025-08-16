import { PlayerId } from "@smoke-and-lead/server/src/model/Player"
import crypto from "crypto"
import { Server, Socket } from "socket.io"
import { GameId, gameManager } from "./GameManager"

type Session = {
  playerId: PlayerId
  socket: Socket
  connectToken: string
  gameId?: GameId
  gameStarted?: boolean
  lastActive: number
}

class SessionManager {
  private sessions: Map<PlayerId, Session> = new Map()

  io?: Server

  constructor(gracePeriodMs = 300000, cleanupCheckMs = 5000) {
    // Periodically check for expired sessions
    setInterval(() => {
      for (const [playerId, session] of this.sessions) {
        if (Date.now() - session.lastActive > gracePeriodMs) {
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
      const connectToken = crypto.randomUUID().toString()
      session = {
        playerId,
        socket,
        connectToken,
        lastActive: Date.now(),
      }
      this.sessions.set(playerId, session)

      console.log(`New player ${playerId} connected`)
    } else {
      // existing session
      if (!connectToken || session.connectToken !== connectToken) {
        return undefined
      }
      session.lastActive = Date.now()
      session.socket = socket

      console.log(`Player ${playerId} reconnected`)
    }

    return session
  }

  updateActivity(playerId: PlayerId): void {
    const session = this.sessions.get(playerId)
    if (session) {
      session.lastActive = Date.now()
    }
  }

  getSession(playerId: PlayerId): Session | undefined {
    const session = this.sessions.get(playerId)
    if (session !== undefined) {
      session.lastActive = Date.now()
    }
    return session
  }

  deleteSession(playerId: PlayerId): void {
    const session = this.sessions.get(playerId)
    if (session) {
      console.log(`[SessionManager] Cleaning up session for ${playerId}`)
      if (session.gameId) {
        gameManager.getLobby(session.gameId)?.leaveLobby(playerId)
      }
      this.sessions.delete(playerId)
    }
  }

  updateSessionInfo(playerId: PlayerId, gameId: GameId | undefined , gameStarted: boolean | undefined) {
    const session = this.sessions.get(playerId)
    if (session) {
      session.gameId = gameId
      session.gameStarted = gameStarted
    }
  }
}

export const sessionManager = new SessionManager()
