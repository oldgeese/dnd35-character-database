import { Box } from '@material-ui/core'
import {
  FastField,
  useField,
  useFormikContext,
  getIn,
} from 'formik'
import {
  TextField,
} from 'formik-material-ui'
import React, { useEffect } from 'react'

const ComputeValue = React.memo(({ input, ...props }) => {
  const [, meta] = useField(props.name)
  const { value } = meta
  const {
    values, touched, setFieldValue, setTouched,
  } = useFormikContext()

  const subscribes = props.subscribe.split(',')
  const publishers = subscribes.map((x) => getIn(values, x)).filter((x) => (typeof x !== 'undefined'))
  const touchedPublishers = subscribes.map((x) => getIn(touched, x)).filter((x) => (typeof x !== 'undefined'))

  useEffect(() => {
    if (touchedPublishers.length) {
      setFieldValue(props.name, props.compute(publishers), false)
      setTouched({}, false)
    }
  }, [publishers, touchedPublishers, setFieldValue, setTouched, props.name, props])

  return (
    input
      ? <FastField component={TextField} size="small" fullWidth margin="none" variant="outlined" disabled {...props} compute="" />
      : (
        <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props} compute="">
          {value}
        </Box>
      )
  )
})
ComputeValue.displayName = 'ComputeValue'

export default ComputeValue
