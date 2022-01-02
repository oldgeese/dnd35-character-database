import { v4 as uuidv4 } from 'uuid'

class Money {
  id: string
  cp: string
  sp: string
  gp: string
  pp: string
  constructor(cp: string,
    sp: string,
    gp: string,
    pp: string) {
      this.id = uuidv4()
      this.cp = cp
      this.sp = sp
      this.gp = gp
      this.pp = pp
    }
}

export default Money
