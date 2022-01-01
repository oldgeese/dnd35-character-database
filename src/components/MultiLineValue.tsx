import { Box } from '@mui/material'
import {
  FastField,
  useField,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React from 'react'

type MultiLineValueProps = {
  align?: string
  input: boolean
  name: string
  rows?: number
  style?: object
}

const MultiLineValue: React.VFC<MultiLineValueProps> = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta

  return input
    ? <FastField component={TextField} multiline fullWidth size="small" style={{ width: '100%' }} {...props} rows={10} />
    : (
      <Box width="100%" minHeight="200px" fontSize="caption2.fontSize" border={1} {...props}>
        {value.split(/\r\n|\r|\n/).map((item: string) => (
          <React.Fragment key={item}>
            {item}
            <br />
          </React.Fragment>
        ))}
      </Box>
    );
})
MultiLineValue.displayName = 'MultiLineValue'

export default MultiLineValue
