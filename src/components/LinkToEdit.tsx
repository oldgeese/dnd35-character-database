import React from 'react'
import { useParams, Link } from 'react-router-dom'

type LinkToEditParamType = {
  id: string
}
const LinkToEdit = () => {
  const { id } = useParams<LinkToEditParamType>()

  return (
    <>
      <Link to={`/editchar/${id}`}>編集画面へ</Link>
    </>
  )
}

export default LinkToEdit
