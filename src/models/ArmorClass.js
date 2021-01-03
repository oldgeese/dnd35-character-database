class ArmorClass {
  constructor(total,
    armorBonus,
    shieldBonus,
    dexModifier,
    sizeModifier,
    naturalArmor,
    deflectionBonus,
    luckBonus,
    insightBonus,
    moraleBonus,
    miscModifier,
    touchAc,
    flatFootedAc) {
    this.total = total
    this.armorBonus = armorBonus
    this.shieldBonus = shieldBonus
    this.dexModifier = dexModifier
    this.sizeModifier = sizeModifier
    this.naturalArmor = naturalArmor
    this.deflectionBonus = deflectionBonus
    this.luckBonus = luckBonus
    this.insightBonus = insightBonus
    this.moraleBonus = moraleBonus
    this.miscModifier = miscModifier
    this.touchAc = touchAc
    this.flatFootedAc = flatFootedAc
  }
}

export default ArmorClass
