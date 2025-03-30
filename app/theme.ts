import { type Theme, createTheme } from "@mui/material/styles"

declare module "@mui/material/styles" {
  interface TypographyVariants {
    label: React.CSSProperties
    label2: React.CSSProperties
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    label?: React.CSSProperties
    label2?: React.CSSProperties
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    label: true
    label2: true
  }
}

declare global {
  namespace React {
    interface HTMLAttributes<T> {
      sx?:
        | React.CSSProperties
        | ((theme: Theme) => React.CSSProperties)
        | ReadonlyArray<React.CSSProperties | ((theme: Theme) => React.CSSProperties)>
    }
  }
}

// declare module "@mui/material-pigment-css" {
//   interface ThemeArgs {
//     theme: Theme
//   }
// }

export const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "Noto Sans JP",
    label: {
      fontSize: "0.5rem",
    },
    label2: {
      fontSize: "0.75rem",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "1px",
        },
        inputSizeSmall: {
          padding: "1px",
          paddingTop: "1px",
          paddingBottom: "1px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
        },
      },
    },
  },
})
