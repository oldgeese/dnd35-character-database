import { v4 as uuidv4 } from 'uuid'

class SavingThrow {
  constructor(name,
    total,
    baseSave,
    abilityModifier,
    magicModifier,
    miscModifier,
    temporaryModifier) {
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
