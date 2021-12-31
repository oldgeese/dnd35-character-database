import { ListItem } from '@mui/material'
import withStyles from '@mui/styles/withStyles';
import React from 'react'

const ListItemLink = withStyles({
  secondaryAction: {
    paddingRight: '84px',
  },
})((props) => <ListItem button component="a" {...props} />)

export default ListItemLink
