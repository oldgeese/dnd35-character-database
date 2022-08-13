import { Box, TextField } from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

type ComputeValueProps = {
  align?: string
  input: boolean
  name: string
  subscribe: string
  compute: any
}

const ComputeValue: React.VFC<ComputeValueProps> = ({ input, ...props }) => {
  const { control, getValues, setValue } = useFormContext()
  const value = getValues(props.name)
  const watchFields = useWatch({
    control,
    name: props.subscribe.split(','),
    disabled: !input,
  })
  useEffect(() => {
    if (input && watchFields.every(v => v !== undefined)) {
      setValue(props.name, props.compute(watchFields))
    }
  },[setValue, input, value, ...watchFields])

  return (
    input
      ? <Controller
          control={control}
          name={props.name}
          render={({field}) => (
          <TextField size="small" fullWidth margin="none" variant="outlined" disabled {...field}/>
        )}
        />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
          {value}
        </Box>
      )
  )
}
ComputeValue.displayName = 'ComputeValue'

export default ComputeValue
