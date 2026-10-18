import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import React, { useState } from 'react'

import { duplicateCharacter, SaveError } from '../api/characters'
import { Character } from '../models'

type DuplicateCharDialogProps = {
  character: Character
  onClose: () => void
}

const errorMessages = {
  'wrong-password': 'パスワードが誤っています。',
  'not-editable': 'このキャラクターは複製できません。',
  other: '複製に失敗しました。',
}

const DuplicateCharDialog = (props: DuplicateCharDialogProps) => {
  const { character, onClose } = props
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    setErrorMessage('')
    try {
      await duplicateCharacter(character.id, password)
      onClose()
    } catch (error) {
      console.error('Error duplicating character: ', error)
      setErrorMessage(errorMessages[error instanceof SaveError ? error.kind : 'other'])
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open
      onClose={submitting ? undefined : onClose}
      aria-labelledby="duplicate-dialog-title"
    >
      <DialogTitle id="duplicate-dialog-title">キャラクターの複製</DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{character.pcName}」を複製します。複製元のパスワードを入力してください。
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          type="password"
          label="パスワード"
          size="small"
          margin="normal"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errorMessage !== ''}
          helperText={errorMessage}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          複製
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DuplicateCharDialog
