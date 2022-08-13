import { Button, CircularProgress, TextField } from '@mui/material'
import firebase from 'firebase/app'
import 'firebase/firestore'
import jsSHA from 'jssha'
import React, { useEffect, useState } from 'react'
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
    Label,
    PromptIfDirty
} from '../components'
import { Character } from '../models'
import CharacterSheet from '../sheets'
import { getTitle } from '../utils'

const validatePassword = async (id: string, values: Character) => {
  const db = firebase.firestore()
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-256', 'TEXT')
  shaObj.update(values.passwordForUpdate)
  const hashForUpdate = shaObj.getHash('HEX')
  const editDocRef = db.collection('characters').doc(id)

  try {
    const snapshot = await editDocRef.get()
    let passwordOnServer
    if (snapshot.exists) {
      passwordOnServer = (snapshot.data() as Character)?.password
    } else {
      throw new Error('document does not exist.')
    }

    if (passwordOnServer !== hashForUpdate) {
      console.log('wrong password.')
      throw new Error('wrong password.')
    }
  } catch (err) {
    console.error('Error :', err)
    throw err
  }
}

const EditCharForm: React.VFC<{}> = () => {
  document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=1024')
  const { id } = useParams<{id: string}>()
  const [_, setCharacter] = useState(new Character())
  const db = firebase.firestore()

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
    try {
      await validatePassword(id, values)
    } catch (err) {
      setError('passwordForUpdate', {type:'manual', message:'パスワードが誤っています。' })
      return
    }
    const editDocRef = db.collection('characters').doc(id)
    const newValues = { ...values }
    newValues.updateTime = new Date()
    newValues.id = editDocRef.id
    newValues.passwordForUpdate = ''
    try {
      await editDocRef.set(JSON.parse(JSON.stringify(newValues)))
      console.log('Document successfully written!')
      document.location.href = '/'
    } catch (error) {
      console.error('Error writing document: ', error)
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
