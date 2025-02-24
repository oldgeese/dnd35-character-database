import React from 'react'

import { Label, LinkToHome } from '../components'
import { EditCharForm } from '../forms'

const EditCharPage = () => (
  <>
    <Label><LinkToHome /></Label>
    <br/>
    <EditCharForm />
  </>
)

export default EditCharPage
