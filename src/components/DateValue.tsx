import { Box } from "@mui/material"
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
    <Box width="100%" minHeight="20px" fontSize="caption2.fontSize" border={1} {...props}>
      {displayValue}
    </Box>
  )
}

export default DateValue
