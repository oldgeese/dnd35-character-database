import type { NextConfig } from "next"
import { type PigmentOptions, withPigment } from "@pigment-css/nextjs-plugin"
import { theme } from "@/app/theme"

const nextConfig: NextConfig = {
  /* config options here */
}

const pigmentConfig: PigmentOptions = {
  transformLibraries: ["@mui/material"],
  theme,
}

export default withPigment(nextConfig, pigmentConfig)
