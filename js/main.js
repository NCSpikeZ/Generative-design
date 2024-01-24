import { Poster } from './components/Poster.js';
import { initPanel } from './components/Panel.js';
import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

console.clear();

// --- OPTIONS
const poster = new Poster({ context: '2d' }),
  width = poster.innerWidth,
  height = poster.innerHeight,
  raf = window.requestAnimationFrame,
  options = {
    firstname: 'Nicolas',
    lastname: 'Coopman',
    projectTitle: 'Generative design arcade game',
    schoolClass: 'B3G',
    fullScreen: false,
  };
let highScores = [];
loadHighScores();

// --- TWEAKPANE
initPanel(options, poster);

// --- 2D DRAW
const keys = {
  z: { pressed: false },
  q: { pressed: false },
  d: { pressed: false },
};

var myFont = new FontFace('PressStart2P-Regular', 'url(./css/PressStart2P-Regular.ttf)');
myFont.load().then(function(font){

  document.fonts.add(font);
});

const SPEED = 2; // Vitesse du joueur
const ROTATE_SPEED = 0.05; // Vitesse de rotation
const FRICTION = 0.98; // Friction pour décélérer progressivement
const PROJECTILE_SPEED = 4; // Vitesse projectile
const projectileCooldown = 300; // Cooldown tirelet
let lastProjectileTime = 0;
const maxHighScores = 5; // Highscore
const backgroundOffset = { x: 0, y: 0 };

let gameStartTime;
let SpawnInterval = 1500; // Cooldown apparition asteroid
let elapsedTimeInSeconds = 0;
let gameOver = false; // GAME OVER 
let score = 0; // Scoring


function displayScore(ctx) {
  ctx.fillStyle = 'white';
  ctx.font = '14px PressStart2P-Regular';
  ctx.fillText('Score: ' + score, 40, 30);

  const timerX = poster.innerWidth - 150;
  const timerY = 30;
  if (gameStartTime) {
    const currentTime = Date.now();
    elapsedTimeInSeconds = Math.floor((currentTime - gameStartTime) / 1000);
    const timerText = `Time: ${elapsedTimeInSeconds}s`;
    ctx.fillText(timerText, timerX, timerY);
  }
}

function askForName() {
  let playerName;
  do {
    playerName = prompt('Game over! Enter your name for the high score:');
  } while (!playerName || playerName.trim() === '');

  return playerName || 'Anonymous';
}

function updateHighScores() {
  const playerName = askForName();
  const runData = {
  asteroidsBroken: score / 10,
  };
  highScores.push({ name: playerName, score, runData });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, maxHighScores);
  saveHighScores();
}

function displayHighScores(ctx) {
  ctx.fillStyle = 'white';
  ctx.font = '12px Press Start 2P';
  ctx.textAlign = 'center';

  const titleY = poster.innerHeight / 2;
  const lineHeight = 30;

  ctx.fillText('High Scores:', poster.innerWidth / 2, titleY);

  for (let i = 0; i < highScores.length; i++) {
    const entry = highScores[i];

    const entryText = `${entry.name}: Score ${entry.score}`;
    const entryY = titleY + lineHeight * (i + 1);

    const entryX = poster.innerWidth / 2;

    ctx.fillText(entryText, entryX, entryY);
  }

  const lastScore = highScores[0];
  let additionalLineY = titleY + lineHeight * (highScores.length + 2);

  if (lastScore) {
    const additionalLine = `You spent ${elapsedTimeInSeconds} seconds alive`;
    const additionalLine2= `and destroyed ${lastScore.runData.asteroidsBroken} asteroids!`;

    ctx.textBaseline = "top";
    const nextLineY = additionalLineY + lineHeight;

    ctx.fillText(additionalLine, poster.innerWidth / 2, additionalLineY);
    ctx.fillText(additionalLine2, poster.innerWidth / 2, nextLineY);
  }
  const image = new Image();
  image.src = './css/spaceparanoids.png';
  image.onload = () => {
    const desiredImageWidth = 200;
    const desiredImageHeight = 200;
    const imageX = poster.innerWidth / 2 - desiredImageWidth / 2;
    const imageY = additionalLineY - desiredImageWidth - 220; 
    ctx.drawImage(image, imageX, imageY, desiredImageWidth, desiredImageHeight);
  };
  ctx.textAlign = 'left';
}

