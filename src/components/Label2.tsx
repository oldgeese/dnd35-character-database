import { Box } from '@mui/material'
import React from 'react'

const Label2 = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption2.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)
Label2.displayName = 'Label2'

export default Label2
