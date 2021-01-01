const { of,Observable } = require('rxjs')
const { map, filter} = require('rxjs/operators')

const dataSource = of (1,2,3,4,5)
const observable = new Observable((subscriber) => {
  const intervalId = setInterval(() => {subscriber.next('hi')},1000)

  return () => {
    clearInterval(intervalId)
  }
})

dataSource.pipe(map(x=>x+1), filter(x=>x%2===0)).subscribe(value=>console.log(value))
const subscription = observable.subscribe(value=>console.log(value))

setTimeout(() => {subscription.unsubscribe()},3000)
