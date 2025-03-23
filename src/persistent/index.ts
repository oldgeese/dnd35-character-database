import { app } from "@/src/firebase"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"

export const db = getFirestore(app)
if ("local" === process.env.ENV) {
  connectFirestoreEmulator(db, "127.0.0.1", 8081)
}
