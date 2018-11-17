// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy Pegboard implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&


// This file includes functions for creating a new generation
// of Pegboards.

// Start the game over
function resetGame() {
  counter = 0;
  // Resetting best Pegboard score to 0
  if (bestPegboard) {
    bestPegboard.score = 0;
  }
}

// Create the next generation
function nextGeneration() {
  // resetGame();
  // Normalize the fitness values 0-1
  normalizeFitness(allPegBoards);
  // Generate a new set of Pegboards
  activePegboards = generate(allPegBoards);
  // Copy those Pegboards to another array
  allPegBoards = activePegboards.slice();
}

// Generate a new population of Pegboards
function generate(oldPegboards) {
  let newPegboards = [];
  for (let i = 0; i < oldPegboards.length; i++) {
    // Select a Pegboard based on fitness
    let Pegboard = poolSelection(oldPegboards);
    newPegboards[i] = Pegboard;
  }
  return newPegboards;
}

// Normalize the fitness of all Pegboards
function normalizeFitness(Pegboards) {
  // Make score exponentially better?
  for (let i = 0; i < Pegboards.length; i++) {
    Pegboards[i].score = pow(Pegboards[i].score, 2);
  }

  // Add up all the scores
  let sum = 0;
  for (let i = 0; i < Pegboards.length; i++) {
    sum += Pegboards[i].score;
  }
  // Divide by the sum
  for (let i = 0; i < Pegboards.length; i++) {
    Pegboards[i].fitness = Pegboards[i].score / sum;
  }
}

// An algorithm for picking one Pegboard from an array
// based on fitness
function poolSelection(Pegboards) {
  // Start at 0
  let index = 0;

  // Pick a random number between 0 and 1
  let r = random(1);

  // Keep subtracting probabilities until you get less than zero
  // Higher probabilities will be more likely to be fixed since they will
  // subtract a larger number towards zero
  while (r > 0) {
    r -= Pegboards[index].fitness;
    // And move on to the next
    index += 1;
  }

  // Go back one
  index -= 1;

  // Make sure it's a copy!
  // (this includes mutation)
  
  return Pegboards[index].copy();
}