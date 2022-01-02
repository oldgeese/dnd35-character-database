import { Check } from '@mui/icons-material'
import { Box } from '@mui/material'
import {
  FastField,
  useField,
} from 'formik'
import {
  Checkbox,
} from 'formik-mui'
import React from 'react'

type BooleanValueProps = {
  align?: string
  input: boolean
  name: string
  children: React.ReactNode
}

const BooleanValue: React.VFC<BooleanValueProps> = React.memo(({ input, ...props }) => {
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
