import firebase from 'firebase/app'
import 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Character } from '../models'
import CharacterSheet from '../sheets'

import { getTitle } from '../utils'

const ViewCharForm = () => {
  document.querySelector('meta[name="viewport"]')?.setAttribute('content', 'width=1024')
  const { id } = useParams<{id: string}>()
  const [_, setCharacter] = useState(new Character())
  const db = firebase.firestore()

  const methods = useForm({
    defaultValues: new Character(),
  })
  const { handleSubmit, reset, getValues } = methods

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

  const onSubmit = async () => { return }
  const character = getValues()

  return (
    <FormProvider {...methods} >
      <form onSubmit={handleSubmit(onSubmit)}>
        {character.id ? <CharacterSheet input={false} values={character} /> : <div></div> }
      </form>
    </FormProvider>
  )
}

export default ViewCharForm
