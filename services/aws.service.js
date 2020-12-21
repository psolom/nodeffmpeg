const AWS = require("aws-sdk");
const config = require('../config');
const fs = require('fs');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: config.region
});

const S3 = new AWS.S3();

module.exports = {

  download: (key, targetDir) => {
    const targetPath = targetDir + '/' + key;

    const s3Stream = S3.getObject({
      Bucket: config.bucket,
      Key: key,
    }).createReadStream();

    const fsStream = fs.createWriteStream(targetPath);

    return new Promise((resolve, reject) => {
      s3Stream.on('error', function (err) {
        reject('S3 Stream error: ' + err);
      });

      s3Stream.pipe(fsStream)
        .on('error', function (err) {
          reject('File Stream error: ' + err);
        })
        .on('close', function () {
          return resolve(targetPath);
        });
    });
  },

  upload: (key, filePath) => {
    S3.putObject({
      Bucket: config.bucket,
      Key: config.previewKey,
      Body: fs.readFileSync(filePath)
    }, (err, data) => {
      if (err) {
        console.error('Error while storing to S3: ', err)
      } else {
        console.log(config.previewKey + ' successfully uploaded');
      }
    });
  },

}
