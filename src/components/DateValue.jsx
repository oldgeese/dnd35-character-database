import { Box } from '@mui/material'
import { useField } from 'formik'
import React from 'react'

const DateValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta
  const displayValue = new Date(value).toLocaleString()
  return (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {displayValue}
    </Box>
  )
})
DateValue.displayName = 'DateValue'

export default DateValue
