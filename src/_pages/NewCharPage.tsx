import React from 'react'

import { Label, LinkToHome } from '../components'
import { NewCharForm } from '../forms'

const NewCharPage = () => (
  <>
    <Label><LinkToHome /></Label>
    <br/>
    <NewCharForm />
  </>
)

export default NewCharPage
