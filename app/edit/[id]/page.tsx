import React from "react"

import { Label, LinkToHome } from "@/src/components"
import { EditCharForm } from "@/src/forms"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  return (
    <>
      <Label>
        <LinkToHome />
      </Label>
      <br />
      <EditCharForm id={id} />
    </>
  )
}
