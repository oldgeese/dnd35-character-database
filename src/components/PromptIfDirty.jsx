import { useFormikContext } from 'formik'
import React from 'react'
import { Prompt } from 'react-router-dom'

const PromptIfDirty = () => {
  const formik = useFormikContext()
  return (
    <Prompt
      when={formik.dirty && formik.submitCount === 0}
      message="本当にこのページを離れますか? 未保存の変更があります。"
    />
  )
}

export default PromptIfDirty
