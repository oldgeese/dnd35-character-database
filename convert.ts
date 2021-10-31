import firebase from 'firebase/app'
import 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

const firebaseConfig = {
  apiKey: 'AIzaSyA8NGwQmCq5TF16lQy4fSAyti8zpHIwXqI',
  authDomain: 'dnd35-character-database.firebaseapp.com',
  databaseURL: 'https://dnd35-character-database.firebaseio.com',
  projectId: 'dnd35-character-database',
  storageBucket: 'dnd35-character-database.appspot.com',
  messagingSenderId: '551444495572',
  appId: '1:551444495572:web:5ef6070eb157db6da50f41',
  measurementId: 'G-0M7NMCXK1Y',
}

firebase.initializeApp(firebaseConfig)
firebase.firestore().useEmulator('localhost', 8081)
const db = firebase.firestore()
let batch = db.batch()
let operationCount = 0

const main = async () => {
  const snapshots = await db.collection('characters').get()
  snapshots.docs.map((doc) => {
    Object.entries(doc.data()).map(([key, value]) => {
      if ((operationCount + 1) % 500 === 0) {
        batch.commit()
        console.log('commited')
        batch = db.batch()
      }
      if (Array.isArray(value)) {
        value.map((item)=> {
          item['id'] = uuidv4()
        })
        const updateData = {}
        updateData[key] = value
        console.log(updateData)
        batch.update(doc.ref, updateData)
        operationCount++
      } else if (value !== null && typeof value === 'object') {
        value['id'] = uuidv4()
        const updateData = {}
        updateData[key] = value
        console.log(updateData)
        batch.update(doc.ref, updateData)
        operationCount++
      }
    })
  })
  console.log('updated')
  batch.commit()
  console.log('commited')
}

main()
