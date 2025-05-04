import Typography from "@mui/material/Typography"

type LabelProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  className?: string
  component?: "span" | "div"
  children: React.ReactNode
}

const Label = (props: LabelProps) => {
  const component = props.component === "span" ? "span" : "div"
  return (
    <Typography
      sx={[
        { padding: "2px", alignContent: "center" },
        props.component === "span" ? { display: "inline" } : { display: "inline-block", width: "100%" },
      ]}
      variant="label"
      component={component}
      align={props.align}
      className={props.className}
    >
      {props.children}
    </Typography>
  )
}

export default Label
