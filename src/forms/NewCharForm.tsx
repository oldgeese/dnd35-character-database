"use client"

import { yupResolver } from "@hookform/resolvers/yup"
import { Button, CircularProgress, TextField } from "@mui/material"
import "firebase/firestore"
import jsSHA from "jssha"
import React from "react"
import { Controller, FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import * as Yup from "yup"
import { Label } from "@/src/components"
import { Character } from "@/src/models"
import CharacterSheet from "@/src/sheets"
import { generateNewId, saveChar } from "@/src/service"
import { useNavigationGuard } from "next-navigation-guard"

const NewCharForm = () => {
  const schema = Yup.object().shape({
    passwordConfirm: Yup.mixed().oneOf([Yup.ref("password")], "パスワードが一致しません。"),
  })

  const methods = useForm({
    defaultValues: new Character(),
    resolver: yupResolver(schema),
  })
  const {
    control,
    formState: { isSubmitting, errors, isDirty },
    handleSubmit,
    getValues,
  } = methods
  const character = getValues()

  const onSubmit: SubmitHandler<Character> = async (values) => {
    const newValues = { ...values }
    newValues.updateTime = new Date()
    newValues.id = await generateNewId()

    // eslint-disable-next-line new-cap
    const shaObj = new jsSHA("SHA-256", "TEXT")
    shaObj.update(values.password)
    newValues.password = shaObj.getHash("HEX")
    newValues.passwordConfirm = ""

    try {
      await saveChar(newValues.id, newValues)
      console.log("Document successfully written!")
      document.location.href = "/"
    } catch (error) {
      console.error("Error writing document: ", error)
    }
  }

  useNavigationGuard({
    enabled: isDirty,
    confirm: () => window.confirm("本当にこのページを離れますか? 未保存の変更があります。"),
  })

  return (
    <FormProvider {...methods}>
      <form>
        <CharacterSheet input={true} values={character} />
        <Label>パスワード</Label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              error={!!errors.password}
              type="password"
              size="small"
              margin="none"
              variant="outlined"
              {...field}
            />
          )}
        />
        <Label>パスワード(確認用)</Label>
        <Controller
          control={control}
          name="passwordConfirm"
          render={({ field }) => (
            <TextField
              error={!!errors.passwordConfirm}
              helperText={errors.passwordConfirm?.message && errors.passwordConfirm?.message}
              type="password"
              size="small"
              margin="none"
              variant="outlined"
              {...field}
            />
          )}
        />
        <br />
        <br />
        {isSubmitting ? (
          <CircularProgress />
        ) : (
          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={isSubmitting}>
            保存
          </Button>
        )}
      </form>
    </FormProvider>
  )
}

export default NewCharForm
