import { v4 as uuidv4 } from 'uuid'

class Posession {
  id: string
  item: string
  weight: string
  constructor(item: string,
    weight: string) {
      this.id = uuidv4()
      this.item = item
      this.weight = weight
    }
}

export default Posession
