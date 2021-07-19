import { ListItem } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import React from 'react'

const ListItemLink = withStyles({
  secondaryAction: {
    paddingRight: '84px',
  },
})((props) => <ListItem button component="a" {...props} />)

export default ListItemLink
