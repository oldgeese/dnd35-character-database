import { v4 as uuidv4 } from 'uuid'

class ProtectiveItemsTotal {
  constructor(acBonus, dexMax, checkPenalty, spellFailure, weight, specialProperties) {
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
