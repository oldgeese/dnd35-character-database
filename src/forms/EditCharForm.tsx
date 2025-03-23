"use client"

import { getChar, saveChar } from "@/src/service"
import { Button, CircularProgress, TextField } from "@mui/material"
import jsSHA from "jssha"
import { Controller, FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { Label } from "../components"
import { Character } from "../models"
import CharacterSheet from "../sheets"
import { getTitle } from "../utils"
import { useState } from "react"

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

export default async function Page({ id }: { id: string }) {
  document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=1024")
  const [_, setCharacter] = useState(new Character())
  setCharacter(await getChar(id))

  const methods = useForm({
    defaultValues: new Character(),
  })
  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    reset,
    getValues,
    setError,
  } = methods

  const character = getValues()
  reset(character)
  document.title = getTitle(character)

  const onSubmit: SubmitHandler<Character> = async (values) => {
    try {
      await validatePassword(id, values)
    } catch (err) {
      setError("passwordForUpdate", { type: "manual", message: "パスワードが誤っています。" })
      return
    }
    const editDocRef = await getChar(id)
    const newValues = { ...values }
    newValues.updateTime = new Date()
    newValues.id = editDocRef.id
    newValues.passwordForUpdate = ""
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

  return (
    <>
      {character.id ? (
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
      ) : (
        <div />
      )}
    </>
  )
}
