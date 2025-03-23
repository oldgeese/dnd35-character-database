import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import type { Metadata, Viewport } from "next"
import { NavigationGuardProvider } from "next-navigation-guard"

import "@mui/material-pigment-css/styles.css"

export const metadata: Metadata = {
  title: "D&D 3.5版 キャラクターデータベース",
  description: "Dungeons and Dragons 3.5e キャラクターデータベース",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>
        <NavigationGuardProvider>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        </NavigationGuardProvider>
      </body>
    </html>
  )
}
