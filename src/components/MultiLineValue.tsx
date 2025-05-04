"use client"

import type { Character } from "@/src/models"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import React from "react"
import { Controller } from "react-hook-form"

type MultiLineValueProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
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
    <Typography
      variant="label2"
      align={props.align}
      component="div"
      sx={{ width: "100%", height: "100%", border: "1px solid black" }}
    >
      {value.split(/\r\n|\r|\n/).map((item: string) => (
        <React.Fragment key={item}>
          {item}
          <br />
        </React.Fragment>
      ))}
    </Typography>
  )
}

export default MultiLineValue