function saveHighScores() {
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function loadHighScores() {
  const storedHighScores = localStorage.getItem('highScores');
  if (storedHighScores) {
    highScores = JSON.parse(storedHighScores);
  }
}

class Player {
  constructor({ position, velocity, rotation }) {
    this.position = position;
    this.velocity = velocity;
    this.rotation = rotation;
  }

  update() {
    if (keys.z.pressed) {
      this.velocity.x = Math.cos(this.rotation) * SPEED;
      this.velocity.y = Math.sin(this.rotation) * SPEED;
    } else if (!keys.z.pressed) {
      this.velocity.x *= FRICTION;
      this.velocity.y *= FRICTION;
    }

    if (keys.d.pressed) this.rotation += ROTATE_SPEED;
    else if (keys.q.pressed) this.rotation -= ROTATE_SPEED;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > poster.innerWidth) this.position.x = poster.innerWidth;
    if (this.position.y < 0) this.position.y = 0;
    if (this.position.y > poster.innerHeight) this.position.y = poster.innerHeight;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
  }

  getVertices() {
    const cos = Math.cos(this.rotation)
    const sin = Math.sin(this.rotation)

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ]
  }
}

const player = new Player({
  position: { x: poster.innerWidth * 0.5, y: poster.innerHeight * 0.5 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
});

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5; // taille projectile
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  constructor({ position, velocity, radius, health }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.health = health;
  }

  initRandomHealth() {
    this.health = Math.floor(Math.random() * 3) + 1;
  }

  hit() {
    this.health -= 1;
  }

  isDestroyed() {
    return this.health <= 0;
  }
  
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    if (this.health === 3) {
      ctx.strokeStyle = 'green';
    } else if (this.health === 2) {
      ctx.strokeStyle = 'yellow';
    } else {
      ctx.strokeStyle = 'red';
    }
    ctx.stroke();
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  split() {
    const newRadius = this.radius / 2;

    if (newRadius >= 15) {
      asteroids.push(new Asteroid({
        position: { x: this.position.x, y: this.position.y },
        velocity: { x: this.velocity.x, y: this.velocity.y },
        radius: newRadius,
        health: this.health - 1,
      }));

      asteroids.push(new Asteroid({
        position: { x: this.position.x, y: this.position.y },
        velocity: { x: -this.velocity.x, y: -this.velocity.y },
        radius: newRadius,
        health: this.health - 1,
      }));
    }
  }
}

const projectiles = [];
const asteroids = []

const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4)
  let x, y
  let vx, vy
  let radius = 50 * Math.random() + 10; // taille random asteroids minimum 10px

  switch (index) {
    case 0: //left side of the screen
      x = 0 - radius
      y = Math.random() * poster.innerHeight
      vx = 1
      vy = 0
      break
    case 1: //bottom side of the screen
      x = Math.random() * poster.innerWidth
      y = poster.innerHeight + radius
      vx = 0
      vy = -1
      break
    case 2: //right side of the screen
      x = poster.innerWidth + radius
      y = Math.random() * poster.innerHeight
      vx = -1
      vy = 0
      break
    case 3: //top side of the screen
      x = Math.random() * poster.innerWidth
      y = 0 - radius
      vx = 0
      vy = 1
      break
    case 4: // top-left diagonal
      x = 0 - radius;
      y = 0 - radius;
      vx = 1 / Math.sqrt(2);
      vy = 1 / Math.sqrt(2);
      break;
    case 5: // top-right diagonal
      x = poster.innerWidth + radius;
      y = 0 - radius;
      vx = -1 / Math.sqrt(2);
      vy = 1 / Math.sqrt(2);
      break;
    case 6: // bottom-left diagonal
      x = 0 - radius;
      y = poster.innerHeight + radius;
      vx = 1 / Math.sqrt(2);
      vy = -1 / Math.sqrt(2);
      break;
    case 7: // bottom-right diagonal
      x = poster.innerWidth + radius;
      y = poster.innerHeight + radius;
      vx = -1 / Math.sqrt(2);
      vy = -1 / Math.sqrt(2);
      break;
  }
  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  )
  asteroids[asteroids.length - 1].initRandomHealth();
}, SpawnInterval)

const maxElapsedTime = 5000;
let elapsedTime = 0;
let previousSpawnInterval = SpawnInterval;
const initialSpawnInterval = SpawnInterval;

function adjustSpawnInterval() {
  elapsedTime += initialSpawnInterval;

  if (SpawnInterval > 500 && elapsedTime >= maxElapsedTime) {
    SpawnInterval -= 100;
    elapsedTime = 0;
  }

  previousSpawnInterval = SpawnInterval;
}

window.setInterval(adjustSpawnInterval, initialSpawnInterval);

function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x
  const yDifference = circle2.position.y - circle1.position.y

  const distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference)

  if (distance <= circle1.radius + circle2.radius) {
    return true
  }
  return false
}

function circleTriangleCollision(circle, triangle) {
  for (let i = 0; i < 3; i++) {
    let start = triangle[i]
    let end = triangle[(i + 1) % 3]

    let dx = end.x - start.x
    let dy = end.y - start.y
    let length = Math.sqrt(dx * dx + dy * dy)

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2)

    let closestX = start.x + dot * dx
    let closestY = start.y + dot * dy

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x
      closestY = closestY < start.y ? start.y : end.y
    }

    dx = closestX - circle.position.x
    dy = closestY - circle.position.y

    let distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= circle.radius) {
      return true
    }
  }

  // No collision
  return false
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  )
}

