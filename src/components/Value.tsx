import { Box } from '@mui/material'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'

type ValueProps = {
  align?: string
  input: boolean
  name: string
}

const Value: React.VFC<ValueProps>= React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value}
        </Box>
      )
  )
})
Value.displayName = 'Value'

export default Value
