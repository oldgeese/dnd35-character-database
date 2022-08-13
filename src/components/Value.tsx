import { Box, TextField } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

type ValueProps = {
  align?: string
  input: boolean
  name: string
}

const Value: React.VFC<ValueProps>= React.memo(({ input, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)

  return (
    input
      ? <Controller
          control={control}
          name={props.name}
          render={({field}) => (
          <TextField size="small" fullWidth margin="none" variant="outlined" {...field}/>
        )}
        />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value}
        </Box>
      )
  )
})
Value.displayName = 'Value'

export default Value
