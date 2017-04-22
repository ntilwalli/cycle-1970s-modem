import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {last, pipe, map, reverse} from 'ramda';

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

import {users} from './data';

function startMicrophone(stream){
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);


    var timerId;
    const fft$ = xs.create({
        start: (listener) => {
            function draw() {
                analyser.getByteFrequencyData(dataArray)

                listener.next(dataArray)
            }
            timerId = setInterval(draw, 1000)
        },

        stop: () => {
            clearInterval(timerId)
        }
    })

    return fft$
}

const userAudioMedia$ = xs.create({
    start: listener => {
        navigator.getUserMedia({audio: true},
            stream => { listener.next(startMicrophone(stream)) } ,
            console.error.bind(console)
        )
    },
    stop: _ => {}
})

export function App (sources) {

  const fft$ = userAudioMedia$
      .flatten()
      .map(fft => fft.reduce((acc, value) => acc + value))
      .debug("volume")
      .filter(volume => volume > 5000)
      .map(sum => sum % users.length)
      .fold((acc, next) => acc.concat([next]), []);

  const vtree$ = fft$
    .map(userIds => {
        const user = users[last(userIds)] || {};

        return div([
            div('.currentuser', [User({user})]),
            div('.oldusers', reverse(userIds).map((id, idx) => User({first: idx === 0, hideName: true, user: users[id]}))),
        ]);
    });

  const sinks = {
      DOM: vtree$
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
