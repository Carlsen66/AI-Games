// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy Gun implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&


// This file includes functions for creating a new generation
// of Guns.

// Start the game over
function resetGame() {
  counter = 0;
  // Resetting best Gun score to 0
  if (bestGun) {
    bestGun.score = 0;
  }

}

// Create the next generation
function nextGeneration() {
  resetGame();
  // Normalize the fitness values 0-1
  normalizeFitness(allGuns);
  // Generate a new set of Guns
  activeGuns = generate(allGuns);
  // Copy those Guns to another array
  allGuns = activeGuns.slice();
}

// Generate a new population of Guns
function generate(oldGuns) {
  let newGuns = [];
  for (let i = 0; i < oldGuns.length; i++) {
    // Select a Gun based on fitness
    let Gun = poolSelection(oldGuns);
    newGuns[i] = Gun;
  }
  return newGuns;
}

// Normalize the fitness of all Guns
function normalizeFitness(Guns) {
  // Make score exponentially better?
  for (let i = 0; i < Guns.length; i++) {
    Guns[i].score = pow(Guns[i].score, 2);
  }

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < Guns.length; i++) {
    sum += Guns[i].score;
  }
  // Divide by the sum
  for (let i = 0; i < Guns.length; i++) {
    Guns[i].fitness = Guns[i].score / sum;
  }
}


// An algorithm for picking one Gun from an array
// based on fitness
function poolSelection(Guns) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= Guns[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  // Make sure it's a copy!
  // (this includes mutation)
  return Guns[index].copy();
}