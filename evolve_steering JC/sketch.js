// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// Evolutionary "Steering Behavior" Simulation

// An array of vehicles
var population = [];

// An array of "food"
var food = [];
// An array of "poison"
var poison = [];

// How good is food, how bad is poison?
var nutrition = [0.1, -1];

// Show additional info on DNA?
var debug;

var longestlive = [];
var longestlivetot = [];

var cwidth = 0;
var coffset = 0;
var runtime = 0;
var savecount = 900;
var BestDNA = [];

function setup() {
  frameRate(60);
  // Add canvas and grab checkbox
  var canvas = createCanvas(900, 600);

  canvas.parent('canvascontainer');
  debug = select('#debug');

  coffset = 200;
  cwidth = width - coffset;

  // Create 10 vehicles
  angleMode(RADIANS);
  for (var i = 0; i < 10; i++) {
    population[i] = new Vehicle(cwidth / 2, height / 2);
  }
  // Start with some food
  for (var i = 0; i < 100; i++) {
    food[i] = createVector(random(cwidth), random(height));
  }
  // Start with some poison
  for (var i = 0; i < 50; i++) {
    poison[i] = createVector(random(cwidth), random(height));
  }
}

// Add new vehicles by dragging mouse
function mouseDragged() {
  population.push(new Vehicle(mouseX, mouseY));
}

function draw() {
  background(0);

  // 10% chance of new food
  if (random(1) < 0.1 && food.length < 400) {
    food.push(createVector(random(cwidth), random(height)));
  }

  // 1% chance of new poison
  if (random(1) < 0.05) {
    if (poison.length && poison.length < 300) {
      poison.push(createVector(random(cwidth), random(height)));
    }
  }
  //longestlive.livetime = 0;
  var lv = [];
  lv.livetime = 0;
  lv.health = 0;

  // Go through all vehicles
  for (var i = population.length - 1; i >= 0; i--) {
    var v = population[i];
    var livetime = 0;

    // Eat the food (index 0)
    v.eat(food, 0);
    // Eat the poison (index 1)
    v.eat(poison, 1);
    // Check boundaries
    v.boundaries();

    // Update and draw
    v.update();
    v.display();
    if (v.livetime >= livetime) {
      if (v.health > lv.health) {
        lv = v;
        livetime = v.livetime;
        //console.log(lv);
      }
    }
    if (v.livetime > livetime) {
      lv = v;
      livetime = v.livetime;
      BestDNA = population.slice(i,i+1);
    }

    //

    // If the vehicle has died, remove
    if (v.dead()) {
      population.splice(i, 1);
    } else {
      // Every vehicle has a chance of cloning itself
      var child = v.birth();
      if (child != null) {
        population.push(child);
      }
    }

  }
  if (population.length < 1) {
    for (var i = 0; i < 10; i++) {
      population[i] = new Vehicle(cwidth / 2, height / 2);
    }
  }
  longestlive = lv;

  // savecount++;
  // if (savecount>1000) {
  //    console.log('save');
  //    save(BestDNA, 'BestDNA.html');
  //    savecount=0;
  // }

  //console.log(longestlive.livetime);
  if (longestlivetot.livetime == undefined) {
    longestlivetot = longestlive;
    console.log(longestlive);
  }

  if (longestlive.livetime > longestlivetot.livetime) {
    longestlivetot = longestlive;
  }


  // Draw all the food and all the poison
  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4);
  }

  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4);
  }



  var tsize = 18;
  var tstart = 18;
  textSize(tsize);
  textFont('Georgia');

  noFill();
  stroke(255, 0, 0);
  rect(cwidth - 2, tstart - tsize, coffset - 2, 5 + tsize * 8, 5);

  fill(51, 204, 51);
  noStroke();
  text('Vehicle alive', cwidth, tstart); tstart += tsize;
  text(population.length, cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Longest livetime', cwidth, tstart); tstart += tsize;
  text(longestlive.livetime, cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Longest livetime tot', cwidth, tstart); tstart += tsize;
  text(longestlivetot.livetime, cwidth + (coffset / 2), tstart); tstart += tsize;
  runtime++;
  text('Program run time', cwidth, tstart); tstart += tsize;
  text(runtime, cwidth + (coffset / 2), tstart); tstart += tsize;

  // 0: Attraction/Repulsion to food
  // 1: Attraction/Repulsion to poison
  // 2: Radius to sense food
  // 3: Radius to sense poison
  tstart = tsize * 10;
  noFill();
  stroke(255, 0, 0);
  rect(cwidth - 2, tstart - tsize, coffset - 2, 5 + tsize * 11, 5);

  fill(51, 204, 51);
  noStroke();
  text('Best DNA', cwidth, tstart); tstart += tsize;
  text('DNA Attraction food', cwidth, tstart); tstart += tsize;
  text(nf(longestlivetot.dna[0], 1, 4), cwidth + (coffset / 2), tstart); tstart += tsize;
  text('DNA Attraction poison', cwidth, tstart); tstart += tsize;
  text(nf(longestlivetot.dna[1], 1, 4), cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Radius to sense food', cwidth, tstart); tstart += tsize;
  text(nf(longestlivetot.dna[2], 1, 4), cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Radius to sense poison', cwidth, tstart); tstart += tsize;
  text(nf(longestlivetot.dna[3], 1, 4), cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Food vs poison sense', cwidth, tstart); tstart += tsize;
  text(nf(longestlivetot.dna[2] / longestlivetot.dna[3], 1, 4), cwidth + (coffset / 2), tstart); tstart += tsize;

  tstart = tsize * 22;
  noFill();
  stroke(255, 0, 0);
  rect(cwidth - 2, tstart - tsize, coffset - 2, 5 + tsize * 6, 5);

  fill(51, 204, 51);
  noStroke();
  text('Num of food', cwidth, tstart); tstart += tsize;
  text(food.length, cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Num of poison', cwidth, tstart); tstart += tsize;
  text(poison.length, cwidth + (coffset / 2), tstart); tstart += tsize;
  text('Food vs poison', cwidth, tstart); tstart += tsize;
  text(nf((food.length / poison.length), 1, 2), cwidth + (coffset / 2), tstart); tstart += tsize;
}
