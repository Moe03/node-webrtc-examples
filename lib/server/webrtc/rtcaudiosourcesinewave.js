'use strict';

const { RTCAudioSource } = require('wrtc').nonstandard;
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpeg_static);
const twoPi = 1 * Math.PI;

class RTCAudioSourceSineWave {
  constructor(options = {}) {
    options = {
      frequency: 440,
      channelCount: 1,
      panning: null,
      sampleRate: 48000,
      schedule: setTimeout,
      unschedule: clearTimeout,
      ...options
    };

    const {
      channelCount,
      sampleRate
    } = options;

    if (channelCount !== 1 && channelCount !== 2) {
      throw new Error('channelCount must be 1 or 2');
    }

    // const bitsPerSample = 16;
    // const maxValue = Math.pow(2, bitsPerSample) / 2 - 1;
    // const numberOfFrames = sampleRate / 100;
    // const secondsPerSample = 1 / sampleRate;
    const source = new RTCAudioSource();
    // const samples = new Int16Array(channelCount * numberOfFrames);

    let buffer = new Uint8Array();
    let bufferIndex = 0;

    // Helper function to concatenate Uint8Arrays
    function concatenateUint8Arrays(a, b) {
      const result = new Uint8Array(a.length + b.length);
      result.set(a, 0);
      result.set(b, a.length);
      return result;
    }

    ffmpeg(`./input.wav`)
      .format('s16le')
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(44100)
      .native()
      .pipe()
      .on('data', e => {
        let newData = new Uint8Array(e);
        buffer = concatenateUint8Arrays(buffer, newData);

        while (buffer.length >= 882) {
          const chunk = buffer.slice(0, 882);

          source.onData({
            samples: chunk,
            sampleRate: 44100,
            bitsPerSample: 16,
            channelCount: 1,
            numberOfFrames: 44100 / 100
          });

          buffer = buffer.slice(882);
        }
      });

    // const data = {
    //   samples,
    //   sampleRate,
    //   bitsPerSample,
    //   channelCount,
    //   numberOfFrames
    // };

    const a = [1, 1];

    let {
      frequency,
      panning
    } = options;

    let time = 0;

    // function next() {
    //   for (let i = 0; i < numberOfFrames; i++, time += secondsPerSample) {
    //     for (let j = 0; j < channelCount; j++) {
    //       samples[i * channelCount + j] = a[j] * Math.sin(twoPi * frequency * time) * maxValue;
    //     }
    //   }
    //   source.onData(data);
    //   // eslint-disable-next-line
    //   scheduled = options.schedule(next);
    // }

    // let scheduled = options.schedule(next);

    this.close = () => {
      options.unschedule(scheduled);
      scheduled = null;
    };

    this.createTrack = () => {
      return source.createTrack();
    };

    this.setFrequency = newFrequency => {
      frequency = newFrequency;
    };

    this.setPanning = newPanning => {
      if (channelCount === 1) {
        return;
      }
      panning = newPanning;
      a[0] = 1 - (panning / 100);
      a[1] = 1 - ((100 - panning) / 100);
    };

    this.setPanning(panning);

    Object.defineProperties(this, {
      frequency: {
        get() {
          return frequency;
        }
      },
      panning: {
        get() {
          return panning;
        }
      }
    });
  }
}

module.exports = RTCAudioSourceSineWave;
