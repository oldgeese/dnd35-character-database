import { v4 as uuidv4 } from 'uuid'

class GrappleModifier {
  constructor(total, bab, strengthModifier, sizeModifier, miscModifier) {
    this.id = uuidv4()
    this.total = total
    this.bab = bab
    this.strengthModifier = strengthModifier
    this.sizeModifier = sizeModifier
    this.miscModifier = miscModifier
  }
}

export default GrappleModifier
