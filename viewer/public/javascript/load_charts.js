google.charts.load('current', {'packages':['gauge','table','corechart']});
google.charts.setOnLoadCallback(loadEverything);

const UPDATE_EACH_MS = 5000;

var allData = _data; //load initial data (first load)

function loadEverything() {

  if (allData != null && allData.history != null) {
      drawGauges(allData.history);
      drawTable(allData.history);
      drawChart(allData.history);
      drawBestMoment(allData.history);
  }

  setInterval(function(){ 
    console.log("fetching new data... since: " + allData.until)
    getNewData(allData.until, function(err, res) {
      if (err) console.log("error fetching data: " + err);
      else {
        console.log("new data found: " + res.history.length + " items, until " + res.until);
        if (res != null) {
          allData = res;
        }
        if (res != null && res.history != null) {
          drawGauges(res.history);
          drawTable(res.history);
          drawChart(res.history);
          drawBestMoment(res.history);
        }
      }      
    });
  }, UPDATE_EACH_MS);
}

function getNewData(since, callback) {
  var url = "api/history";
  var params = "?";
  if (since != null) params = params + "since=" + since;
  var xhttp = new XMLHttpRequest(); 

  xhttp.addEventListener('load', function() {
    callback(null, JSON.parse(this.responseText));
  });
  xhttp.addEventListener('error', function() {
    callback("failed request")
  });
  
  xhttp.open("GET", url + params, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
}


function drawChart(allData) {

  var arrayData = [['Fecha','Felicidad', 'Sorpresa', 'Enfado', 'Rabia']];

  allData.map(function(x) {
    arrayData.push(
      [timeConverter(x.when), x.joy, x.surprise, x.anger, x.sorrow]
    );
  });

  var data = google.visualization.arrayToDataTable(arrayData);

  var options = {
    title: 'Sentiments',
    vAxis: {minValue: 0},
    hAxis: { textPosition: 'none' },
    isStacked: true
  };

  var chart = new google.visualization.SteppedAreaChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

function drawGauges(allData) {
  let max = null;

  for(let i = 0; i < allData.length; i++) {
    if (max == null || max.when < allData[i].when) {
      max = allData[i];
    }
  }
  
  var options = {
    width: 540, height: 200,
    redFrom: 90, redTo: 100,
    yellowFrom:60, yellowTo: 90,
    minorTicks: 5
  };

  var chart = new google.visualization.Gauge(document.getElementById('gauge_div'));

  if (max != null) {
    var data = google.visualization.arrayToDataTable([
      ['Label', 'Value'],
      ['Felicidad', max.faces > 0 ? max.joy * 100 / max.faces : 0],
      ['Sorpresa',  max.faces > 0 ? max.surprise * 100 / max.faces : 0],
      ['Dolor',     max.faces > 0 ? max.sorrow * 100 / max.faces : 0],
      ['Enfado',    max.faces > 0 ? max.anger * 100 / max.faces : 0]
    ]);

    document.getElementById("gauge_info").innerHTML = timeConverter(max.when, true);

    chart.draw(data, options);
  }
}

function drawTable(allData) {

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Fecha');
  data.addColumn('number', 'Caras');
  data.addColumn('number', 'Felicidad');
  data.addColumn('number', 'Sorpresa');
  data.addColumn('number', 'Dolor');
  data.addColumn('number', 'Enfado');
  data.addColumn('string', 'file');

  allData.map(function(x) {
    data.addRows([[timeConverter(x.when), x.faces, x.joy, x.surprise, x.anger, x.sorrow, x.file]])
  })


  var table = new google.visualization.Table(document.getElementById('table_div'));


  function drawPie(item) {
    var data = google.visualization.arrayToDataTable([
      ['Sentimiento','Asistentes'],
      ['Felicidad', item.joy],
      ['Sorpresa', item.surprise],
      ['Dolor', item.sorrow],
      ['Enfado', item.anger]
    ]);

    var options = {
      legend: 'none',
      pieSliceText: 'label',
      slices: {
        0: { offset: 0.1 }
      }
    }

    var chart = new google.visualization.PieChart(document.getElementById('selected_pie'));
    chart.draw(data, options);
  }

  function drawPhoto(file) {
    document.getElementById("selected_img").src = 'images/' + file + '.jpg';
  }

  function selectHandler() {
    var selectedItem = table.getSelection()[0];
    if (selectedItem) {
      let item = {
        file: data.getValue(selectedItem.row, 6),
        faces: data.getValue(selectedItem.row, 1),
        joy: data.getValue(selectedItem.row, 2),
        surprise: data.getValue(selectedItem.row, 3),
        sorrow: data.getValue(selectedItem.row, 4),
        anger: data.getValue(selectedItem.row, 5) 
      };

      drawPie(item);
      drawPhoto(item.file);
    }
  }


 
  google.visualization.events.addListener(table, 'select', selectHandler);
  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
}

function drawBestMoment(allData) {
  let max = null;

  for(let i = 0; i < allData.length; i++) {
    if (max == null || max.joy < allData[i].joy) {
      max = allData[i];
    }
  }

  if (max != null)
    document.getElementById("best_img").src = 'images/1111111.jpg';//'images/' + max.file + '.jpg';
}


function timeConverter(UNIX_timestamp, long){
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time;

  if (long) {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    time = date + ' de ' + months[month] + ' de ' + year + ', ' + hour + ':' + min + ':' + sec;
  } else {
    time = date + '/' + month + 'T' + hour + ':' + min + ':' + sec ;
  }

  return time;
}