require('dotenv').config();
const fs = require('fs');
const path = require('path');
const config = require('./config');
const {download, upload} = require('./services/aws.service');
const {makeThumbnails, joinThumbnails} = require('./services/media.service');

const appPath = path.dirname(require.main.filename);
const inputDir = appPath + '/input';
const outputDir = appPath + '/output';

const runMain = async () => {
  try {
    console.log('Downloading video file...');

    const videoPath = await download(config.videoKey, inputDir);

    console.log('Video file has been downloaded');
    console.log('Making thumbs...');

    const thumbsDir = outputDir + '/thumbs';
    const readStream = fs.createReadStream(videoPath);

    makeThumbnails(readStream, thumbsDir)
      .then(() => {
        console.log('Thumbnails have been prepared');
        return joinThumbnails(thumbsDir, outputDir);
      })
      .then(previewPath => {
        console.log('Preview image has been assembled');
        upload(config.previewKey, previewPath);
      });

  } catch (e) {
    console.error(e);
  }
};

runMain();
