const fs = require('fs');
const child_process = require('child_process');
const config = require('../config');

module.exports = {

  makeThumbnails: (inputStream, outputPath) => {
    const targetPath = outputPath + '/thumb-%d.jpg';
    const rate = 1 / (config.previewIntervalMs / 1000);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    const proc = child_process.spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-vf', 'scale=300:-1,fps=' + rate,
      targetPath
    ]);

    proc.on('error', function (err) {
      console.log(err);
    });

    proc.stderr.on('data', function (data) {
      console.log('' + data);
    });

    inputStream.pipe(proc.stdin)
      .on('error', function (err) {
        console.log('error pipe: ', err);
      });

    return new Promise((resolve, reject) => {
      proc.on('close', function (code) {
        if (code === 1) {
          reject("ffmpeg failed");
        } else {
          resolve();
        }
      });
    });
  },

  joinThumbnails: (sourceDir, targetDir) => {
    const sourcePath = sourceDir + '/*.jpg';
    const targetPath = targetDir + '/' + config.previewKey;

    const proc = child_process.spawn('magick', [
      'montage', sourcePath,
      '-geometry', '+0+0',
      '-tile', '1x',
      targetPath
    ]);

    proc.on('error', function (err) {
      console.log(err);
    });

    proc.stderr.on('data', function (data) {
      console.log('' + data);
    });

    return new Promise((resolve, reject) => {
      proc.on('close', function (code) {
        if (code === 1) {
          reject("magick failed");
        } else {
          resolve(targetPath);
        }
      });
    });
  }

}
