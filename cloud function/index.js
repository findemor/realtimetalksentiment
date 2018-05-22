const vision = require('@google-cloud/vision')();
const storage = require('@google-cloud/storage')();
const BigQuery = require('@google-cloud/bigquery');


exports.newSentimentStatus = function (event, callback) {
  const file = event.data;

  if (file.resourceState === 'not_exists') {
    console.log(`File ${file.name} deleted.`);
  } else if (file.metageneration === '1') {
    // metageneration attribute is updated on metadata changes.
    // on create value is 1
    console.log(`Bucket: ${file.name}`);
    console.log(`File  : ${file.name} uploaded.`);
    console.log(`Sending to ML Vision API`);

  } else {
    console.log(`File ${file.name} metadata updated.`);
  }

  filecloud = storage.bucket(file.bucket).file(file.name);
  vision.detectFaces(filecloud, function (err, faces) {
    if (err) {
      console.error(`Failed to analyze ${file.name}.`, err);
    }
    var numFaces = faces.length;
    var topic = file.name.split(".")[0];
    var ts = +file.name.split(".")[2];
    var tjoy = 0;
    var tanger = 0;
    var tsorrow = 0;
    var tsurprise = 0;
    console.log('Found ' + numFaces + (numFaces === 1 ? ' face' : ' faces'));

    function isGreaterLikelihood(index, moodsArray) {
      function indexOfMax(arr) {
        if (arr.length === 0) {
            return -1;
        }
    
        var max = arr[0];
        var maxIndex = 0;
    
        for (var i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }
    
        return maxIndex;
      }

      return index == indexOfMax(moodsArray);
    }

    if (numFaces >= 1) {
      faces.forEach(function (face, i) {
        console.log(`Single Face: ${file.name} Face #${i + 1} Joy: ${face.joy} / ${face.joyLikelihood} Anger: ${face.anger} / ${face.angerLikelihood} Sorrow: ${face.sorrow} / ${face.sorrowLikelihood} Surprise: ${face.surprise} / ${face.surpriseLikelihood}`);
        if (face.joy || isGreaterLikelihood(0, [face.joyLikelihood, face.angerLikelihood, face.sorrowLikelihood, face.surpriseLikelihood])) {
          tjoy += 1;
        }
        if (face.anger || isGreaterLikelihood(1, [face.joyLikelihood, face.angerLikelihood, face.sorrowLikelihood, face.surpriseLikelihood])) {
          tanger += 1;
        }
        if (face.sorrow || isGreaterLikelihood(2, [face.joyLikelihood, face.angerLikelihood, face.sorrowLikelihood, face.surpriseLikelihood])) {
          tsorrow += 1;
        }
        if (face.surprise || isGreaterLikelihood(3, [face.joyLikelihood, face.angerLikelihood, face.sorrowLikelihood, face.surpriseLikelihood])) {
          tsurprise += 1;
        }
      });

      console.log(`Summary Faces: ${file.name} Joy: ${tjoy} Anger: ${tanger} Sorrow: ${tsorrow} Surprise: ${tsurprise}`);

      const bigquery = BigQuery({
        projectId: "realtimesentiment-204610"
      })

      var Dataset = bigquery.dataset('realtimesentiment');
      var Table = Dataset.table('samples');

      console.log(`Recording DATA`);
      rows = [{'ts': ts, 'topic': topic, 'faces': faces.length, 'joy': tjoy, 'anger':tanger, 'sorrow':tsorrow, 'surprise':tsurprise, 'file': file.name}];
      console.log('data:' + JSON.stringify(rows));
      bigquery
        .dataset("realtimesentiment")
        .table("samples")
        .insert(rows)
        .then((data) => {
          console.log('Inserted:' + JSON.stringify(data) + " rows: " + JSON.stringify(rows));
          rows.forEach((row) => console.log(row));
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
    }
  });
  callback();
};
