import { Box } from '@mui/material'
import { Check } from '@mui/icons-material'
import {
  FastField,
  useField,
} from 'formik'
import {
  Checkbox,
} from 'formik-material-ui'
import React from 'react'

const BooleanValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={Checkbox} size="small" color="primary" checked={value} type="checkbox" indeterminate={false} {...props} />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value ? <Check style={{ fontSize: 12 }} /> : ''}
        </Box>
      )
  )
})
BooleanValue.displayName = 'BooleanValue'

export default BooleanValue
