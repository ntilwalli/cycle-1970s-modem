import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {or, last, pipe, map, reverse, intersectionWith, eqBy, prop} from 'ramda';
import delay from 'xstream/extra/delay'
import pairwise from 'xstream/extra/pairwise'
import sampleCombine from 'xstream/extra/sampleCombine'

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';

export function App (sources) {
  const states = {
    idle: 'idle',
    listening: 'listening',
    display: 'display',
  }

  const words$ = sources
      .speech
      .map(event => Array.from(event.results[0]).map(res => res.transcript))
      .debug('word');

  const listen$ = words$
      .map(results => results.filter(text => text.match(/blue/i)).length > 0)
      .debug('listening')
      .startWith(false);

  const user$ = words$.compose(sampleCombine(listen$.compose(delay(100))))
      .filter(([words, listen]) => listen)
      .map(([results]) => results.map(t => t.toLowerCase()))
      .map((results) => users.map(user => Object.assign({}, user, {
                dist: Math.min(...results.map(text => levenstein(user.name.toLowerCase(), text))),
            }))
        )
      .map(userMatches => userMatches.sort((u1, u2) => u1.dist - u2.dist)[0])
      .debug("user");

  const users$ = user$.fold((acc, user) => acc.concat([user]), []);
  // listen ----x--------
  // user   ---------x----
  // state  iiiillllldddddiiiii
  const waiting$ = xs.merge(listen$, user$.map(() => false)).startWith(false);
  const state$ = xs.combine(xs.merge(listen$, user$.compose(delay(3000)).map(() => false)).compose(pairwise), waiting$.compose(pairwise))
    .map(([activated, waiting]) => {
        console.log(activated, waiting);
      if (!activated[0] && !activated[1] && !waiting[0] && !waiting[1]) {
        return states.idle;
      }

      return waiting[1] ? states.listening : states.display;
    })
    .debug('state');

  function getTop(state, user) {
    if (states.display === state && user) {
      return div('.currentuser', [User({user})]);
    }

    return div({attrs: {class: `microphone ${state === states.listening ? 'listening' : ''}`}}, img('.micro-img', {attrs: {src: './bw-microphone.png'}}));
  }

  const vtree$ = xs
    .combine(state$, users$)
    .map(([state, users = []]) => {
        const user = last(users) || {};
        console.log('displaying user');

        return div([
            getTop(state, user),
            div('.oldusers', reverse(users).map((id, idx) => User({first: idx === 0, hideName: true, user: users[idx]}))),
        ]);
    });

  return {
      DOM: vtree$,
      speech: words$.startWith(),
  }
}

function User({first, hideName, user = {}}) {
  return div('.user', user.src ? [
    // ...(hideName ? [] : [div('.name',  `${user.name} ${user.handle}`)]),
    img(`.image  ${first ? '.in' : ''}`, {attrs: {src: user.src, width: 100, height: 100}, key: new Date()}),
  ] : []);
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

const deepStatements = [
    ' is motherfucking deep as shit',
    ' is hot as a motherfuck',
    ' is motherfucking smart as hell',
    ' motherfucking loves programming in cycle',
    ' doesn\'t like motherfucking vegetables',
    ' is a deep motherfucker',
    ' is scared of motherfucking robots'
]

function getDeepStatement() {
    return deepStatements[Math.floor(Math.random() * deepStatements.length)]
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