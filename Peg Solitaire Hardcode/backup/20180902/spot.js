// Bested on Daniel Shiffman Flappy Bird
// http://codingtra.wn

// An object to describe a spot in the grid
function Spot(w, h) {
  // Location
  this.w = w;
  this.h = h;

  // Neighbors
  this.neighbors = [];

  // Am I a wall?
  this.wall = true;
  if (w == 0 & h == 0) {
    this.wall = false;
  }


  // Display me
  this.show = function(col) {
    if (this.wall) {
      fill(col);
      noStroke();
      ellipse(this.w * ww + ww / 2, this.h * hh + hh / 2, ww / 2, hh / 2);
    } else if (col) {
      fill(col);
      rect(this.w * ww, this.h * hh, ww, hh);
    }
  }

  // Figure out who my neighbors are
  this.addNeighbors = function(grid) {
    var w = this.w;
    var h = this.h;
    if (w < cols - 1) {
      this.neighbors.push(grid[w + 1][h]);
    } else {
      this.neighbors.push(falsegrid);
    }
    if (h < rows - 1) {
      this.neighbors.push(grid[w][h + 1]);
    } else {
      this.neighbors.push(falsegrid);
    }
    if (w > 0) {
      this.neighbors.push(grid[w - 1][h]);
    } else {
      this.neighbors.push(falsegrid);
    }
    if (h > 0) {
      this.neighbors.push(grid[w][h - 1]);
    } else {
      this.neighbors.push(falsegrid);
    }
  }
}
