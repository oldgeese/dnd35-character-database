"use client"

import { Box, TextField } from "@mui/material"
import React from "react"
import { Controller } from "react-hook-form"
import type { Character } from "@/src/models"
import { get } from "es-toolkit/compat"

type ValueProps = {
  align?: string
  input: boolean
  name: string
  values: Character
}

const Value = ({ input, ...props }: ValueProps) => {
  const value = get(props.values, props.name, "")

  return input ? (
    <Controller
      name={props.name}
      render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />}
    />
  ) : (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {value}
    </Box>
  )
}

export default Value
