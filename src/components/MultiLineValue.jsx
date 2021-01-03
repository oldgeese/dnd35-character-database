import { Box } from '@material-ui/core'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'

const MultiLineValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return (
    input
      ? <FastField component={TextField} multiline fullWidth rows={10} size="small" style={{ width: '100%' }} {...props} />
      : (
        <Box width="100%" minHeight="200px" fontSize="caption2.fontSize" border={1} {...props}>
          {value.split(/\r\n|\r|\n/).map((item) => (
            <React.Fragment key={item}>
              {item}
              <br />
            </React.Fragment>
          ))}
        </Box>
      )
  )
})
MultiLineValue.displayName = 'MultiLineValue'

export default MultiLineValue