const draw = async (options) => {
  const ctx = options.ctx;

  const backgroundX = -player.position.x + width / 2 + backgroundOffset.x;
  const backgroundY = -player.position.y + height / 2 + backgroundOffset.y;

  const startX = (backgroundX % backgroundImage.width) - backgroundImage.width;
  const startY = (backgroundY % backgroundImage.height) - backgroundImage.height;

  for (let x = startX; x < poster.innerWidth; x += backgroundImage.width) {
    for (let y = startY; y < poster.innerHeight; y += backgroundImage.height) {
      ctx.drawImage(backgroundImage, x, y, backgroundImage.width, backgroundImage.height);
    }
  }
  player.draw(ctx);

  for (let j = projectiles.length - 1; j >= 0; j--) {
    const projectile = projectiles[j];
    projectile.draw(ctx);
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.draw(ctx);
  }

  if (gameOver) {
    displayHighScores(ctx);
  } else {
    displayScore(ctx);
  }
};

const animate = () => {
  const ctx = poster.ctx;

  if (!gameOver) {
    if (!gameStartTime) {
      gameStartTime = Date.now();
    }
    player.update(ctx);
  
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];
      projectile.update(ctx);

      // supprimer de l'array quand en dehors de l'écran
      if (
        projectile.position.x + projectile.radius < 0 || 
        projectile.position.x - projectile.radius > poster.innerWidth ||
        projectile.position.y - projectile.radius > poster.innerHeight ||
        projectile.position.y + projectile.radius < 0
      ) {
        projectiles.splice(j, 1);
      }    
    }

    // asteroids management
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.update(ctx);

      if (circleTriangleCollision(asteroid, player.getVertices())) {
        playPlayerDestruction()
        console.log('GAME OVER')
        clearInterval(intervalId);
        gameOver = true;
        updateHighScores();
      }

      function playPlayerDestruction() {
        const explosionSound = 'explosionPlayer.wav';
        const explosionAudioPlayer = new Audio(explosionSound);
      
        explosionAudioPlayer.addEventListener('canplaythrough', () => {
          explosionAudioPlayer.play();
        });
      }      

      if (
        asteroid.position.x + asteroid.radius < 0 || 
        asteroid.position.x - asteroid.radius > poster.innerWidth ||
        asteroid.position.y - asteroid.radius > poster.innerHeight ||
        asteroid.position.y + asteroid.radius < 0
      ) {
        asteroids.splice(i, 1);
      }

      for (let j = projectiles.length - 1; j >= 0; j--) {
        const projectile = projectiles[j];
      
        for (let i = asteroids.length - 1; i >= 0; i--) {
          const asteroid = asteroids[i];
      
          if (circleCollision(asteroid, projectile)) {    
            if (asteroid.radius <= 30) {
              asteroid.hit();
            } else {
              asteroids.splice(i, 1);
              asteroid.split();;
            }
            if (asteroid.isDestroyed()) {
              asteroids.splice(i, 1);
              score += 10;
            }
            playRandomDestructionSound()
            projectiles.splice(j, 1);
          }
        }
      }
    }

    poster.draw(ctx);
    raf(animate);
  }
};

function playRandomDestructionSound() {
  const explosionSounds = ['explosion.wav', 'explosion1.wav'];
  const randomIndex = Math.floor(Math.random() * explosionSounds.length);
  const randomExplosionSound = explosionSounds[randomIndex];

  const explosionAudio = new Audio(randomExplosionSound);
  explosionAudio.play();
}

window.addEventListener('keydown', (event) => {
  const currentTime = Date.now();
  switch (event.key) {
    case 'z':
      keys.z.pressed = true;
      break;
    case 'q':
      keys.q.pressed = true;
      break;
    case 'd':
      keys.d.pressed = true;
      break;
    case ' ':
      event.preventDefault();
      if (currentTime - lastProjectileTime > projectileCooldown) {
        const res = {
          position: {
            x: player.position.x + Math.cos(player.rotation) * 30,
            y: player.position.y + Math.sin(player.rotation) * 30,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        }
        projectiles.push(
          new Projectile(res)
        );
        lastProjectileTime = currentTime;
        break;
      }
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'z':
      keys.z.pressed = false;
      break;
    case 'q':
      keys.q.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
  }
});

const backgroundImage = new Image();
backgroundImage.src = './css/giphy.webp';
poster.setInfos(options.projectTitle, options.firstname, options.lastname, options.schoolClass);
backgroundImage.onload = () => {
poster.setDrawing(draw);
animate();
};