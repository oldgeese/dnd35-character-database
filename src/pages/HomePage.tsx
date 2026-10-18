import { GitHub, X } from '@mui/icons-material'
import {
  Button,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

import ListChars from '../components/ListChars'

import { getHomeTitle } from '../utils'

const HomePage = () => {
  document.querySelector('meta[name="viewport"]')!.setAttribute('content', 'width=device-width, initial-scale=1')
  document.title = getHomeTitle()
  return (
    <>
      <Typography component="h3" variant="h4" align="center" color="textPrimary">
        {getHomeTitle()}
      </Typography>
      <Typography variant="caption2" component="p" align="center" color="textSecondary">
        {process.env.APP_VERSION}
      </Typography>
      <Grid container justifyContent="center">
        <IconButton href="https://github.com/oldgeese/dnd35-character-database" target="_blank" rel="noopener noreferrer" aria-label="GitHub" size="small">
          <GitHub fontSize="small" />
        </IconButton>
        <IconButton href="https://x.com/oldgeese" target="_blank" rel="noopener noreferrer" aria-label="X (@oldgeese)" size="small">
          <X fontSize="small" />
        </IconButton>
      </Grid>
      <Grid container justifyContent="center">
        <Button variant="contained" color="primary" component={Link} to="/newchar">
          新規作成
        </Button>
      </Grid>
      <br />
      <ListChars />
    </>
  )
}

export default HomePage
