
const draw = async ( options ) => {
      update(){
        this.draw()
        console.log(this.position.x)
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
      }
    }

    class Projectile {
      constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 5 // taille projectile
      }

      draw(){
        options.ctx.beginPath()
        options.ctx.arc(
          this.position.x,
          this.position.y,
          this.radius,
          0,
          Math.PI * 2,
          false
        )
        options.ctx.closePath()
        options.ctx.fillStyle = 'white'
        options.ctx.fill()
      }

      update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
      }
    }

    function animate() {
      window.requestAnimationFrame(animate)
      options.ctx.fillStyle = 'black';
      options.ctx.fillRect(0, 0, poster.innerWidth, poster.innerHeight)

      player.update()

      for (let i = projectiles.length - 1; i >= 0; i--){
        const projectile = projectiles[i]
        projectile.update()

        // if (projectile.position.x + projectile.radius)
      }

      if (keys.w.pressed) {
        player.velocity.x = Math.cos(player.rotation) * SPEED
        player.velocity.y = Math.sin(player.rotation) * SPEED 
      } else if (!keys.w.pressed) {
        player.velocity.x *= FRICTION // Pour decelerer de maniére progressive
        player.velocity.y *= FRICTION
      }

      if(keys.d.pressed) player.rotation += ROTATE_SPEED
      else if (keys.a.pressed) player.rotation -= ROTATE_SPEED
    }

    animate()

    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'KeyW':
          keys.w.pressed = true
          break
        case 'KeyA':
          keys.a.pressed = true
          break
        case 'KeyD':
          keys.d.pressed = true
          break
        case 'Space':
          projectiles.push(
            new Projectile({
              position: {
                x: player.position.x + Math.cos(player.rotation) * 30, // pour tirer depuis le bout du vaisseau
                y: player.position.y + Math.sin(player.rotation) * 30
              },
              velocity: {
                x: Math.cos(player.rotation) * PROJECTILE_SPEED, // direction du tire + vitesse
                y: Math.sin(player.rotation) * PROJECTILE_SPEED,
              }
            })
          )
          console.log({ projectiles })
          break
      }
    })

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'KeyW':
          keys.w.pressed = false
          break
        case 'KeyA':
          keys.a.pressed = false
          break
        case 'KeyD':
          keys.d.pressed = false
          break
      }
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




