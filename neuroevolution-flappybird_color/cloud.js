class Cloud {
    constructor() {
      // Starts at the edge
      this.x = width;
      // Width of pipe
      this.y = random(-20, 50);
      // How fast
      this.speed = random(2,3);
      this.w = cloudimg.width;
      //console.log("new cloud");
    }

  
    // Draw the pipe
    show() {
      //image(cloudimg, this.x, this.y);
      image(cloudimg, this.x, this.y);
      //rect(this.x, 0, this.w, this.top);
      //rect(this.x, height - this.bottom, this.w, this.bottom);
    }
  
    // Update the pipe
    update() {
      this.x -= this.speed;
    }
  
    // Has it moved offscreen?
    offscreen() {
      if (this.x < -this.w) {
        //console.log("del cloud")
        return true;
      } else {
        return false;
      }
    }
  }