import { Box } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import Label from './Label'
import Value from './Value'

type ImageValueProps = {
  input: boolean
  name: string
}

const ImageValue: React.VFC<ImageValueProps> = React.memo(({ input, ...props }) => {
  const { getValues } = useFormContext()
  const value = getValues(props.name)

  return (
    input
      ? (
        <>
          <Label>画像URL</Label>
          <br />
          <Value input {...props} />
        </>
      )
      : (
        <Box width="100%" border={1} style={{ maxHeight: '250px' }}>
          <img
            alt=""
            src={value}
            style={{
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              margin: 'auto',
            }}
            />
        </Box>
      )
  )
})
ImageValue.displayName = 'ImageValue'

export default ImageValue
