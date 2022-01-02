import { v4 as uuidv4 } from 'uuid'

class HitPoint {
  id: string
  total: string
  damageReduction: string
  current: string
  nonlethalDamage: string
  constructor(total: string,
    damageReduction: string,
    current: string,
    nonlethalDamage: string) {
      this.id = uuidv4()
      this.total = total
      this.damageReduction = damageReduction
      this.current = current
      this.nonlethalDamage = nonlethalDamage
    }
}

export default HitPoint
