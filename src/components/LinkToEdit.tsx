import React from 'react'
import { useParams, Link } from 'react-router-dom'

const LinkToEdit = () => {
  const { id } = useParams()

  return (
    <>
      <Link to={`/editchar/${id}`}>編集画面へ</Link>
    </>
  )
}

export default LinkToEdit
