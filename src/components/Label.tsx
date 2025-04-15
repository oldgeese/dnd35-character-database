import Typography from "@mui/material/Typography"

type LabelProps = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  className?: string
  component?: string
  children: React.ReactNode
}

const Label = (props: LabelProps) => {
  const component = props.component === "span" ? "span" : "div"
  return (
    <div
      sx={[
        { padding: "2px" },
        props.component === "span" ? { display: "inline" } : { display: "inline-block", width: "100%" },
      ]}
      className={props.className}
    >
      <Typography variant="label" component={component} align={props.align}>
        {props.children}
      </Typography>
    </div>
  )
}

export default Label
