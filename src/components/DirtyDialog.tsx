import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React, { useState } from 'react'

const DirtyDialog = (props) => {
  const [, setOpen] = useState(false)
  const { message, onCancel, onConfirm } = props

  const handleCancel = () => {
    setOpen(false)
    onCancel()
  }

  const handleConfirm = () => {
    setOpen(false)
    onConfirm()
  }

  return (
    <Dialog
      open
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">未保存の変更があります</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary" autoFocus>
          編集に戻る
        </Button>
        <Button onClick={handleConfirm} color="primary">
          離れる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DirtyDialog
