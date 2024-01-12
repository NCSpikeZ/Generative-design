import { rand, getRandomItem, clamp, shuffleArray } from './tools/math.js';
import { Poster } from './components/Poster.js';
import { initPanel } from './components/Panel.js';
import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';

console.clear();

// --- OPTIONS
const poster = new Poster( { context: '2d' } ),
// const poster = new Poster( { context: '3d', rendererOptions: { alpha: true } } ),
      width = poster.innerWidth,
      height = poster.innerHeight,
      raf = window.requestAnimationFrame,
      cancelRaf = window.cancelAnimationFrame,
      options = {
        firstname: 'Nicolas',
        lastname: 'Coopman',
        projectTitle: 'Generative design arcade game',
        schoolClass: 'B3G',
        fullScreen: false,
    };

// --- TWEAKPANE
initPanel( options, poster );

// --- 2D DRAW
// Votre jeu de particule ici

const draw = async ( options ) => {
    console.log(options);
      
    class Player {
      constructor({ position, velocity }) {
        this.position = position // {x, y}
        this.velocity = velocity 
      }
    
      draw() {
        options.ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false)
        options.ctx.fillStyle= 'red'
        options.ctx.fill()

        options.ctx.beginPath()
        options.ctx.moveTo(this.position.x + 30, this.position.y)
        options.ctx.lineTo(this.position.x - 10, this.position.y - 10)
        options.ctx.lineTo(this.position.x - 10, this.position.y + 10)
        options.ctx.closePath()

        options.ctx.strokeStyle= 'white',
        options.ctx.stroke()
      }

      update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        console.log(this.position.x)
      }
    }
    
    const player = new Player({
      position: { x: poster.innerWidth / 2, y:poster.innerHeight / 2 },
      velocity: { x: 0, y:0},
    })
    
    const keys = {
      w: {
        pressed: false,
      },
    }

    function animate() {
      window.requestAnimationFrame(animate)
      options.ctx.fillStyle = 'black';
      options.ctx.fillRect(0, 0, poster.innerWidth, poster.innerHeight)

      player.update()

      if (keys.w.pressed) player.velocity.x = 1
    }

    animate()

    window.addEventListener('keydown', (event) => {
      switch (event.code) {
      case 'KeyW':
        keys.w.pressed = true
        break
      case 'KeyA':
        break
      case 'KeyS':
        break
      case 'KeyD':
        break
      }
      console.log(event)
    })
    return;
};

// --- 3D DRAW
// const draw = async ( options ) => {
//     console.log(options);

//     const geo = new THREE.BoxGeometry(3,3,3);
//     const mat = new THREE.MeshBasicMaterial({color: 'dodgerblue' });
//     const shape = new THREE.Mesh( geo, mat);
//     options.canvas.scene.add( shape );

//     return options.canvas.renderer.render( options.canvas.scene, options.canvas.camera);
// };

// --- TWEAKPANE
poster.setInfos( options.projectTitle, options.firstname, options.lastname, options.schoolClass );
poster.setDrawing( draw );
poster.draw();




