import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Prompt } from 'react-router-dom'

const PromptIfDirty = () => {
  const { formState } = useFormContext()
  return (
    <Prompt
      when={formState.isDirty}
      message="本当にこのページを離れますか? 未保存の変更があります。"
    />
  )
}

export default PromptIfDirty
