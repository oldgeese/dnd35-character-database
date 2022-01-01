import { Box } from '@mui/material'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'
import { Skill } from '../models'

type SkillAbilityValueProps = {
  align: string
  input: boolean
  name: string
  skill: Skill
}

const SkillAbilityValue: React.VFC<SkillAbilityValueProps> = React.memo(({ input, skill, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    (input && skill.fullEditable)
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
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
