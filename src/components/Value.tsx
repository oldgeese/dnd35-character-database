import type { Character } from "@/src/models"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { get } from "es-toolkit/compat"
import { Controller } from "react-hook-form"

type ValueProps = {
  align?: string
  input: boolean
  name: string
  values: Character
}

const Value = ({ input, ...props }: ValueProps) => {
  const value = get(props.values, props.name, "")

  return input ? (
    <Controller
      name={props.name}
      render={({ field }) => <TextField size="small" fullWidth margin="none" variant="outlined" {...field} />}
    />
  ) : (
    <Typography
      sx={{ width: "100%", padding: "2px", minHeight: "20px", border: "1px solid black" }}
      variant="label2"
      component="div"
    >
      {value}
    </Typography>
  )
}

export default Value
