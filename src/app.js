import {div} from '@cycle/dom'
import xs from 'xstream'

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

const usersImages = [
    "felix",
    "salut",
    "bonjour"
]

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
      .debug("fft")
      .map(fft => fft.reduce((acc, value) => acc + value))
      .map(sum => sum % usersImages.length)

  const vtree$ = fft$
  .map(index => div(usersImages[index]))
  const sinks = {
      DOM: vtree$
  }
  return sinks
}
