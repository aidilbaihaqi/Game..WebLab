let gameManager;
let scoreKeeper;
let rotator;
let pinSpawner;

const lightYellow = [255, 255, 237];
const scaryBloodRed = [255, 0, 0];

function setup() {
  const w = windowWidth;
  const h = max(windowHeight, 300);
  createCanvas(w, h);

  const rotatorPosition = createVector(width * 0.5, height * 0.33);
  rotator = new Rotator(rotatorPosition.x, rotatorPosition.y);
  scoreKeeper = new ScoreKeeper(rotatorPosition.x, rotatorPosition.y);

  const pinSpawnerPosition = createVector(width * 0.5, height * 0.85);
  pinSpawner = new PinSpawner(pinSpawnerPosition.x, pinSpawnerPosition.y);

  gameManager = new GameManager();
}

function draw() {
  gameManager.setRotationSpeed();

  if (gameManager.isGameOver) {
    background(scaryBloodRed);
  } else {
    background(lightYellow);
    pinSpawner.updatePins(rotator);
    pinSpawner.render();
  }

  pinSpawner.pins.forEach(p => p.render());

  let score = getScore();
  scoreKeeper.setScore(score);

  rotator.render();
  scoreKeeper.render();
}

function getScore() {
  let score = 0;
  pinSpawner.pins.forEach(p => {
    if (!p.isActive) { score++ }
  });
  return score;
}

class GameManager {
  constructor() {
    this.setInitialConditions();
  }

  setInitialConditions() {
    this.isGameOver = false;
    this.rotateFast = false;
    this.rotationSpeed = PI / 64;
    this.date = new Date();
    this.time = this.date.getTime();
    this.timeInterval = 1; 
  }

  setRotationSpeed() {
    let currentDate = new Date();
    let currentTime = currentDate.getTime();
    if (currentTime > this.time + (this.timeInterval * 1000)) {
      this.time = currentTime;
      if (this.rotateFast) {
        this.rotateFast = false;
        this.rotationSpeed = PI / 128;
      } else {
        this.rotateFast = true;
        this.rotationSpeed = PI / 64;
      }
    }
  }

  endGame() {
    this.isGameOver = true;

    setTimeout(function() {
      pinSpawner.resetPins();
      this.setInitialConditions();
    }.bind(this), 2000);
  }
}

class ScoreKeeper {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.score = 0;
  }

  resetScore() {
    this.score = 0;
  }

  setScore(score) {
    this.score = score;
  }

  render() {
    push();
    textAlign(CENTER, CENTER);
    noStroke();
    fill(lightYellow);
    textSize(48);
    text(this.score, this.position.x, this.position.y);
    pop();
  }
}

class PinSpawner {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.pins = [];
  }

  resetPins() {
    this.pins = [];
  }

  spawnPin(rotatorPivot, rotatorRadius) {
    const pin = new Pin(this.position.x, this.position.y, rotatorPivot, rotatorRadius);
    this.pins.push(pin);
  }

  updatePins(rotator) {
    for (let pin of this.pins) {
      if (pin.isActive) {
        let rotatorEdge = rotator.position.y + (rotator.diameter * 0.5);
        let pinPointPos = pin.position.y - pin.pinLength;
        let didPinCollideWithRotator = pinPointPos < rotatorEdge;
        pin.updateActivePinPosition(didPinCollideWithRotator, this.pins);
      } else {
        pin.updateStuckPinPosition();
      }
    }
  }

  render() {
    noStroke();
    fill(186);
    circle(this.position.x, this.position.y, height * 0.05);
  }
}

class Pin {
  constructor(x, y, rotatorPivot, rotatorRadius) {
    this.position = createVector(x, y);
    this.isActive = true;
    this.speed = height * 0.05;
    this.pinLength = height * 0.1;
    this.pinPointPos = createVector(x, y - this.pinLength);
    this.rotatorPivot = rotatorPivot;
    this.rotatorRadius = rotatorRadius;
    this.angle = PI / 2;
    this.radius = height * 0.016;
  }

  updateActivePinPosition(didPinCollideWithRotator, pins) {
    let didPinCollideWithOtherPin = this.checkForPinCollision(pins);

    if (didPinCollideWithRotator) {
      this.isActive = false;
    } else if (didPinCollideWithOtherPin) {
      gameManager.endGame();
    } else {
      this.position.y -= this.speed;
      this.pinPointPos.y -= this.speed;
    }
  }

  checkForPinCollision(pins) {
    let didPinCollideWithOtherPin = false;
    pins.forEach(p => {
      let distance = dist(this.pinPointPos.x, this.pinPointPos.y, p.position.x, p.position.y);
      if (distance < p.radius) {
        didPinCollideWithOtherPin = true;
      }
    });
    return didPinCollideWithOtherPin;
  }

  updateStuckPinPosition() {
    this.angle += gameManager.rotationSpeed;
    let radius = this.rotatorRadius + this.pinLength;
    this.position.x = this.rotatorPivot.x + (radius * cos(this.angle));
    this.position.y = this.rotatorPivot.y + (radius * sin(this.angle));
    this.pinPointPos.x = this.rotatorPivot.x + (this.rotatorRadius * cos(this.angle));
    this.pinPointPos.y = this.rotatorPivot.y + (this.rotatorRadius * sin(this.angle));
  }

  render() {
    const { x, y } = this.position;
    push();
    stroke(12);
    strokeWeight(3);
    fill(12);
    line(x, y, this.pinPointPos.x, this.pinPointPos.y);
    circle(x, y, this.radius * 2);
    pop();
  }
}

class Rotator {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.diameter = height * 0.25;
  }

  render() {
    push();
    translate(this.position.x, this.position.y);
    noStroke();
    fill(12);
    circle(0, 0, this.diameter);
    pop();
  }
}

function mouseClicked() {
  if (!gameManager.isGameOver) {
    let rotatorPivot = rotator.position;
    let rotatorRadius = rotator.diameter * 0.5;
    pinSpawner.spawnPin(rotatorPivot, rotatorRadius);
  }
  return false; 
}
//when there is internet and no beeps, a.mp3 will be used
function beep() {
  var snd = new Audio("a.mp3");  
  snd.play();
}
function beep() {
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
    }