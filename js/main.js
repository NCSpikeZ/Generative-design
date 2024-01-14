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
// --- TWEAKPANE
initPanel(options, poster);

// --- 2D DRAW
const keys = {
  z: { pressed: false },
  q: { pressed: false },
  d: { pressed: false },
};

const SPEED = 3; // Vitesse du joueur
const ROTATE_SPEED = 0.05; // Vitesse de rotation
const FRICTION = 0.98; // Friction pour décélérer progressivement
const PROJECTILE_SPEED = 4; // Vitesse projectile


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
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
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

const projectiles = [];

const draw = async (options) => {
  const ctx = options.ctx;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, poster.innerWidth, poster.innerHeight);

  player.draw(ctx);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.draw(ctx);
  }
};

const animate = () => {
  const ctx = poster.ctx;

  player.update(ctx);
  
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update(ctx);

    // supprimer de l'array quand en dehors de l'écran
    if (
      projectile.position.x + projectile.radius < 0 || 
      projectile.position.x - projectile.radius > poster.innerWidth ||
      projectile.position.y - projectile.radius > poster.innerHeight ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }    
  }

  poster.draw(ctx);
  raf(animate);
};

window.addEventListener('keydown', (event) => {
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
      console.log({ res })
      projectiles.push(
        new Projectile(res)
      );
      console.log({ projectiles })
      break;
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

poster.setInfos(options.projectTitle, options.firstname, options.lastname, options.schoolClass);
poster.setDrawing(draw);
animate();
