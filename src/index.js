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

const main = App

const drivers = {
  DOM: makeDOMDriver('#app'),
  speech: makeSpeechRecognitionDriver()
}

run(main, drivers)
