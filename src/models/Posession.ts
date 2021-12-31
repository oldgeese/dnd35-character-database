import { v4 as uuidv4 } from 'uuid'

class Posession {
  constructor(item, weight) {
    this.id = uuidv4()
    this.item = item
    this.weight = weight
  }
}

export default Posession
