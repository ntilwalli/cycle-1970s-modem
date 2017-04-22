import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
import xs from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'

function makeSpeechRecognitionDriver() {
    return function (command$) {
        return command$
            .map(command => {
                const recognition = new (
                    window.SpeechRecognition ||
                    window.webkitSpeechRecognition ||
                    window.mozSpeechRecognition ||
                    window.msSpeechRecognition
                )();
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 5;
                recognition.start();

                return fromEvent(recognition, "result");
            })
            .flatten()
    }
}

function makeSpeechSynthesisDriver() {
    return function (command$) {
        const synth = window.speechSynthesis
        
        return command$
            .subscribe({
                next: utterance => {
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
