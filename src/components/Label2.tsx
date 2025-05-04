import Typography from "@mui/material/Typography"

type Label2Props = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  className?: string
  children: React.ReactNode
}

const Label2 = (props: Label2Props) => {
  return (
    <Typography
      sx={{ width: "100%", padding: "2px", alignContent: "center" }}
      variant="label2"
      component="div"
      align={props.align}
      className={props.className}
    >
      {props.children}
    </Typography>
  )
}

export default Label2
