class SavingThrow {
  constructor(name,
    total,
    baseSave,
    abilityModifier,
    magicModifier,
    miscModifier,
    temporaryModifier) {
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
