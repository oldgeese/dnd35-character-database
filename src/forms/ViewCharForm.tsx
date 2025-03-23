import "firebase/firestore"
import CharacterSheet from "../sheets"

import { getChar } from "../service"

const ViewCharForm = async ({ id }: { id: string }) => {
  const character = await getChar(id)
  return <>{character.id ? <CharacterSheet input={false} values={character} /> : <div />}</>
}

export default ViewCharForm
