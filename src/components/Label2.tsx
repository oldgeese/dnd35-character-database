import Typography from "@mui/material/Typography"

type Label2Props = {
  align?: string
  className?: string
  children: React.ReactNode
}

const Label2 = (props: Label2Props) => {
  return (
    <div sx={{ width: "100%", padding: "2px" }} {...props}>
      <Typography variant="label2" component="div">
        {props.children}
      </Typography>
    </div>
  )
}

export default Label2
