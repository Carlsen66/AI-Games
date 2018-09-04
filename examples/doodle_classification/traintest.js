
// function trainEpoch(training) {
//   shuffle(training, true);
//   //console.log(training);
//   // Train for one epoch
//   for (let i = 0; i < training.length; i++) {
//     let data = training[i];
//     let inputs = Array.from(data).map(x => x / 255);
//     let label = training[i].label;
//     let targets = [0, 0, 0];
//     targets[label] = 1;
//     // console.log(inputs);
//     // console.log(targets);
    
//     nn.train(inputs, targets);
//   }
// }

function trainEpoch(training, l) {
  //shuffle(training, true);
  //console.log(training);
  // Train for one epoch
  for(i=0;i < 25;i++,l++) {
    let data = training[l];
    let inputs = Array.from(data).map(x => x / 255);
    let label = training[l].label;
    let targets = [0, 0, 0];
    targets[label] = 1;
    // console.log(inputs);
    // console.log(targets);
    //console.log(l);
    stroke(0,0,255);
    rect(0,canvas.height-5,floor((canvas.width/training.length)*l) ,3);
    //line(0,0,floor((canvas.width/training.length)*l) ,1);
    nn.train(inputs, targets);
  }
  return l;
}

function testAll(testing) {

  let correct = 0;
  // Train for one epoch
  for (let i = 0; i < testing.length; i++) {
    // for (let i = 0; i < 1; i++) {
    let data = testing[i];
    let inputs = Array.from(data).map(x => x / 255);
    let label = testing[i].label;
    let guess = nn.predict(inputs);

    let m = max(guess);
    let classification = guess.indexOf(m);
    // console.log(guess);
    // console.log(classification);
    // console.log(label);

    if (classification === label) {
      correct++;
    }
  }
  let percent = 100 * correct / testing.length;
  return percent;

}
