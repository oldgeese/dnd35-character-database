import type { Metadata, Viewport } from "next"
import { Label, LinkToEdit, LinkToHome } from "@/src/components"
import { ViewCharForm } from "@/src/forms"
import { getTitle } from "@/src/utils"
import { getChar } from "@/src/service"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id
  return {
    title: getTitle(await getChar(id)),
  }
}

export const viewport: Viewport = {
  width: 1024,
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  return (
    <>
      <Label component="span">
        <LinkToHome />
      </Label>
      <Label component="span">
        <LinkToEdit id={id} />
      </Label>
      <br />
      <ViewCharForm id={id} />
    </>
  )
}
