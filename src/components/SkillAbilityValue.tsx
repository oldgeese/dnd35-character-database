import { Box, TextField } from '@mui/material'
import React from 'react'
import { Skill } from '../models'
import { Controller, useFormContext } from 'react-hook-form'

type SkillAbilityValueProps = {
  align: string
  input: boolean
  name: string
  skill: Skill
}

const SkillAbilityValue: React.VFC<SkillAbilityValueProps> = React.memo(({ input, skill, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)

  return (
    (input && skill.fullEditable)
      ? <Controller
          control={control}
          name={props.name}
          render={({field}) => (
          <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />
        )}
        />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption.fontSize" border={1} {...props}>
          {value}
          {skill.hasArmorPenalty ? '*' : ''}
        </Box>
      )
  )
})
SkillAbilityValue.displayName = 'SkillAbilityValue'

export default SkillAbilityValue
