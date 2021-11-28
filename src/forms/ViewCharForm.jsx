import firebase from 'firebase/app'
import 'firebase/firestore'
import {
  Form,
  Formik,
} from 'formik'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Character } from '../models'
import CharacterSheet from '../sheets'

const ViewCharForm = () => {
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
    >
      {({ values }) => {
        if (!values.id) {
          return <div />
        }

        return (
          <Form>
            <CharacterSheet input={false} values={values} />
          </Form>
        )
      }}
    </Formik>
  )
}

export default ViewCharForm
