"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    caption2: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}

export const theme = createTheme({
  typography: {
    caption: {
      fontSize: "0.5rem",
    },
    caption2: {
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
});
