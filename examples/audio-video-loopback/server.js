'use strict';
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
console.log(ffmpegStatic);
function beforeOffer(peerConnection) {
  // const audioTransceiver = peerConnection.addTransceiver('audio');

  const ffmpegCommand = ffmpeg('https://stream.live.vc.bbcmedia.co.uk/bbc_world_service')
    .audioCodec('pcm_s16le') // Example codec, adjust as needed
    .format('s16le') 
    .on(`data`, (data) => {
      console.log('data');
      console.log(data)
    })       // Output raw PCM data
    .on('start', () => console.log('Streaming BBC audio...'))
    .on('error', (err) => console.error('Error streaming audio:', err));

  // Pipe the FFmpeg output to the WebRTC peer connection's audio track
  console.log(peerConnection);
  ffmpegCommand.pipe(peerConnection.getSenders()[0].track); // Assuming audio is 

  // return Promise.all([
  //   audioTransceiver.sender.replaceTrack(audioTransceiver.receiver.track),
  // ]);
}

module.exports = { beforeOffer };
