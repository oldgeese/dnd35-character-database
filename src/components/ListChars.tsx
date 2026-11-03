import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  listItemButtonClasses,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Character } from '../models'
import { matchesCharacterSearch } from '../utils'
import DuplicateCharDialog from './DuplicateCharDialog'

const ListChars = () => {
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [duplicating, setDuplicating] = useState<Character | null>(null)
  const [query, setQuery] = useState('')
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

  const filtered = useMemo(
    () => (characters ?? []).filter((character) => matchesCharacterSearch(character, query)),
    [characters, query],
  )

  if (characters === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography color="text.secondary">読み込み中...</Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ px: 2 }}>
        <TextField
          type="search"
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キャラクター名・PL名・クラスレベルで検索"
          inputProps={{ 'aria-label': 'キャラクター検索' }}
          // The theme shrinks input padding for the dense character sheet; restore it here
          sx={{ '& .MuiOutlinedInput-input': { py: 1, px: 1.5 } }}
        />
      </Box>
      {filtered.length === 0 && characters.length > 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          該当するキャラクターがいません
        </Typography>
      )}
      <List>
        {filtered.map((character) => (
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
