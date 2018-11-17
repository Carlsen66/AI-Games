let dataset = [];
let data = [];

function getdata(json) {
  data = json;
  dataset.push(data);

  // console.log('Data :' + brain);

}

function preload() {
  for (let i = 1; i < 72; i++) {
    loadJSON('data2/data (' + i + ').json', getdata);
  }
}

function arraycompare(data) {
  let flatmoves = [];
  let flatarray = [];
  let d1 = [];
  let d2 = [];
  let dcount = 0;

  for (datalist of data) {
    for (moves of datalist) {
      for (m of moves) {
        flatmoves.push(m);
      }
    }
    flatarray.push(flatmoves);
    flatmoves = [];
  }
  console.log(flatarray[0])
  for (i = 0; i < flatarray.length; i++) {
    d1 = flatarray[i];
    for (j = flatarray.length - 1; j > 0; j--) {
      d2 = flatarray[j];
      // console.log(d2);
      dcount = 0;
      if (j != i) {
        for (h = 0; h < d1.length; h++) {
          if (d1[h] === d2[h]) dcount++;
        }
        // console.log(dcount)
        if (dcount === d1.length) {
          data.splice(j, 1);
          console.log('deleting ' + j)
        }
      }
    }
  }
  // console.log(data);
  return data;
}

function setup() {
  createCanvas(400, 600);
  console.log('Peg game collect data');

  dataset = arraycompare(dataset);

}

function draw() {


  let json = {};
  json = dataset;

  saveJSON(json, 'dataset.json')
  // loadJSON('data/data (1).json', getdata);

  noLoop();
}