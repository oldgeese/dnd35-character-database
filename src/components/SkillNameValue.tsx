import { Box, Grid, TextField } from '@mui/material'
import { Stop } from '@mui/icons-material'
import React from 'react'
import { Skill } from '../models'
import { Controller, useFormContext } from 'react-hook-form'

type SkillNameValueProps = {
  align: string
  input: boolean
  name: string
  subName: string
  skill: Skill
}

const SkillNameValue: React.VFC<SkillNameValueProps> = React.memo(({ input, name, subName, skill, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(name)

  if (input && skill.hasSubName) {
    return (
      <>
        <Grid item xs={3}>
          <Box minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
            {value}
            {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ''}
          </Box>
        </Grid>
        <Grid item xs={9}>
          <Controller
            control={control}
            name={subName}
            render={({field}) => (
              <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />
            )}
            />
        </Grid>
        </>
    )
  } 
  if (input && skill.fullEditable) {
    return (
      <Controller
        control={control}
        name={name}
        render={({field}) => (
          <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />
        )}
        />
    )
  }

  return (
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {value}
      {skill.usableUntrained ? <Stop style={{ fontSize: 12 }} /> : ''}
      {skill.hasSubName ? skill.subName : ''}
    </Box>
  )
})
SkillNameValue.displayName = 'SkillNameValue'

export default SkillNameValue
