// Firebase web configs per environment. These are public client identifiers,
// not secrets. FIREBASE_ENV is embedded at build time by webpack DefinePlugin.
// Compare process.env.FIREBASE_ENV directly so the unused config is dropped
// from production bundles.

export type FirebaseEnv = 'dev' | 'prod'

export const firebaseEnv = process.env.FIREBASE_ENV as FirebaseEnv

export const firebaseConfig = process.env.FIREBASE_ENV === 'prod'
  ? {
    apiKey: 'AIzaSyA8NGwQmCq5TF16lQy4fSAyti8zpHIwXqI',
    authDomain: 'dnd35-character-database.firebaseapp.com',
    databaseURL: 'https://dnd35-character-database.firebaseio.com',
    projectId: 'dnd35-character-database',
    storageBucket: 'dnd35-character-database.appspot.com',
    messagingSenderId: '551444495572',
    appId: '1:551444495572:web:5ef6070eb157db6da50f41',
    measurementId: 'G-0M7NMCXK1Y',
  }
  : {
    apiKey: 'AIzaSyAaycEAbul74QxO_2YmE38-Usb5ZJoEsTI',
    authDomain: 'dnd35-character-database-dev.firebaseapp.com',
    projectId: 'dnd35-character-database-dev',
    storageBucket: 'dnd35-character-database-dev.firebasestorage.app',
    messagingSenderId: '417630786863',
    appId: '1:417630786863:web:84d14a64bc91bc23af3dda',
  }
