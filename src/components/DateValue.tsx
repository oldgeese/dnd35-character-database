import { Box } from '@mui/material'
import React from 'react'
import { useFormContext } from 'react-hook-form'

type DateValueProps = {
  input: boolean
  name: string
}

const DateValue: React.VFC<DateValueProps> = React.memo(({ input, ...props }) => {
  const { getValues } = useFormContext()
  const value = getValues(props.name)
  const displayValue = new Date(value).toLocaleString()

  return (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {displayValue}
    </Box>
  )
})
DateValue.displayName = 'DateValue'

export default DateValue
