import { Box, Grid } from '@material-ui/core'
import { Stop } from '@material-ui/icons'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'

const SkillNameValue = React.memo(({
  input, name, subName, skill, ...props
}) => {
  const [, meta] = useField(name)
  const { value } = meta

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
          <FastField name={subName} component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
        </Grid>
      </>
    )
  } if (input && skill.fullEditable) {
    return <FastField name={name} component={TextField} size="small" fullWidth margin="none" variant="outlined" {...props} />
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
