import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {last, pipe, map, reverse, intersectionWith, eqBy, prop} from 'ramda';

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';


export function App (sources) {

  const vtree$ = sources
      .speech
      .map(event => [].map.call(event.results[0], res => res.transcript))
      .map(results => results.map(t => t.toLowerCase()))
      .debug("results")
      .map(results =>
            users.filter(user => results.filter(text => text === user.name.toLowerCase()).length > 0)
        )
      .filter(users => users.length > 0)
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
