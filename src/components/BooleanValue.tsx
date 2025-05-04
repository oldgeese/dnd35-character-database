"use client"

import type { Character } from "@/src/models"
import { Check } from "@mui/icons-material"
import Checkbox from "@mui/material/Checkbox"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import type React from "react"
import { Controller } from "react-hook-form"

type BooleanValueProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  input: boolean
  name: string
  values: Character
}

const BooleanValue = ({ input, ...props }: BooleanValueProps) => {
  const value = get(props.values, props.name)

  return input ? (
    <Controller
      name={props.name}
      render={({ field }) => (
        <Checkbox size="small" color="primary" checked={field.value} indeterminate={false} {...field} />
      )}
    />
  ) : (
    <Typography
      sx={{ width: "100%", minHeight: "20px", border: "1px solid black" }}
      component="div"
      variant="label2"
      {...props}
    >
      {value ? <Check style={{ fontSize: 12 }} /> : ""}
    </Typography>
  )
}

export default BooleanValue
