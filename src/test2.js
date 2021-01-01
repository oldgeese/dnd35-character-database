const { BehaviorSubject, combineLatest } = require('rxjs')
const { map, tap } = require('rxjs/operators')

var a$ = new BehaviorSubject(1).pipe(tap(x => console.log("Emitting $a=" + x)))
var b$ = new BehaviorSubject(2).pipe(tap(x => console.log("Emitting $b=" + x)))
var c$ = new BehaviorSubject(3).pipe(tap(x => console.log("Emitting $c=" + x)))

var ab$ = combineLatest([a$, b$]).pipe(
  map(([a, b]) => a + b),
  // tap(x => console.log('$a + $b = ' + x))
)

var bc$ = combineLatest([b$, c$]).pipe(
  map(([b, c]) => b + c),
  // tap(x => console.log('$b + $c = ' + x))
)

var abbc$ = combineLatest([ab$, bc$]).pipe(
  map(([ab, bc]) => ab + bc),
  tap(x => console.log('$ab + $bc = ' + x))
)

console.log("Initial subscription:")
abbc$.subscribe();

b$.next(4);
