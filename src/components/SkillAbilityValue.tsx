"use client"

import type { Character, Skill } from "@/src/models"
import { Box, TextField } from "@mui/material"
import { get } from "es-toolkit/compat"
import React from "react"
import { Controller } from "react-hook-form"

type SkillAbilityValueProps = {
  align: string
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
    <Box width="100%" minHeight="20px" fontSize="caption.fontSize" border={1} {...props}>
      {value}
      {skill.hasArmorPenalty ? "*" : ""}
    </Box>
  )
}

export default SkillAbilityValue
