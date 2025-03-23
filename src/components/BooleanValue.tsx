"use client"

import type { Character } from "@/src/models"
import { Check } from "@mui/icons-material"
import { Box, Checkbox } from "@mui/material"
import { get } from "es-toolkit/compat"
import type React from "react"
import { Controller } from "react-hook-form"

type BooleanValueProps = {
  align?: string
  input: boolean
  name: string
  children: React.ReactNode
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
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {value ? <Check style={{ fontSize: 12 }} /> : ""}
    </Box>
  )
}

export default BooleanValue
