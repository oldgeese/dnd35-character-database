import { Label, LinkToHome } from "@/src/components"
import { NewCharForm } from "@/src/forms"
import { Character } from "@/src/models"
import { getTitle } from "@/src/utils"
import type { Metadata, Viewport } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getTitle(new Character()),
  }
}

export const viewport: Viewport = {
  width: 1024,
}

export default async function Page() {
  return (
    <>
      <Label>
        <LinkToHome />
      </Label>
      <br />
      <NewCharForm />
    </>
  )
}
