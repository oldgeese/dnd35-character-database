"use client"

import { Box, TextField } from "@mui/material"
import React from "react"
import { Controller } from "react-hook-form"
import type { Character } from "@/src/models"
import { get } from "es-toolkit/compat"

type MultiLineValueProps = {
  align?: string
  input: boolean
  name: string
  rows?: number
  style?: object
  values: Character
}

const MultiLineValue = ({ input, ...props }: MultiLineValueProps) => {
  const value = get(props.values, props.name, "")

  return input ? (
    <Controller
      name={props.name}
      render={({ field }) => (
        <TextField multiline fullWidth size="small" style={{ width: "100%" }} {...field} rows={10} />
      )}
    />
  ) : (
    <Box width="100%" minHeight="200px" fontSize="caption2.fontSize" border={1}>
      {value.split(/\r\n|\r|\n/).map((item: string) => (
        <React.Fragment key={item}>
          {item}
          <br />
        </React.Fragment>
      ))}
    </Box>
  );
}

export default MultiLineValue
