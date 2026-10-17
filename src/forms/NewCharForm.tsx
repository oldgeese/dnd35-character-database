import { yupResolver } from '@hookform/resolvers/yup'
import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import React, { useState } from 'react'
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { createCharacter } from '../api/characters'
import {
    Label,
    PromptIfDirty
} from '../components'
import { Character } from '../models'
import CharacterSheet from '../sheets'
import { getTitle } from '../utils'

const NewCharForm = () => {
  document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=1024')
  const schema = Yup.object().shape({
    passwordConfirm: Yup.mixed().oneOf([Yup.ref('password')], 'パスワードが一致しません。'),
  })
  const [saveFailed, setSaveFailed] = useState(false)
  document.title = getTitle(new Character())

  const methods = useForm({
    defaultValues: new Character(),
    resolver: yupResolver(schema),
  })
  const { control, formState:{isSubmitting, errors}, handleSubmit, getValues } = methods
  const character = getValues()

  const onSubmit: SubmitHandler<Character>=async (values) => {
    setSaveFailed(false)
    try {
      await createCharacter(values, values.password)
      document.location.href = '/'
    } catch (error) {
      console.error('Error saving character: ', error)
      setSaveFailed(true)
    }
  }

  return (
    <FormProvider {...methods}>
      <form>
        <PromptIfDirty />
        <CharacterSheet input values={character} />
        <Alert severity="warning" sx={{ mt: 2 }}>他のサイトやサービスで使っているパスワードは使わないでください。</Alert>
        <Label>パスワード</Label>
        <Controller
          control={control}
          name="password"
          render={({field}) => (
            <TextField error={errors.password? true : false} type="password" size="small" margin="none" variant="outlined" {...field} />
          )}
          />
        <Label>パスワード(確認用)</Label>
        <Controller
          control={control}
          name="passwordConfirm"
          render={({field}) => (
            <TextField error={errors.passwordConfirm? true : false} helperText={errors.passwordConfirm?.message && errors.passwordConfirm?.message} type="password" size="small" margin="none" variant="outlined" {...field} />
          )}
          />
        <br />
        <br />
        {saveFailed && <Alert severity="error" sx={{ mb: 2 }}>保存に失敗しました。時間をおいてもう一度お試しください。</Alert>}
        {isSubmitting
          ? <CircularProgress />
          : <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={isSubmitting}>保存</Button>}
      </form>
    </FormProvider>
  )
}

export default NewCharForm
