import {
  Avatar,
  Button,
  List,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core'
import firebase from 'firebase/app'
import 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import ListItemLink from './ListItemLink'

const ListChars = () => {
  const [characters, setCharacters] = useState([])
  const db = firebase.firestore()

  useEffect(() => {
    const unsubscribe = db.collection('characters')
      .orderBy('updateTime', 'desc')
      .onSnapshot((snapshot) => {
        const result = []
        snapshot.forEach((doc) => {
          result.push(doc.data())
        })
        setCharacters(result)
      })
    return unsubscribe
  }, [db])

  return (
    <List>
      {characters.map((character) => (
        <ListItemLink href={`/char/${character.id}`} key={character.id}>
          <ListItemAvatar>
            <Avatar src={character.image} />
          </ListItemAvatar>
          <ListItemText primary={character.pcName} secondary={`PL名:${character.plName}, クラスレベル:${character.classLevel}`} />
          <ListItemSecondaryAction>
            <Button variant="contained" component={Link} to={`/editchar/${character.id}`}>
              編集
            </Button>
          </ListItemSecondaryAction>
        </ListItemLink>
      ))}
    </List>
  )
}

export default ListChars
