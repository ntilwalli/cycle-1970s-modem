import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {last, pipe, map, reverse} from 'ramda';

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';


export function App (sources) {

  const vtree$ = sources
      .speech
      .map(event => [].map.call(event.results[0], res => res.transcript))
      .debug("ok")
      .filter(results => results.filter(text => text.match(/ok.*cycle/i)).length > 0)
      .map(_ => div("you said: OK Cycle"))

  const sinks = {
      DOM: vtree$,
      speech: xs.empty()
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
