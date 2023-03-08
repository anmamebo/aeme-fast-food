//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(init, 1);
} else {
  document.addEventListener("DOMContentLoaded", init);
}

function init() {
  time = new Date();
  start();
  loop();
}

function loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();
  update();
  requestAnimationFrame(loop);
}

//****** GAME LOGIC ********//

var groundY = 22;
var velY = 0;
var impulse = 900;
var gravity = 2500;

var dinoPosX = 42;
var dinoPosY = groundY;

var groundX = 0;
var velScenario = 1280 / 3;
var gameVel = 1;
var score = 0;

var stopped = false;
var jumping = false;

var timeUntilObstacle = 2;
var timeObstacleMin = 0.7;
var timeObstacleMax = 1.8;
var obstaclePosY = 16;
var obstacles = [];

var timeUntilCloud = 0.5;
var timeCloudMin = 0.7;
var timeCloudMax = 2.7;
var maxCloudY = 270;
var minCloudY = 100;
var clouds = [];
var velCloud = 0.5;

var container;
var dino;
var textScore;
var ground;
var gameOverElem;

function start() {
  gameOverElem = document.querySelector(".game-over");
  ground = document.querySelector(".ground");
  container = document.querySelector(".game-container");
  textScore = document.querySelector(".score");
  dino = document.querySelector(".dino");
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("touchstart", handleTouchStart);
}

function update() {
  if (stopped) return;

  moveDino();
  moveGround();
  decideCreateObstacle();
  decideCreateClouds();
  moveObstacles();
  moveClouds();
  detectCollision();

  velY -= gravity * deltaTime;
}

function handleKeyDown(ev) {
  if (ev.keyCode == 32) {
    jump();
  }
}

function handleTouchStart(ev) {
  jump();
}

function jump() {
  if (dinoPosY === groundY) {
    jumping = true;
    velY = impulse;
    dino.classList.remove("dino-running");
  }
}

function moveDino() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < groundY) {

    touchGround();
  }
  dino.style.bottom = dinoPosY + "px";
}

function touchGround() {
  dinoPosY = groundY;
  velY = 0;
  if (jumping) {
    dino.classList.add("dino-running");
  }
  jumping = false;
}

function moveGround() {
  groundX += calculateDisplacement();
  ground.style.left = -(groundX % container.clientWidth) + "px";
}

function calculateDisplacement() {
  return velScenario * deltaTime * gameVel;
}

function crash() {
  dino.classList.remove("dino-running");
  dino.classList.add("dino-crashed");
  stopped = true;
}

function decideCreateObstacle() {
  timeUntilObstacle -= deltaTime;
  if (timeUntilObstacle <= 0) {
    createObstacle();
  }
}

function decideCreateClouds() {
  timeUntilCloud -= deltaTime;
  if (timeUntilCloud <= 0) {
    createCloud();
  }
}

function createObstacle() {
  var obstacle = document.createElement("div");
  container.appendChild(obstacle);
  obstacle.classList.add("burger");
  if (Math.random() > 0.5) obstacle.classList.add("hotdog");
  obstacle.posX = container.clientWidth;
  obstacle.style.left = container.clientWidth + "px";

  obstacles.push(obstacle);
  timeUntilObstacle = timeObstacleMin + Math.random() * (timeObstacleMax - timeObstacleMin) / gameVel;
}

function createCloud() {
  var cloud = document.createElement("div");
  container.appendChild(cloud);
  cloud.classList.add("nube");
  cloud.posX = container.clientWidth;
  cloud.style.left = container.clientWidth + "px";
  cloud.style.bottom = minCloudY + Math.random() * (maxCloudY - minCloudY) + "px";

  clouds.push(cloud);
  timeUntilCloud = timeCloudMin + Math.random() * (timeCloudMax - timeCloudMin) / gameVel;
}

function moveObstacles() {
  for (var i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].posX < -obstacles[i].clientWidth) {
      obstacles[i].parentNode.removeChild(obstacles[i]);
      obstacles.splice(i, 1);
      earnPoints();
    } else {
      obstacles[i].posX -= calculateDisplacement();
      obstacles[i].style.left = obstacles[i].posX + "px";
    }
  }
}

function moveClouds() {
  for (var i = clouds.length - 1; i >= 0; i--) {
    if (clouds[i].posX < -clouds[i].clientWidth) {
      clouds[i].parentNode.removeChild(clouds[i]);
      clouds.splice(i, 1);
    } else {
      clouds[i].posX -= calculateDisplacement() * velCloud;
      clouds[i].style.left = clouds[i].posX + "px";
    }
  }
}

function earnPoints() {
  score++;
  textScore.innerText = score;
  if (score == 5) {
    gameVel = 1.5;
    container.classList.add("mediodia");
  } else if (score == 10) {
    gameVel = 2;
    container.classList.add("tarde");
  } else if (score == 20) {
    gameVel = 3;
    container.classList.add("noche");
  }
  ground.style.animationDuration = (3 / gameVel) + "s";
}

function gameOver() {
  crash();
  gameOverElem.style.display = "block";
  textScore.style.display = "none";
  document.getElementById("refresh").style.display = "inline-block";
  document.querySelector(".game-over-container").style.display = "block";
  document.querySelector(".final-score").textContent = "Puntuación obtenida: " + score;
}

function detectCollision() {
  for (var i = 0; i < obstacles.length; i++) {
    if (obstacles[i].posX > dinoPosX + dino.clientWidth) {
      //EVADE
      break; //al estar en orden, no puede chocar con más
    } else {
      if (isCollision(dino, obstacles[i], 10, 30, 15, 20)) {
        gameOver();
      }
    }
  }
}

function isCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
    ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
    (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
    ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
    (aRect.left + paddingLeft > (bRect.left + bRect.width))
  );
}

let refresh = document.getElementById('refresh');
refresh.addEventListener('click', _ => {
  location.reload();
})