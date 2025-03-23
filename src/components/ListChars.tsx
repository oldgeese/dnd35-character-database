import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material"
import Link from "next/link"

import { listChars } from "../service"

const ListChars = async () => {
  const characters = await listChars()

  return (
    <List>
      {characters.map((character) => (
        <ListItem
          key={character.id}
          alignItems="flex-start"
          secondaryAction={
            <Button variant="contained" component={Link} href={`/edit/${character.id}`}>
              編集
            </Button>
          }
        >
          <ListItemButton component={Link} href={`/char/${character.id}`}>
            <ListItemAvatar>
              <Avatar src={character.image} />
            </ListItemAvatar>
            <ListItemText
              primary={character.pcName}
              secondary={`PL名:${character.plName}, クラスレベル:${character.classLevel}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export default ListChars
