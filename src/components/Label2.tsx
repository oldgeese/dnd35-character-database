import { Box } from '@mui/material'
import React from 'react'

type Label2Props = {
  align?: string
  className?: string
  component?: React.ElementType<any>
  children: React.ReactNode
}

const Label2: React.VFC<Label2Props> = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption2.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)
Label2.displayName = 'Label2'

export default Label2
