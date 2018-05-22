const UPDATE_EACH_MS = 5000;

//requisitos de los google charts
google.charts.load('current', {'packages':['gauge','table','corechart']});
google.charts.setOnLoadCallback(exec);

var allData = _data; //load initial data (first load)
var lastRegister = null; //el ultimo registro observado

//inicia el proceso de carga y visualización e datos
function exec() {

  var gauges = null, chart = null, table = null;
  var firstBuild = false;

  function buildCharts(history) {
    gauges = buildGauges(history);
    chart = buildTrendlines(history);
    table = buildTable(history);
  }
  
  if (allData != null && allData.history != null) {
    firstBuild = true;
    buildCharts(allData.history);
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

          if (!firstBuild)
            buildCharts(res.history);
          else { //update data
            addToGauges(gauges, res.history);
            addToTrendlines(chart, res.history);
            addToTable(table, res.history);
          }

        }
      }      
    });
  }, UPDATE_EACH_MS);
}

//llama al API para obtener un nuevo paquete de datos
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

//crea el diagrama de areas
function buildTrendlines(initialData) {
  var arrayData = [
    [
      {label: "ts", type: "datetime"}, 
      {label: "Felicidad", type: "number"},
      {label: "Sorpresa", type: "number"},
      {label: "Enfado", type: "number"},
      {label: "Rabia", type: "number"}
    ]
  ];

  var data = google.visualization.arrayToDataTable(arrayData);

  var options = {
    title: 'Tendencia',
    vAxis: {minValue: 0},
    hAxis: { textPosition: 'none' },
    useNumbers: true,
    trendlines: { 1: {}, 2: {}, 3: {}, 0: {} }
  };

  var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
  
  var bChart = { chart: chart, data: data, options: options };
  addToTrendlines(bChart, initialData);

  return bChart;
}

//añade datos al grafico
function addToTrendlines(chart, data) {

  var arrayData = [];

  if (data != null) {
    data.map(function(x) {
      arrayData.push(
        [timeConverter(x.ts, false), x.joy, x.surprise, x.anger, x.sorrow]
      );
    });
  }

  chart.data.insertRows(chart.data.getNumberOfRows(), arrayData);

  const rowsOverflow = chart.data.getNumberOfRows() - 100; //100 ultimas muestras
  if (rowsOverflow > 0) 
  {
    for(let i = rowsOverflow; i >= 0; i--)
      chart.data.removeRow(i);
  }

  chart.chart.draw(chart.data, chart.options);
}

//crea el diagrama de areas
function buildChart() {
  var arrayData = [
    ['Fecha','Felicidad', 'Sorpresa', 'Enfado', 'Rabia'],
    ['',0,0,0,0]
  ];

  var data = google.visualization.arrayToDataTable(arrayData);

  var options = {
    title: 'Sentiments',
    vAxis: {minValue: 0},
    hAxis: { textPosition: 'none' },
    isStacked: true
  };

  var chart = new google.visualization.SteppedAreaChart(document.getElementById('chart_div'));
  chart.draw(data, options);

  return { chart: chart, data: data, options: options };
}

//añade datos al grafico
function addToChart(chart, data) {

  var arrayData = [];

  if (data != null) {
    data.map(function(x) {
      arrayData.push(
        [timeConverter(x.ts), x.joy, x.surprise, x.anger, x.sorrow]
      );
    });
  }

  chart.data.insertRows(chart.data.getNumberOfRows(), arrayData);

  const rowsOverflow = chart.data.getNumberOfRows() - 240;//20 minutos, cada 5 segundos
  if (rowsOverflow > 0) 
  {
    for(let i = rowsOverflow; i >= 0; i--)
      chart.data.removeRow(i);
  }

  chart.chart.draw(chart.data, chart.options);
}

//Crea los diagramas de medicion
function buildGauges(initialData) {
  var options = {
    width: 540, height: 200,
    redFrom: 90, redTo: 100,
    yellowFrom:60, yellowTo: 90,
    minorTicks: 5
  };

  var chart = new google.visualization.Gauge(document.getElementById('gauge_div'));

  var data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Felicidad', 0],
    ['Sorpresa',  0],
    ['Dolor',     0],
    ['Enfado',    0]
  ]);

  document.getElementById("gauge_info").innerHTML = "Ultima destacada...";
  
  var bChart = { chart: chart, data: data, options: options };
  addToGauges(bChart, initialData);
  return bChart
}

//actualiza los datos del medidor
function addToGauges(chart, data) {

  if (data != null) {
    for(let i = 0; i < data.length; i++) {
      if (lastRegister == null || lastRegister.ts < data[i].ts) {
        max = data[i];
      }
    }
  }
  
  if (max != null) {
    chart.data.setValue(0,1, max.faces > 0 ? max.joy * 100 / max.faces : 0);
    chart.data.setValue(1,1, max.faces > 0 ? max.surprise * 100 / max.faces : 0);
    chart.data.setValue(2,1, max.faces > 0 ? max.sorrow * 100 / max.faces : 0);
    chart.data.setValue(3,1, max.faces > 0 ? max.anger * 100 / max.faces : 0);

    document.getElementById("gauge_info").innerHTML = timeConverter(max.ts, true);

    if (max.file)
      document.getElementById("best_img").src = 'images/' + max.file;
    else 
      document.getElementById("best_img").src = 'images/default.jpg';
  }

  chart.chart.draw(chart.data, chart.options);   
}

function addToTable(chart, data) {
  var arrayData = [];

  if (data != null) {
    data.map(function(x) {
      arrayData.push([timeConverter(x.ts, true), x.faces, x.joy, x.surprise, x.anger, x.sorrow, x.file]);
    });
  }

  chart.data.insertRows(chart.data.getNumberOfRows(), arrayData);

  const rowsOverflow = chart.data.getNumberOfRows() - 500;
  if (rowsOverflow > 0) 
  {
    for(let i = rowsOverflow; i >= 0; i--)
      chart.data.removeRow(i);
  }

  chart.chart.draw(chart.data, chart.options);
}

//Crea la tabla de registros
function buildTable(initialData) {

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Fecha');
  data.addColumn('number', 'Caras');
  data.addColumn('number', 'Felicidad');
  data.addColumn('number', 'Sorpresa');
  data.addColumn('number', 'Dolor');
  data.addColumn('number', 'Enfado');
  data.addColumn('string', 'file');


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

    return chart;
  }

  function drawPhoto(file) {
    if (!file) 
      document.getElementById("selected_img").src = 'images/default.jpg';
    else
      document.getElementById("selected_img").src = 'images/' + file;
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


  var options = {showRowNumber: true, width: '100%', height: '100%'};

  google.visualization.events.addListener(table, 'select', selectHandler);
  

  var bChart = { chart: table, data: data, options: options};

  addToTable(bChart, initialData);

  return bChart;
}


//Convierte la hora posix a algo que podamos leer
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
    //time = date + '/' + month + 'T' + hour + ':' + min + ':' + sec ;
    time = a;
  }

  return time;
}