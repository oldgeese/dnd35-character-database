import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import React, { useEffect, useState } from 'react'
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { SaveError, updateCharacter } from '../api/characters'
import {
    Label,
    PromptIfDirty
} from '../components'
import { Character } from '../models'
import CharacterSheet from '../sheets'
import { getTitle } from '../utils'

const EditCharForm: React.VFC<{}> = () => {
  document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=1024')
  const { id } = useParams<{id: string}>()
  const [_, setCharacter] = useState(new Character())
  const db = firebase.firestore()
  const [saveFailed, setSaveFailed] = useState(false)

  const methods = useForm({
    defaultValues: new Character(),
  })
  const { control, formState:{isSubmitting, errors}, handleSubmit, reset, getValues, setError } = methods

  useEffect(() => {
    const docRef = db.collection('characters').doc(id)
    docRef.get().then((doc) => {
      if (doc.exists) {
        const retrievedChar = Object.assign(new Character(), doc.data())
        setCharacter(retrievedChar)
        reset(retrievedChar)
        document.title = getTitle(retrievedChar)
      } else {
        console.log('No such document!')
      }
    }).catch((error) => {
        console.log('Error getting document:', error)
      })
  }, [id, db])

  const character = getValues()

  const onSubmit: SubmitHandler<Character> = async (values) => {
    setSaveFailed(false)
    try {
      await updateCharacter(id, values, values.passwordForUpdate)
      document.location.href = '/'
    } catch (error) {
      console.error('Error saving character: ', error)
      const kind = error instanceof SaveError ? error.kind : 'other'
      if (kind === 'wrong-password') {
        setError('passwordForUpdate', { type: 'manual', message: 'パスワードが誤っています。' })
      } else if (kind === 'not-editable') {
        setError('passwordForUpdate', { type: 'manual', message: 'このキャラクターは編集できません。' })
      } else {
        setSaveFailed(true)
      }
    }
  }

  return (
    <>
      {character.id ? 
        <FormProvider {...methods}>
          <form>
            <PromptIfDirty />
            <CharacterSheet input values={character} />
            <Label>パスワード</Label>
            <Controller
              control={control}
              name="passwordForUpdate"
              render={({field}) => (
                <TextField error={errors.passwordForUpdate? true : false} helperText={errors.passwordForUpdate?.message && errors.passwordForUpdate?.message} type="password" size="small" margin="none" variant="outlined" {...field}/>
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
        :
        <div></div>
    }
      </>
  )
}

export default EditCharForm
