import { v4 as uuidv4 } from 'uuid'

class Load {
  constructor(lightLoad, mediumLoad, heavyLoad, liftOverHead, liftOffGround, pushOrDrag) {
    this.id = uuidv4()
    this.lightLoad = lightLoad
    this.mediumLoad = mediumLoad
    this.heavyLoad = heavyLoad
    this.liftOverHead = liftOverHead
    this.liftOffGround = liftOffGround
    this.pushOrDrag = pushOrDrag
  }
}

export default Load
