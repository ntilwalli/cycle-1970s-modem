import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
import xs from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'

function makeSpeechRecognitionDriver() {
    function createSpeach() {
        return xs.create({
          start: listener => {
            const recognition = new (
                window.SpeechRecognition ||
                window.webkitSpeechRecognition ||
                window.mozSpeechRecognition ||
                window.msSpeechRecognition
            )();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 5;

            function handle(event) {
                console.log(event);
                listener.next(event)
            }
            recognition.onnomatch = handle
            recognition.onstart = handle
            recognition.onerror = handle
            recognition.onspeechend = handle
            recognition.onsoundend = handle
            // recognition.onaudioend = handleError;
            recognition.onresult = handle

            recognition.start();
          }, stop: () => {}
        })
    }
    return function (command$) {
        return command$
            .map(command => createSpeach())
            .flatten()
    }
}

function makeSpeechSynthesisDriver() {
    return function (command$) {
        const synth = window.speechSynthesis
        
        return command$
            .subscribe({
                next: utterance => {
                    console.log('utterance', utterance)
                    synth.speak(new SpeechSynthesisUtterance(utterance))
                }
            })
    }
}


const main = App

const drivers = {
  DOM: makeDOMDriver('#app'),
  speech: makeSpeechRecognitionDriver(),
  synthesis: makeSpeechSynthesisDriver()
}

run(main, drivers)
