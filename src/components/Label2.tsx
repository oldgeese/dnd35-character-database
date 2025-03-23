import Box from "@mui/material/Box"

type Label2Props = {
  align?: string
  className?: string
  children: React.ReactNode
}

const Label2 = (props: Label2Props) => (
  <Box width="100%" padding="2px" fontSize="caption2.fontSize" {...props}>
    {props.children}
  </Box>
)

export default Label2
