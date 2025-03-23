"use client"

import { Stop } from "@mui/icons-material"
import { Box, Grid, TextField } from "@mui/material"
import { get } from "es-toolkit/compat"
import React from "react"
import { Controller } from "react-hook-form"
import type { Character, Skill } from "../models"

type SkillNameValueProps = {
  align: string
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
        <Grid item xs={3}>
          <Box minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
            {value}
            {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ""}
          </Box>
        </Grid>
        <Grid item xs={9}>
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
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {value}
      {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ""}
      {skill.hasSubName ? skill.subName : ""}
    </Box>
  )
}

export default SkillNameValue
