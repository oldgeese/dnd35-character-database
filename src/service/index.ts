"use server"

import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore"
import type { Character } from "../models"
import { db } from "../persistent"

export const listChars = async (): Promise<Character[]> => {
  const collectionRef = collection(db, "characters")
  const orderByQuery = query(collectionRef, orderBy("updateTime", "desc"))

  const querySnapshot = await getDocs(orderByQuery)
  return querySnapshot.docs.map((doc) => doc.data() as Character)
}

export const getChar = async (id: string): Promise<Character> => {
  const docRef = doc(db, "characters", id)
  const querySnapshot = await getDoc(docRef)
  return querySnapshot.data() as Character
}

export const saveChar = async (id: string, char: Character): Promise<void> => {
  const docRef = doc(db, "characters", id)
  await setDoc(docRef, char)
}

export const generateNewId = async (): Promise<string> => {
  return doc(collection(db, "characters")).id
}
