import { Box } from '@mui/material'
import React from 'react'

const Label = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)
Label.displayName = 'Label'

export default Label
