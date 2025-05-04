import type { Character } from "@/src/models"
import Label from "./Label"
import Value from "./Value"

type ImageValueProps = {
  input: boolean
  name: keyof Character
  values: Character
}

const ImageValue = ({ input, ...props }: ImageValueProps) => {
  const value = props.values[props.name] as string
  return input ? (
    <>
      <Label>画像URL</Label>
      <br />
      <Value input {...props} />
    </>
  ) : (
    <div sx={{ width: "100%", maxHeight: "250px", border: "1px solid black" }}>
      <img
        alt=""
        src={value}
        style={{
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "block",
          margin: "auto",
        }}
      />
    </div>
  )
}

export default ImageValue
