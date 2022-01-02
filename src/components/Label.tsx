import { Box } from '@mui/material'
import React from 'react'

type LabelProps = {
  align?: string
  className?: string
  component?: React.ElementType<any>
  children: React.ReactNode
}

const Label: React.VFC<LabelProps> = React.memo((props) => (
  <Box width="100%" padding="2px" fontSize="caption.fontSize" {...props}>
    {props.children}
  </Box>
), (prev, next) => prev.children === next.children)
Label.displayName = 'Label'

export default Label
