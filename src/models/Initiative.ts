import { v4 as uuidv4 } from 'uuid'

class Initiative {
  id: string
  total: string
  dexModifier: string
  miscModifier: string
  constructor(total: string,
    dexModifier: string,
    miscModifier: string) {
      this.id = uuidv4()
      this.total = total
      this.dexModifier = dexModifier
      this.miscModifier = miscModifier
    }
}

export default Initiative
