import type { NextConfig } from "next"
// Temporarily disabled Pigment CSS due to compilation issues in CI environment
// import { type PigmentOptions, withPigment } from "@pigment-css/nextjs-plugin"
// import { theme } from "@/app/theme"

const nextConfig: NextConfig = {
  /* config options here */
}

// const pigmentConfig: PigmentOptions = {
//   transformLibraries: ["@mui/material"],
//   theme,
// }

// export default withPigment(nextConfig, pigmentConfig)
export default nextConfig
