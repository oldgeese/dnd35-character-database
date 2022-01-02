import React from 'react'

import { Label, LinkToHome, LinkToEdit } from '../components'
import { ViewCharForm } from '../forms'

const ViewCharPage = () => (
  <>
    <Label component="span">
      <LinkToHome />
    </Label>
    <Label component="span">
      <LinkToEdit />
    </Label>
    <br/>
    <ViewCharForm />
  </>
)

export default ViewCharPage
