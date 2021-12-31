import { v4 as uuidv4 } from 'uuid'

class SavingThrow {
  id: string
  name: string
  total: string
  baseSave: string
  abilityModifier: string
  magicModifier: string
  miscModifier: string
  temporaryModifier: string
  constructor(name: string,
    total: string,
    baseSave: string,
    abilityModifier: string,
    magicModifier: string,
    miscModifier: string,
    temporaryModifier: string) {
      this.id = uuidv4()
      this.name = name
      this.total = total
      this.baseSave = baseSave
      this.abilityModifier = abilityModifier
      this.magicModifier = magicModifier
      this.miscModifier = miscModifier
      this.temporaryModifier = temporaryModifier
    }
}

export default SavingThrow
