import { Button } from '@material-ui/core'
import firebase from 'firebase/app'
import 'firebase/firestore'
import {
  Field,
  Form,
  Formik,
} from 'formik'
import { TextField } from 'formik-material-ui'
import jsSHA from 'jssha'
import React from 'react'
import * as Yup from 'yup'

import {
  Label,
  PromptIfDirty,
} from '../components'
import Character from '../models'
import CharacterSheet from '../sheets'

const NewCharForm = () => {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024')
  const schema = Yup.object().shape({
    passwordConfirm: Yup.mixed().oneOf([Yup.ref('password')], 'パスワードが一致しません。'),
  })
  const db = firebase.firestore()
  return (
    <Formik
      initialValues={new Character()}
      onSubmit={async (values) => {
        const newDocRef = db.collection('characters').doc()
        const newValues = { ...values }
        newValues.updateTime = new Date()
        newValues.id = newDocRef.id

        // eslint-disable-next-line new-cap
        const shaObj = new jsSHA('SHA-256', 'TEXT')
        shaObj.update(values.password)
        newValues.password = shaObj.getHash('HEX')
        newValues.passwordConfirm = ''

        newDocRef.set(JSON.parse(JSON.stringify(newValues)))
          .then(() => {
            console.log('Document successfully written!')
            document.location.href = '/'
          })
          .catch((error) => {
            console.error('Error writing document: ', error)
          })
      }}
      validationSchema={schema}
    >
      {({ values, errors, ...props }) => (
        <Form>
          <PromptIfDirty />
          <CharacterSheet input values={values} />
          <Label>パスワード</Label>
          <Field name="password" type="password" component={TextField} size="small" margin="none" variant="outlined" />
          <Label>パスワード(確認用)</Label>
          <Field name="passwordConfirm" type="password" component={TextField} size="small" margin="none" variant="outlined" />
          <br />
          <br />
          <Button onClick={props.handleSubmit} variant="contained" color="primary" disabled={props.isSubmitting}>保存</Button>
        </Form>
      )}
    </Formik>
  )
}

export default NewCharForm
