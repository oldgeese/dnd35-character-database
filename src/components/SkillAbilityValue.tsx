"use client"

import type { Character, Skill } from "@/src/models"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import React from "react"
import { Controller } from "react-hook-form"

type SkillAbilityValueProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  input: boolean
  name: string
  skill: Skill
  values: Character
}

const SkillAbilityValue = ({ input, skill, ...props }: SkillAbilityValueProps) => {
  const value = get(props.values, props.name, "")

  return input && skill.fullEditable ? (
    <Controller
      name={props.name}
      render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />}
    />
  ) : (
    <Typography
      sx={{ width: "100%", paddingLeft: "2px", minHeight: "20px", border: "1px solid black" }}
      component="div"
      variant="label"
      align={props.align}
    >
      {value}
      {skill.hasArmorPenalty ? "*" : ""}
    </Typography>
  )
}

export default SkillAbilityValue
