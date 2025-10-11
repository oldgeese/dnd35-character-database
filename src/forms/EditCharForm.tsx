"use client"

import { yupResolver } from "@hookform/resolvers/yup"
import { Button, CircularProgress, TextField } from "@mui/material"
import jsSHA from "jssha"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import * as Yup from "yup"
import { Label } from "@/src/components"
import { Character } from "@/src/models"
import CharacterSheet from "@/src/sheets"
import { getChar, saveChar } from "@/src/service"
import { getTitle } from "@/src/utils"
import { useNavigationGuard } from "next-navigation-guard"

const validatePassword = async (id: string, values: Character) => {
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA("SHA-256", "TEXT")
  shaObj.update(values.passwordForUpdate)
  const hashForUpdate = shaObj.getHash("HEX")
  const editDoc = await getChar(id)

  const passwordOnServer = editDoc.password

  if (passwordOnServer !== hashForUpdate) {
    console.log("wrong password.")
    throw new Error("wrong password.")
  }
}

const EditCharForm = ({ id }: { id: string }) => {
  const schema = Yup.object().shape({
    passwordForUpdate: Yup.string().required("パスワードを入力してください。"),
  })

  const methods = useForm({
    defaultValues: new Character(),
    resolver: yupResolver(schema),
  })
  const {
    control,
    formState: { isSubmitting, errors, isDirty },
    handleSubmit,
    reset,
    getValues,
    setError,
  } = methods

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const retrievedChar = await getChar(id)
        const character = Object.assign(new Character(), retrievedChar)
        reset(character)
        document.title = getTitle(character)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading character:", error)
        setIsLoading(false)
      }
    }

    loadCharacter()
  }, [id, reset])

  const character = getValues()

  const onSubmit: SubmitHandler<Character> = async (values) => {
    try {
      await validatePassword(id, values)
    } catch (err) {
      setError("passwordForUpdate", { type: "manual", message: "パスワードが誤っています。" })
      return
    }

    const newValues = {
      ...values,
      updateTime: new Date(),
      id: id,
      passwordForUpdate: "",
    }

    try {
      await saveChar(id, newValues)
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

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <FormProvider {...methods}>
      <form>
        <CharacterSheet input={true} values={character} />
        <Label>パスワード</Label>
        <Controller
          control={control}
          name="passwordForUpdate"
          render={({ field }) => (
            <TextField
              error={!!errors.passwordForUpdate}
              helperText={errors.passwordForUpdate?.message && errors.passwordForUpdate?.message}
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

export default EditCharForm
