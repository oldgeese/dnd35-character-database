import Typography from "@mui/material/Typography"

type Label2Props = {
  align?: "center" | "inherit" | "justify" | "left" | "right"
  className?: string
  children: React.ReactNode
}

const Label2 = (props: Label2Props) => {
  return (
    <div sx={{ width: "100%", padding: "2px" }} className={props.className}>
      <Typography variant="label2" component="div" align={props.align}>
        {props.children}
      </Typography>
    </div>
  )
}

export default Label2
