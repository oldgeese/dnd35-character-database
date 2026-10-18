import { Box, TextField } from '@mui/material'
import React, { useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

const DEFAULT_ROWS = 10
const MIN_ROWS = 2

type MultiLineValueProps = {
  align?: string
  input: boolean
  name: string
  rows?: number
  style?: object
}

// TextareaAutosize overrides any pixel height we set, so the drag handle resizes by rows.
// Pointer events with touch-action: none make the handle draggable on touch screens too.
const useRowResize = (initialRows: number) => {
  const [rows, setRows] = useState(initialRows)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragRef = useRef<{ startY: number, startRows: number, rowHeight: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return
    e.preventDefault()
    dragRef.current = {
      startY: e.clientY,
      startRows: rows,
      rowHeight: textarea.clientHeight / rows,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const delta = Math.round((e.clientY - drag.startY) / drag.rowHeight)
    setRows(Math.max(MIN_ROWS, drag.startRows + delta))
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  return {
    rows,
    textareaRef,
    handleProps: {
      onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp,
    },
  }
}

const MultiLineValue: React.VFC<MultiLineValueProps> = React.memo(({ input, ...props }) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)
  const { rows, textareaRef, handleProps } = useRowResize(DEFAULT_ROWS)

  return input
    ? <Controller
        control={control}
        name={props.name}
        render={({field}) => (
        <Box position="relative" width="100%">
          <TextField multiline fullWidth size="small" style={{ width: '100%' }} {...field} rows={rows} inputRef={textareaRef} />
          <Box
            {...handleProps}
            aria-hidden
            data-testid={`${props.name}-resize-handle`}
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 24,
              height: 24,
              cursor: 'ns-resize',
              touchAction: 'none',
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4) 56%, transparent 56%, transparent 68%, rgba(0,0,0,0.4) 68%, rgba(0,0,0,0.4) 74%, transparent 74%)',
            }}
          />
        </Box>
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
