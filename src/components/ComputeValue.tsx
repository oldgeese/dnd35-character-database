"use client"

import type { Character } from "@/src/models"
import { Box, TextField } from "@mui/material"
import { get } from "es-toolkit/compat"
import { Controller, useFormContext, type UseFormReturn } from "react-hook-form"

type ComputeValueProps = {
  align?: string
  input: boolean
  name: string
  subscribe: string
  compute: any
  values: Character
}

const ComputeValue = ({ input, ...props }: ComputeValueProps) => {
  const { control } = input ? useFormContext() : ({} as UseFormReturn)
  const value = input ? props.compute(props.subscribe.split(",")) : get(props.values, props.name, "")

  // const watchFields = useWatch({
  //   control,
  //   name: props.subscribe.split(","),
  //   disabled: !input,
  // })
  // useEffect(() => {
  //   if (input && watchFields.every((v) => v !== undefined)) {
  //     setValue(props.name, props.compute(watchFields))
  //   }
  // }, [setValue, input, props.name, props.compute, watchFields, watchFields.every])

  return input ? (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" disabled {...field} />}
    />
  ) : (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1}>
      {value}
    </Box>
  )
}

export default ComputeValue
