import { v4 as uuidv4 } from 'uuid'

class Load {
  id: string
  lightLoad: string
  mediumLoad: string
  heavyLoad: string
  liftOverHead: string
  liftOffGround: string
  pushOrDrag: string
  constructor(lightLoad: string,
    mediumLoad: string,
    heavyLoad: string,
    liftOverHead: string,
    liftOffGround: string,
    pushOrDrag: string) {
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
