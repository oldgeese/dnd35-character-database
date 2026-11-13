import {
  Alert,
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
  const [loadFailed, setLoadFailed] = useState(false)
  const [duplicating, setDuplicating] = useState<Character | null>(null)
  // inputValue is what the box shows; query is what filters, and skips unfinished IME text like 「あｒ」
  const [inputValue, setInputValue] = useState('')
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
      }, (error) => {
        // Firestore stops the listener after an error, so the list no longer updates
        console.error('Error listening to characters:', error)
        setLoadFailed(true)
      })
    return unsubscribe
  }, [db])

  const filtered = useMemo(
    () => (characters ?? []).filter((character) => matchesCharacterSearch(character, query)),
    [characters, query],
  )

  const loadFailedAlert = (
    <Alert
      severity="error"
      sx={{ mx: 2, mb: 2 }}
      action={(
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          再読み込み
        </Button>
      )}
    >
      キャラクター一覧の読み込みに失敗しました。時間をおいてページを再読み込みしてください。
    </Alert>
  )

  if (characters === null) {
    if (loadFailed) return loadFailedAlert
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography color="text.secondary">読み込み中...</Typography>
      </Box>
    )
  }

  const noMatch = characters.length > 0 && filtered.length === 0

  return (
    <>
      {loadFailed && loadFailedAlert}
      <Box sx={{ px: 2 }}>
        <TextField
          type="search"
          fullWidth
          size="small"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (!(e.nativeEvent as InputEvent).isComposing) setQuery(e.target.value)
          }}
          placeholder="キャラクター名・PL名・クラスレベルで検索"
          inputProps={{
            'aria-label': 'キャラクター検索',
            onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => setQuery(e.currentTarget.value),
          }}
          // The theme shrinks input padding for the dense character sheet; restore it here
          sx={{ '& .MuiOutlinedInput-input': { py: 1, px: 1.5 } }}
        />
      </Box>
      {/* Keep the live region mounted and change only its text, so screen readers announce it */}
      <Typography role="status" color="text.secondary" align="center" sx={noMatch ? { py: 4 } : undefined}>
        {noMatch ? '該当するキャラクターがいません' : ''}
      </Typography>
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
