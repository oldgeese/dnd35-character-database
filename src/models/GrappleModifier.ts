import { v4 as uuidv4 } from 'uuid'

class GrappleModifier {
  id: string
  total: string
  bab: string
  strengthModifier: string
  sizeModifier: string
  miscModifier: string
  constructor(total: string,
    bab: string,
    strengthModifier: string,
    sizeModifier: string,
    miscModifier: string) {
      this.id = uuidv4()
      this.total = total
      this.bab = bab
      this.strengthModifier = strengthModifier
      this.sizeModifier = sizeModifier
      this.miscModifier = miscModifier
    }
}

export default GrappleModifier
