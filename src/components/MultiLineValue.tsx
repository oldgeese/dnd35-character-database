import { Box, TextField } from '@mui/material'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

type MultiLineValueProps = {
  align?: string
  input: boolean
  name: string
  rows?: number
  style?: object
}

const MultiLineValue: React.VFC<MultiLineValueProps> = React.memo(({ input, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)

  return input
    ? <Controller
        control={control}
        name={props.name}
        render={({field}) => (
        <TextField multiline fullWidth size="small" style={{ width: '100%' }} {...field} rows={10} />
      )}
      />
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
