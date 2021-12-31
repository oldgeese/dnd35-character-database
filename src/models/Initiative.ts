import { v4 as uuidv4 } from 'uuid'

class Initiative {
  constructor(total, dexModifier, miscModifier) {
    this.id = uuidv4()
    this.total = total
    this.dexModifier = dexModifier
    this.miscModifier = miscModifier
  }
}

export default Initiative
