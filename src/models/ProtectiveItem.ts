import { v4 as uuidv4 } from 'uuid'

class ProtectiveItem {
  id: string
  name: string
  acBonus: string
  type: string
  dexMax: string
  checkPenalty: string
  spellFailure: string
  weight: string
  specialProperties: string
  constructor(name: string,
    acBonus: string,
    type: string,
    dexMax: string,
    checkPenalty: string,
    spellFailure: string,
    weight: string,
    specialProperties: string) {
      this.id = uuidv4()
      this.name = name
      this.acBonus = acBonus
      this.type = type
      this.dexMax = dexMax
      this.checkPenalty = checkPenalty
      this.spellFailure = spellFailure
      this.weight = weight
      this.specialProperties = specialProperties
    }
}

export default ProtectiveItem
