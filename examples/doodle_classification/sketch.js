const len = 784;
const totalData = 1000;

const CAT = 0;
const RAINBOW = 1;
const TRAIN = 2;

let catsData;
let trainsData;
let rainbowsData;

let cats = {};
let trains = {};
let rainbows = {};

let nn;

let train = false;
let counter = 0;

let training = [];
let testing = [];

function preload() {
  catsData = loadBytes('data/cats1000.bin');
  trainsData = loadBytes('data/trains1000.bin');
  rainbowsData = loadBytes('data/rainbows1000.bin');
}


function setup() {
  frameRate(60);
  createCanvas(280, 280);
  background(255);

  // Preparing the data
  prepareData(cats, catsData, CAT);
  prepareData(rainbows, rainbowsData, RAINBOW);
  prepareData(trains, trainsData, TRAIN);

  // Making the neural network
  nn = new NeuralNetwork(784, 64, 3);

  // Randomizing the data
  //let training = [];
  training = training.concat(cats.training);
  training = training.concat(rainbows.training);
  training = training.concat(trains.training);

  //let testing = [];
  testing = testing.concat(cats.testing);
  testing = testing.concat(rainbows.testing);
  testing = testing.concat(trains.testing);

  let trainButton = select('#train');
  let epochCounter = 0;
  trainButton.mousePressed(function () {
    //trainEpoch(training);
    document.getElementById("infotext").innerHTML = "Traning";
    train = true;
    background(255);
    shuffle(training, true);
    epochCounter++;
    console.log("Epoch: " + epochCounter);
  });

  let testButton = select('#test');
  testButton.mousePressed(function () {
    document.getElementById("infotext").innerHTML = "Traning";
    let percent = testAll(testing);
    document.getElementById("infotext").innerHTML = "Percent: " + nf(percent, 2, 2) + "%";
    console.log("Percent: " + nf(percent, 2, 2) + "%");
  });

  let guessButton = select('#guess');
  guessButton.mousePressed(Guess);



  let clearButton = select('#clear');
  clearButton.mousePressed(function () {
    document.getElementById("infotext").innerHTML = "Doodle";
    background(255);
  });
  // for (let i = 1; i < 6; i++) {
  //   trainEpoch(training);
  //   console.log("Epoch: " + i);
  //   let percent = testAll(testing);
  //   console.log("% Correct: " + percent);
  // }
}

let mousepressed = false;

function draw() {
  strokeWeight(8);
  stroke(0);
  if (mouseIsPressed) {
    //console.log(mouseY +"<="+ canvas.height +"&&"+ mouseX +"<="+ canvas.width)
    if (mouseY <= canvas.height && mouseX <= canvas.width) {
      mousepressed = true;
      line(pmouseX, pmouseY, mouseX, mouseY);
    }
  } else if (mousepressed) {
    mousepressed = false;
    Guess();
  }
  if (train) {
    if (counter < training.length) {
      counter = trainEpoch(training, counter);
    } else {
      counter = 0;
      train = false;
      console.log("finnish training");
      document.getElementById("infotext").innerHTML = "Finnish";
      let percent = testAll(testing);
      document.getElementById("iqtext").innerHTML = nf(percent, 2, 2) + "%";
    }
  }
}

function Guess() {
  let inputs = [];
  let img = get();
  let infotext = document.getElementById("infotext");
  img.resize(28, 28);
  img.loadPixels();
  for (let i = 0; i < len; i++) {
    let bright = img.pixels[i * 4];
    inputs[i] = (255 - bright) / 255.0;
  }

  let guess = nn.predict(inputs);
  let m = max(guess);
  console.log(m);
  let classification = guess.indexOf(m);

  if (m < 0.5) {
    classification = -1;
  }
  m = nf(m * 100, 2,0) + "% SURE A ";
  if (classification === CAT) {
    console.log("cat");
    infotext.innerHTML = m + "CAT";
  } else if (classification === RAINBOW) {
    console.log("rainbow");
    infotext.innerHTML = m + "RAINBOW";
  } else if (classification === TRAIN) {
    console.log("train");
    infotext.innerHTML = m + "TRAIN ";
  } else {
    console.log("??");
    infotext.innerHTML = "DON'T KNOW";
  }
}

  //image(img, 0, 0)