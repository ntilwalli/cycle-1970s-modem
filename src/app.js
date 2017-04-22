import {div, img} from '@cycle/dom'
import xs from 'xstream'
import {last, pipe, map, reverse} from 'ramda';

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

// const usersImages = [
//     "felix",
//     "salut",
//     "bonjour"
// ]

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
                analyser.getByteTimeDomainData(dataArray)

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
      .map(sum => sum % users.length)
      .fold((acc, next) => acc.concat([next]), []);

  const vtree$ = fft$
    .map(userIds => {
        const user = users[last(userIds)] || {};
        console.log(userIds.map(id => users[id].name))

        return div([
            div('.currentuser', [
                div('.name', user.name),
                div('.name', user.handle),
                img('.image', {attrs: {src: user.src}}),
            ]),
            div(pipe(reverse, map(id => User(users[id])))(userIds)),
        ]);
    });

  const sinks = {
      DOM: vtree$
  }
  return sinks
}

function User(user = {}) {
  return div('.olduser', img('.image', {attrs: {src: user.src, width: 100, height: 100}}));
}
