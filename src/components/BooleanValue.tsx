import { Check } from '@mui/icons-material'
import { Box, Checkbox } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

type BooleanValueProps = {
  align?: string
  input: boolean
  name: string
  children: React.ReactNode
}

const BooleanValue: React.VFC<BooleanValueProps> = React.memo(({ input, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)

  return (
    input
      ? <Controller
          control={control}
          name={props.name}
          render={({field}) => (
          <Checkbox size="small" color="primary" checked={field.value} indeterminate={false} {...field} />
        )}
        />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value ? <Check style={{ fontSize: 12 }} /> : ''}
        </Box>
      )
  )
})
BooleanValue.displayName = 'BooleanValue'

export default BooleanValue
