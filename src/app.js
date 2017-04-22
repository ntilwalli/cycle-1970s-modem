import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {last, pipe, map, reverse, intersectionWith, eqBy, prop} from 'ramda';

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';

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

export function App (sources) {

  const vtree$ = sources
      .speech
      .map(event => [].map.call(event.results[0], res => res.transcript))
      .map(results => results.map(t => t.toLowerCase()))
      .debug("res")
      .map(results =>
            users.map(user => Object.assign({}, user, {
                dist: Math.min(...results.map(text => levenstein(user.name.toLowerCase(), text)))
            }))
        )
      .map(userMatches => userMatches.sort((u1, u2) => u1.dist - u2.dist))
      .debug("matches")
      .map(([user]) => div("found the user : " + user.name))

  const sinks = {
      DOM: vtree$,
      speech: xs.of(1)
  }
  return sinks
}

function User({first, hideName, user = {}}) {
    if (first) {
        console.log(user.name);
    }
  return div('.user', user.src ? [
    ...(hideName ? [] : [div('.name',  `${user.name} ${user.handle}`)]),
    img(`.image  ${first ? '.in' : ''}`, {attrs: {src: user.src, width: 100, height: 100}, key: new Date()}),
  ] : []);
}
