import { Button, Grid, Typography } from "@mui/material";
import ListChars from "@/src/components/ListChars";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Typography
        component="h3"
        variant="h4"
        align="center"
        color="textPrimary"
      >
        D&amp;D 3.5版 キャラクターデータベース
      </Typography>
      <Grid container justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/newchar"
        >
          新規作成
        </Button>
      </Grid>
      <br />
      <ListChars />
    </div>
  );
}
