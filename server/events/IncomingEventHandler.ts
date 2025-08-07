import { Socket } from "socket.io"
import { gameManager } from "../GameManager"
import { InvalidActionError } from "../model/GameModel"

interface JoinGamePayload {
  name: string
  password: string
}

type EventMap = {
  joinGame: JoinGamePayload
}

function EmitOnError(errorMessage: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      try {
        return originalMethod.apply(this, args)
      } catch (error) {
        if (error instanceof InvalidActionError) {
          // Emit to the player invalid action or something
        } else {
          throw error
        }
      }
    }

    return descriptor
  }
}

export class IncomingEventHandler {
  private handlers: {
    [K in keyof EventMap]: (data: EventMap[K]) => void
  }

  constructor(private socket: Socket) {
    // Bind handler methods to this instance
    this.handlers = {
      joinGame: this.handleJoinGame.bind(this),
    }

    this.registerHandlers()
  }

  private registerHandlers() {
    for (const eventName in this.handlers) {
      this.socket.on(eventName, this.handlers[eventName as keyof EventMap])
    }
  }

  // Event Handlers
  @EmitOnError("hey")
  handleJoinGame(data: JoinGamePayload) {
    console.log(
      `[IN: joinGame] Player {${this.socket}} joined game {${data.name}}`
    )
  }
}
