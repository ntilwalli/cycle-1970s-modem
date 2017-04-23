import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {or, last, pipe, map, reverse, intersectionWith, eqBy, prop} from 'ramda';
import delay from 'xstream/extra/delay'
import pairwise from 'xstream/extra/pairwise'
import sampleCombine from 'xstream/extra/sampleCombine'

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';

const deepStatements = [
    ' thinks cycle conf has been amazing',
    ' remembers when Cycle was only 200 lines of code',
    ' wishes Cycle and Angular developers could just be friends',
    ' thinks Albert Einstein would have programmed with Cycle',
    ' thinks CycleLang would be bad ass'

]

function getDeepStatement() {

    const rand = Math.random()
        console.log('rand', rand)
    return deepStatements[Math.floor(rand * deepStatements.length)]
}

export function App (sources) {
  const states = {
    idle: 'idle',
    listening: 'listening',
    display: 'display',
  }

  const listening$ = sources
      .speech
      .filter(event => event.type === "start")

  const words$ = sources
      .speech
      .filter(event => event.type === "result")
      .map(event => Array.from(event.results[0]).map(res => res.transcript))
      .debug('word');

  const user$ = words$
      .map(results => results.map(t => t.toLowerCase()))
      .map((results) => users.map(user => Object.assign({}, user, {
                dist: Math.min(...results.map(text => levenstein(user.name.toLowerCase(), text))),
            }))
        )
      .map(userMatches => userMatches.sort((u1, u2) => u1.dist - u2.dist)[0])
      .debug("user");

  function getTop(user) {
    var userDOM = user ? div('.currentuser', [User(user)]) : null;

    return div({attrs: {class: `microphone` }}, [
        img('.micro-img', {attrs: {src: './bw-microphone.png'}}),
        userDOM
    ]);
  }

  const vtree$ = user$
      .startWith(null)
    .map(user => {
        return div([getTop(user)]);
    });

  return {
      DOM: vtree$,
      synthesis: user$
        .map(user => {
            console.log('saying', user)
            return user.name + getDeepStatement()
        }),
      speech: sources.DOM
      .select(".microphone")
      .events("click")
  }
}

function User(user = null) {
    if (!user) { return [] };
  return div('.user', [
    img('.image', {attrs: {src: user.src, width: 100, height: 100}, key: new Date()}),
    div('.name',  `${user.name} ${user.handle}`)
  ]);
}

function levenstein(a, string) {
    var b = string + "", m = [], i, j, min = Math.min;

    if (!(a && b)) return (b || a).length;

    for (i = 0; i <= b.length; m[i] = [i++]);
    for (j = 0; j <= a.length; m[0][j] = j++);

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b.charAt(i - 1) == a.charAt(j - 1)
                ? m[i - 1][j - 1]
                : m[i][j] = min(
                    m[i - 1][j - 1] + 1, 
                    min(m[i][j - 1] + 1, m[i - 1 ][j] + 1))
        }
    }

    return m[b.length][a.length];
}

// export function App (sources) {
//   const user$ = sources
//       .speech
//       .map(event => [].map.call(event.results[0], res => res.transcript))
//       .map(results => results.map(t => t.toLowerCase()))
//       .debug("res")
//       .map(results =>
//             users.map(user => Object.assign({}, user, {
//                 dist: Math.min(...results.map(text => levenstein(user.name.toLowerCase(), text)))
//             }))
//         )
//       .map(userMatches => userMatches.sort((u1, u2) => u1.dist - u2.dist))
//       .debug("matches")

//   const vtree$ = user$
//       .map(([user]) => div("found the user : " + user.name))

//   const sinks = {
//       DOM: vtree$,
//       speech: user$.startWith(1),
//       synthesis: user$.map(([user]) => user.name + getDeepStatement())
//   }
//   return sinks
// }

// function User({first, hideName, user = {}}) {
//     if (first) {
//         console.log(user.name);
//     }
//   return div('.user', user.src ? [
//     ...(hideName ? [] : [div('.name',  `${user.name} ${user.handle}`)]),
//     img(`.image  ${first ? '.in' : ''}`, {attrs: {src: user.src, width: 100, height: 100}, key: new Date()}),
//   ] : []);
// }
// =======
// }
