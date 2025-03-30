import Typography from "@mui/material/Typography"

type LabelProps = {
  align?: string
  className?: string
  component?: string
  children: React.ReactNode
}

const Label = (props: LabelProps) => {
  const component = props.component === "span" ? "span" : "div"
  return (
    <Typography sx={{ width: "100%", padding: "2px" }} variant="label" component={component}>
      {props.children}
    </Typography>
  )
}

export default Label
