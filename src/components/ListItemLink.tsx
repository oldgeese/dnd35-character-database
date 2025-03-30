"use client"

import { ListItemButton } from "@mui/material"
import withStyles from "@mui/styles/withStyles"
import type { WithStyles } from "@mui/styles"

const styles = {
  secondaryAction: {
    paddingRight: "84px",
  },
}

type ListItemLinkProps = WithStyles<typeof styles> & {
  href: string
  key: string
  alignItems: "center" | "flex-start" | undefined
  children: React.ReactNode
}

const component = (props: ListItemLinkProps) => <ListItemButton component="a" {...props} />

const ListItemLink = withStyles(styles)(component)

export default ListItemLink
