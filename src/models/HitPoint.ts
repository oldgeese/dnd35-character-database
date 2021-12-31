import { v4 as uuidv4 } from 'uuid'

class HitPoint {
  constructor(total, damageReduction, current, nonlethalDamage) {
    this.id = uuidv4()
    this.total = total
    this.damageReduction = damageReduction
    this.current = current
    this.nonlethalDamage = nonlethalDamage
  }
}

export default HitPoint
