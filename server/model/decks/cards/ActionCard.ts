import { GameModel } from "../../GameModel"

export interface IActionCard {
    // TODO: Some sort of type thats like CardInput and CardOutput? 
    play(game: GameModel, cardData: object): object
}