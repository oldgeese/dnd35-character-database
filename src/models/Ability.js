import { v4 as uuidv4 } from 'uuid'

class Ability {
  constructor(name) {
    this.id = uuidv4()
    this.name = name
    this.score = 10
    this.modifier = 0
    this.temporaryScore = 0
    this.temporaryModifier = 0
  }
}

export default Ability
