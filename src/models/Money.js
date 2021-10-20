import { v4 as uuidv4 } from 'uuid'

class Money {
  constructor(cp, sp, gp, pp) {
    this.id = uuidv4()
    this.cp = cp
    this.sp = sp
    this.gp = gp
    this.pp = pp
  }
}

export default Money
