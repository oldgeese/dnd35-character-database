import { Button, CircularProgress } from '@mui/material'
import firebase from 'firebase/app'
import 'firebase/firestore'
import {
  Field,
  Form,
  Formik,
} from 'formik'
import { TextField } from 'formik-material-ui'
import jsSHA from 'jssha'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Label,
  PromptIfDirty,
} from '../components'
import { Character } from '../models'
import CharacterSheet from '../sheets'

import { getTitle } from '../utils'

const validatePassword = async (id, values) => {
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
      passwordOnServer = snapshot.data().password
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

const EditCharForm = () => {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024')
  const { id } = useParams()
  const [character, setCharacter] = useState(new Character())
  const db = firebase.firestore()

  useEffect(() => {
    const docRef = db.collection('characters').doc(id)
    docRef.get().then((doc) => {
      if (doc.exists) {
        const retrievedChar = Object.assign(new Character(), doc.data())
        setCharacter(retrievedChar)
        document.title = getTitle(retrievedChar)
      } else {
        console.log('No such document!')
      }
    }).catch((error) => {
      console.log('Error getting document:', error)
    })
  }, [id, db])

  return (
    <Formik
      initialValues={character}
      enableReinitialize
      onSubmit={async (values, actions) => {
        try {
          await validatePassword(id, values)
        } catch (err) {
          actions.setFieldError('passwordForUpdate', 'パスワードが誤っています。')
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
      }}
    >
      {({ values, errors, ...props }) => {
        if (!values.id) {
          return <div />
        }

        return (
          <Form>
            <PromptIfDirty />
            <CharacterSheet input values={values} />
            <Label>パスワード</Label>
            <Field name="passwordForUpdate" type="password" component={TextField} size="small" margin="none" variant="outlined" />
            <br />
            <br />
            {props.isSubmitting
              ? <CircularProgress />
              : <Button onClick={props.handleSubmit} variant="contained" color="primary" disabled={props.isSubmitting}>保存</Button>}
          </Form>
        )
      }}
    </Formik>
  )
}

export default EditCharForm
