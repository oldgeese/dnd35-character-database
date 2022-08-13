import { yupResolver } from '@hookform/resolvers/yup'
import { Button, CircularProgress, TextField } from '@mui/material'
import firebase from 'firebase/app'
import 'firebase/firestore'
import jsSHA from 'jssha'
import React from 'react'
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
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
  const db = firebase.firestore()
  document.title = getTitle(new Character())

  const methods = useForm({
    defaultValues: new Character(),
    resolver: yupResolver(schema),
  })
  const { control, formState:{isSubmitting, errors}, handleSubmit, getValues } = methods
  const character = getValues()

  const onSubmit: SubmitHandler<Character>=async (values) => {
    const newDocRef = db.collection('characters').doc()
    const newValues = { ...values }
    newValues.updateTime = new Date()
    newValues.id = newDocRef.id

    // eslint-disable-next-line new-cap
    const shaObj = new jsSHA('SHA-256', 'TEXT')
    shaObj.update(values.password)
    newValues.password = shaObj.getHash('HEX')
    newValues.passwordConfirm = ''

    try {
      await newDocRef.set(JSON.parse(JSON.stringify(newValues)))
      console.log('Document successfully written!')
      document.location.href = '/'
    } catch (error) {
      console.error('Error writing document: ', error)
    }
  }

  return (
    <FormProvider {...methods}>
      <form>
        <PromptIfDirty />
        <CharacterSheet input values={character} />
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
        {isSubmitting
          ? <CircularProgress />
          : <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={isSubmitting}>保存</Button>}
      </form>
    </FormProvider>
  )
}

export default NewCharForm
