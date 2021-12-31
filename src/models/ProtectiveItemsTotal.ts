import { v4 as uuidv4 } from 'uuid'

class ProtectiveItemsTotal {
  id: string
  acBonus: string
  dexMax: string
  checkPenalty: string
  spellFailure: string
  weight: string
  specialProperties: string
  constructor(acBonus: string,
    dexMax: string,
    checkPenalty: string,
    spellFailure: string,
    weight: string,
    specialProperties: string) {
      this.id = uuidv4()
      this.acBonus = acBonus
      this.dexMax = dexMax
      this.checkPenalty = checkPenalty
      this.spellFailure = spellFailure
      this.weight = weight
      this.specialProperties = specialProperties
    }
}

export default ProtectiveItemsTotal
