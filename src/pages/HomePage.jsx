import {
  Button,
  Grid,
  Typography,
} from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'

import ListChars from '../components/ListChars'

const HomePage = () => {
  document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1')
  return (
    <>
      <Typography component="h3" variant="h4" align="center" color="textPrimary">
        D&amp;D 3.5版 キャラクターデータベース
      </Typography>
      <Grid container justify="center">
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
