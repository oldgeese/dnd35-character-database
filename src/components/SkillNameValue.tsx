"use client"

import { Stop } from "@mui/icons-material"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import React from "react"
import { Controller } from "react-hook-form"
import type { Character, Skill } from "../models"

type SkillNameValueProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  input: boolean
  name: string
  subName: string
  skill: Skill
  values: Character
}

const SkillNameValue = ({ input, name, subName, skill, ...props }: SkillNameValueProps) => {
  const value = get(props.values, name, "")

  if (input && skill.hasSubName) {
    return (
      <>
        <Grid size={3}>
          <div sx={{ minHeight: "20px", border: "1px solid black" }} {...props}>
            <Typography variant="label2" align={props.align}>
              {value}
              {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ""}
            </Typography>
          </div>
        </Grid>
        <Grid size={9}>
          <Controller
            name={subName}
            render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />}
          />
        </Grid>
      </>
    )
  }
  if (input && skill.fullEditable) {
    return (
      <Controller
        name={name}
        render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />}
      />
    )
  }

  return (
    <Typography
      sx={{ width: "100%", paddingLeft: "2px", minHeight: "20px", border: "1px solid black" }}
      component="div"
      variant="label2"
      align={props.align}
    >
      {value}
      {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ""}
      {skill.hasSubName ? skill.subName : ""}
    </Typography>
  )
}

export default SkillNameValue
