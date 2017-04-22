import {div} from '@cycle/dom'
import xs from 'xstream'

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

const BUFF_SIZE = 16384;

function startMicrophone(stream){
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    function draw() {
        analyser.getByteTimeDomainData(dataArray);

        console.log(dataArray);
        requestAnimationFrame(draw);
    }
    draw()

}

function onSuccess(stream) {
    startMicrophone(stream);
}

navigator.getUserMedia({audio: true}, onSuccess, console.error.bind(console));

export function App (sources) {
  const vtree$ = xs.of(
    div('My Awesome Cycle.js app')
  )
  const sinks = {
    DOM: vtree$
  }
  return sinks
}
