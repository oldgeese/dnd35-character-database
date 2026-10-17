import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  listItemButtonClasses,
  ListItemText,
  Stack,
} from '@mui/material'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Character } from '../models'
import DuplicateCharDialog from './DuplicateCharDialog'

const ListChars = () => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [duplicating, setDuplicating] = useState<Character | null>(null)
  const db = firebase.firestore()

  useEffect(() => {
    const unsubscribe = db.collection('characters')
      .orderBy('updateTime', 'desc')
      .onSnapshot((snapshot) => {
        const result: Character[] = []
        snapshot.forEach((doc) => {
          result.push(doc.data() as Character)
        })
        setCharacters(result)
      })
    return unsubscribe
  }, [db])

  return (
    <>
      <List>
        {characters.map((character) => (
          <ListItem
            key={character.id}
            alignItems="flex-start"
            disablePadding
            secondaryAction={(
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setDuplicating(character)}>
                  複製
                </Button>
                <Button variant="contained" component={Link} to={`/editchar/${character.id}`}>
                  編集
                </Button>
              </Stack>
            )}
            // Keep text clear of the buttons (2 x min-width 64px + 8px gap + 16px offset)
            sx={{ [`& > .${listItemButtonClasses.root}`]: { pr: 20 } }}
          >
            <ListItemButton component="a" href={`/char/${character.id}`} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={character.image} />
              </ListItemAvatar>
              <ListItemText primary={character.pcName} secondary={`PL名:${character.plName}, クラスレベル:${character.classLevel}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {duplicating && (
        <DuplicateCharDialog character={duplicating} onClose={() => setDuplicating(null)} />
      )}
    </>
  )
}

export default ListChars
