import Typography from "@mui/material/Typography"
import Box from "@mui/material-pigment-css/Box"

type LabelProps = {
  align?: string
  className?: string
  component?: React.ElementType<any>
  children: React.ReactNode
}

const Label = (props: LabelProps) => (
  <Box width="100%" padding="2px" {...props}>
    <Typography variant="caption">{props.children}</Typography>
  </Box>
)

export default Label
