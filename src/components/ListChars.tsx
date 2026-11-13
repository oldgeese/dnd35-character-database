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

type LoadFailedAlertProps = {
  // true when a list is already shown and only its updates stopped
  stale: boolean
  onRetry: () => void
}

const LoadFailedAlert = ({ stale, onRetry }: LoadFailedAlertProps) => (
  <Alert
    severity="error"
    sx={{ mx: 2, mb: 2 }}
    action={(
      <Button color="inherit" size="small" onClick={onRetry}>
        再読み込み
      </Button>
    )}
  >
    {stale
      ? 'キャラクター一覧の更新が止まりました。表示中の一覧は最新でない可能性があります。'
      : 'キャラクター一覧の読み込みに失敗しました。'}
  </Alert>
)

const ListChars = () => {
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  // Bumped by the retry button to subscribe again without reloading the page
  const [attempt, setAttempt] = useState(0)
  const [duplicating, setDuplicating] = useState<Character | null>(null)
  // inputValue is what the box shows; query is what filters, and skips unfinished IME text like 「あｒ」
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const db = firebase.firestore()

  useEffect(() => {
    const unsubscribe = db.collection('characters')
      .orderBy('updateTime', 'desc')
      // Also fire when only fromCache changes, so a retry that gets the same data still clears the error
      .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
        const result: Character[] = []
        snapshot.forEach((doc) => {
          result.push(doc.data() as Character)
        })
        setCharacters(result)
        // Clear the error only once the server answers; a snapshot from the cache can be stale too
        if (!snapshot.metadata.fromCache) setLoadFailed(false)
      }, (error) => {
        // Firestore stops the listener after an error, so the list no longer updates
        console.error('Error listening to characters:', error)
        setLoadFailed(true)
      })
    return unsubscribe
  }, [db, attempt])

  // Keep the error shown until the new subscription gets data from the server
  const retry = () => setAttempt((n) => n + 1)

  const filtered = useMemo(
    () => (characters ?? []).filter((character) => matchesCharacterSearch(character, query)),
    [characters, query],
  )

  const loadFailedAlert = loadFailed && <LoadFailedAlert stale={characters !== null} onRetry={retry} />

  if (characters === null) {
    if (loadFailedAlert) return loadFailedAlert
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
      {loadFailedAlert}
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
