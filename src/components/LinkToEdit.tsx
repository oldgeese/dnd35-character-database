import Link from "next/link"

export default function LinkToEdit({ id }: { id: string }) {
  return (
    <>
      <Link href={`/editchar/${id}`}>編集画面へ</Link>
    </>
  )
}
