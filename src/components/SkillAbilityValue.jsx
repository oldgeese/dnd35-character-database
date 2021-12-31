import { Box } from '@mui/material'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'

const SkillAbilityValue = React.memo(({ input, skill, ...props }) => {
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
