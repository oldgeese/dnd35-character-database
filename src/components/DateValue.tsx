import Typography from "@mui/material/Typography"
import type { Character } from "@/src/models"
import { get } from "es-toolkit/compat"

type DateValueProps = {
  input: boolean
  name: string
  values: Character
}

const DateValue = ({ input, ...props }: DateValueProps) => {
  const value = get(props.values, props.name, "")
  const displayValue = new Date(value).toLocaleString()

  return (
    <Typography
      sx={{ width: "100%", paddingLeft: "2px", minHeight: "20px", border: "1px solid black" }}
      component="div"
      variant="label2"
      {...props}
    >
      {displayValue}
    </Typography>
  )
}

export default DateValue
