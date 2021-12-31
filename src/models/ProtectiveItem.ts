import { v4 as uuidv4 } from 'uuid'

class ProtectiveItem {
  constructor(name, acBonus, type, dexMax, checkPenalty, spellFailure, weight, specialProperties) {
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
