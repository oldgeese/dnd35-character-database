import CharacterSheet from "@/src/sheets"

import { getChar } from "@/src/service"

const ViewCharForm = async ({ id }: { id: string }) => {
  const character = await getChar(id)
  return <>{character.id ? <CharacterSheet input={false} values={character} /> : <div />}</>
}

export default ViewCharForm
