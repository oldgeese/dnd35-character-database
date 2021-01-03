import { useFormikContext } from 'formik'
import React from 'react'
import { Prompt } from 'react-router-dom'

const PromptIfDirty = () => {
  const { dirty } = useFormikContext()
  return (
    <Prompt
      when={dirty}
      message="本当にこのページを離れますか? 未保存の変更があります。"
    />
  )
}

export default PromptIfDirty
