import { v4 as uuidv4 } from 'uuid'

class ArmorClass {
  id: string
  total: string
  armorBonus: string
  shieldBonus: string
  dexModifier: string
  sizeModifier: string
  naturalArmor: string
  deflectionBonus: string
  luckBonus: string
  insightBonus: string
  moraleBonus: string
  miscModifier: string
  touchAc: string
  flatFootedAc: string
  constructor(total: string,
    armorBonus: string,
    shieldBonus: string,
    dexModifier: string,
    sizeModifier: string,
    naturalArmor: string,
    deflectionBonus: string,
    luckBonus: string,
    insightBonus: string,
    moraleBonus: string,
    miscModifier: string,
    touchAc: string,
    flatFootedAc: string) {
      this.id = uuidv4()
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
