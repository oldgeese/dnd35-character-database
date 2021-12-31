import { v4 as uuidv4 } from 'uuid'

class Attack {
  constructor(attack, attackBonus, critical, weight, type, range, notes, damage) {
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
