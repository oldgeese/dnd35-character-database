"use client"

import type { Character } from "@/src/models"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import { Controller, useFormContext, type UseFormReturn } from "react-hook-form"

type ComputeValueProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
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
    <Typography
      sx={{ width: "100%", paddingLeft: "2px", minHeight: "20px", border: "1px solid black" }}
      variant="label2"
      component="div"
      align={props.align}
    >
      {value}
    </Typography>
  )
}

export default ComputeValue
