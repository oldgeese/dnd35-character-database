import { v4 as uuidv4 } from 'uuid'

class Attack {
  id: string
  attack: string
  attackBonus: string
  critical: string
  weight: string
  type: string
  range: string
  notes: string
  damage: string
  constructor(attack: string,
    attackBonus: string,
    critical: string,
    weight: string,
    type: string,
    range: string,
    notes: string,
    damage: string) {
      this.id = uuidv4()
      this.attack = attack
      this.attackBonus = attackBonus
      this.critical = critical
      this.weight = weight
      this.type = type
      this.range = range
      this.notes = notes
      this.damage = damage
    }
}

export default Attack
