const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d') // 

const scoreEl = document.querySelector('#scoreEl');

const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

const tileCount = map[0].length;
const maxTileSize = 40;
const tileSize = Math.min(Math.floor(window.innerWidth / tileCount), maxTileSize);

canvas.width = tileSize * tileCount;
canvas.height = tileSize * map.length;

class Boundary {
    static width = tileSize;
    static height = tileSize;
    constructor({ position, image }){
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }
    draw() { // drawing out our boundary
        // c.fillStyle = 'blue';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
    constructor( {position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0;
    }
    draw() {
        // drawing circle
        // need to begin path and close it 
        c.save()
        // handling rotation of pacman when moving in directions
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        // in the arc, we give x, y, radius, and its angles in radians, so we give 0 radians, and pi * 2, to give full circle
        c.arc(this.position.x, this.position.y, this.radius, this.radians , Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y) // opens up face look like mouth, chomping animation
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }
    // call this update function for every frame in an animation loop
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // switching radians from 0 to 0.75 to look like chomping animation
        if (this.radians < 0 || this.radians > 0.75) {
          this.openRate = -this.openRate
        }
        this.radians += this.openRate

    }
}

class Ghost {
  static speed = 2; // static speed for when creating that very first new ghost
  constructor( {position, velocity, color = 'red'}) {
      this.position = position
      this.velocity = velocity
      this.radius = 15
      this.color = color
      this.prevCollisions = [] // list of previous collisions, so when a path opens up, ghost can go through it
      this.speed = 2;
      this.scared = false
  }
  draw() {
      // drawing circle
      // need to begin path and close it 
      c.beginPath()
      // in the arc, we give x, y, radius, and its angles in radians, so we give 0 radians, and pi * 2, to give full circle
      c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
      c.fillStyle = this.scared ? 'blue' : this.color // if the ghosts are scared they will be blue, if not normal
      c.fill()
      c.closePath()
  }
  // call this update function for every frame in an animation loop
  update() {
      this.draw()
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
  }
}

class Pellet {
    constructor( { position }) {
        this.position = position
        this.radius = 3
    }
    draw() {
        // drawing circle
        // need to begin path and close it 
        c.beginPath()
        // in the arc, we give x, y, radius, and its angles in radians, so we give 0 radians, and pi * 2, to give full circle
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class PowerUp {
  constructor( { position }) {
      this.position = position
      this.radius = 10
  }
  draw() {
      // drawing circle
      // need to begin path and close it 
      c.beginPath()
      // in the arc, we give x, y, radius, and its angles in radians, so we give 0 radians, and pi * 2, to give full circle
      c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
      c.fillStyle = 'white'
      c.fill()
      c.closePath()
  }
}

const powerUps = [];
const pellets = [];
// creating a representation of what the map should look like
// everytime I loop over a dash, i want to generate a new square
const boundaries = [];
const ghosts = [
  new Ghost( {
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    }
  }),
  new Ghost( {
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 3 + Boundary.height / 2
    },
    velocity: {
      x: Ghost.speed,
      y: 0
    },
    color: 'pink'
  }),
]

// create our player instance
const player = new Player( {
    position: {
        // make the position halfway of boundaries so we arent 
        // on top of a boundary
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = ''
let score = 0;

function createImage(source) {
    const image = new Image()
    image.src = source
    image.classList.add('image');
    return image
}
// b= block, 1-4 = corner 1-4, | = vertical lines, - = horizontal lines
  
  // Additional cases (does not include the power up pellet that's inserted later in the vid)
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeHorizontal.png')
              
            })
          )
          break
        case '|':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeVertical.png')
            })
          )
          break
        case '1':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeCorner1.png')
            })
          )
          break
        case '2':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeCorner2.png')
            })
          )
          break
        case '3':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeCorner3.png')
            })
          )
          break
        case '4':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/pipeCorner4.png')
            })
          )
          break
        case 'b':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./assets/block.png')
            })
          )
          break
        case '[':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/capLeft.png')
            })
          )
          break
        case ']':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/capRight.png')
            })
          )
          break
        case '_':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/capBottom.png')
            })
          )
          break
        case '^':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/capTop.png')
            })
          )
          break
        case '+':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/pipeCross.png')
            })
          )
          break
        case '5':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./assets/pipeConnectorTop.png')
            })
          )
          break
        case '6':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./assets/pipeConnectorRight.png')
            })
          )
          break
        case '7':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./assets/pipeConnectorBottom.png')
            })
          )
          break
        case '8':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./assets/pipeConnectorLeft.png')
            })
          )
          break
        case '.':
            pellets.push(
                new Pellet({
                position: {
                    x: j * Boundary.width + Boundary.width / 2,
                    y: i * Boundary.height + Boundary.height / 2
                }
                })
            )
            break
        case 'p':
          powerUps.push(
              new PowerUp({
              position: {
                  x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2
              }
              })
          )
          break
      }
    })
  })

function circleCollidesWithRectangle( {circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
      circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
      circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
      circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
      circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
  )
}

let animationId;

function animate() {
    // when we finsih one frame, its going to call this animate function
    // creates infinite loop till we tell it to stop
    animationId = requestAnimationFrame(animate);
    // we want to clear the canvas, so we arent leaving behind a trail and drawing a player on each frame, but instead drawing new at each canvasw
    c.clearRect(0, 0, canvas.width, canvas.height);


    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                circleCollidesWithRectangle({
                circle: {
                    ...player, 
                    velocity: { // duplicating our player object, so we can edit the property
                    x: 0,
                    y: -5,
                }
            }, 
            rectangle: boundary
            })
            ) {
                player.velocity.y = 0;
                break;
            } else {
                player.velocity.y = -5;
            }
        }
        } else if (keys.a.pressed && lastKey === 'a') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i];
                if (
                    circleCollidesWithRectangle({
                    circle: {
                        ...player, 
                        velocity: { // duplicating our player object, so we can edit the property
                        x: -5,
                        y: 0,
                    }
                }, 
                rectangle: boundary
                })
                ) {
                    player.velocity.x = 0;
                    break;
                } else {
                    player.velocity.x = -5;
                }
            }
        } else if (keys.s.pressed && lastKey === 's') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i];
                if (
                    circleCollidesWithRectangle({
                    circle: {
                        ...player, 
                        velocity: { // duplicating our player object, so we can edit the property
                        x: 0,
                        y: 5,
                    }
                }, 
                rectangle: boundary
                })
                ) {
                    player.velocity.y = 0;
                    break;
                } else {
                    player.velocity.y = 5;
                }
            }
        } else if (keys.d.pressed && lastKey === 'd') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i];
                if (
                    circleCollidesWithRectangle({
                    circle: {
                        ...player, 
                        velocity: { // duplicating our player object, so we can edit the property
                        x: 5,
                        y: 0,
                    }
                }, 
                rectangle: boundary
                })
                ) {
                    player.velocity.x = 0;
                    break;
                } else {
                    player.velocity.x = 5;
                }
            }
        }
        
    // Ghost-Player Collision
    for (let i = ghosts.length - 1; 0 <= i; i--) {
      const ghost = ghosts[i]
      // collision with player
      if (Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y) <
        ghost.radius + player.radius) {

        if (ghost.scared) {
          ghosts.splice(i, 1); // if we collide with the ghost while its scared, remove it
        } else {
          cancelAnimationFrame(animationId)
          console.log('you lose');
        }
      }
    }

    // Power Up Collision
    for (let i = powerUps.length - 1; 0 <= i; i--) {
      const powerUp = powerUps[i]
      powerUp.draw();
      // where player collides with powerup
      if (Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y) <
        powerUp.radius + player.radius) {
          
          powerUps.splice(i, 1);
          // make ghosts scared 
          ghosts.forEach( (ghost) => {
            ghost.scared = true
            // set a timer for how long the power up is active
            setTimeout( () => { 
              ghost.scared = false
              console.log(ghost.scared)
            }, 5000) // after 3 seconds, ghosts will no longer be scared
          })
      }
    }

    // Pellet Collision
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()
        
        // calculating if they are colliding
        if (Math.hypot(
            pellet.position.x - player.position.x,
            pellet.position.y - player.position.y) <
            pellet.radius + player.radius) {
                pellets.splice(i, 1) // removing pellet of that index
                score += 10;
                scoreEl.innerHTML = score;
        }
    }

    // Win Condition
    if (pellets.length === 0) {
      cancelAnimationFrame(animationId)
      console.log('you win')
    }

    boundaries.forEach((boundary) => {
        boundary.draw();
        
        // checking if the top of the player is colliding with the bottom of a boundary
        // checking if right side of the player collding with right side of boundary
        // checking if bottom of player collides with top of boundary
        // checking if left side of boundary collides with left side boundary

        // including velocity in our checks, so we can allow movemenet after colliding
        if (circleCollidesWithRectangle({
            circle: player, 
            rectangle: boundary
        })) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })
    
    player.update()

    // GHOST COLLISION
    ghosts.forEach( (ghost) => {
      ghost.update();
      
      const collisions = []
      // detect for collision for every single boundary for the ghost
      boundaries.forEach( (boundary) => {
        if (
          !collisions.includes('right') &&
          circleCollidesWithRectangle({
          circle: {
              ...ghost, 
              velocity: { // duplicating our player object, so we can edit the property
              x: ghost.speed,
              y: 0,
          }
          }, 
          rectangle: boundary
          })
        ) {
          collisions.push('right')
        }
        if (
          !collisions.includes('left') &&
          circleCollidesWithRectangle({
          circle: {
              ...ghost, 
              velocity: { // duplicating our player object, so we can edit the property
              x: -ghost.speed,
              y: 0,
          }
          }, 
          rectangle: boundary
          })
        ) {
          collisions.push('left')
        }
        if (
          !collisions.includes('up') &&
          circleCollidesWithRectangle({
          circle: {
              ...ghost, 
              velocity: { // duplicating our player object, so we can edit the property
              x: 0,
              y: -ghost.speed,
          }
          }, 
          rectangle: boundary
          })
        ) {
          collisions.push('up')
        }
        if (
          !collisions.includes('down') &&
          circleCollidesWithRectangle({
          circle: {
              ...ghost, 
              velocity: { // duplicating our player object, so we can edit the property
              x: 0,
              y: ghost.speed,
          }
          }, 
          rectangle: boundary
          })
        ) {
          collisions.push('down')
        }
      })
      if (collisions.length > ghost.prevCollisions.length) {
        ghost.prevCollisions = collisions
      }
      // strignify is going to change collisions array into a string
      // this handles finding an open path
      if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
        if (ghost.velocity.x > 0) {
          ghost.prevCollisions.push('right')
        } else if (ghost.velocity.x < 0) {
          ghost.prevCollisions.push('left')
        } else if (ghost.velocity.y < 0) {
          ghost.prevCollisions.push('up')
        } else if (ghost.velocity.y > 0) {
          ghost.prevCollisions.push('down')
        }
        
        // filter out any collisions that dont exist with the first array
        const pathways = ghost.prevCollisions.filter((collision) => {
          return !collisions.includes(collision)
        })
      
        
        // get a random direction for the ghost to go
        // needs to be a whole number, so we use Math.floor to round
        const direction = pathways[Math.floor(Math.random() * pathways.length)] 

        switch (direction) {
          case 'down':
            ghost.velocity.y = ghost.speed;
            ghost.velocity.x = 0;
            break;
          
          case 'up':
            ghost.velocity.y = -ghost.speed;
            ghost.velocity.x = 0;
            break;
          
          case 'right':
            ghost.velocity.y = 0;
            ghost.velocity.x = ghost.speed;
            break;
          
          case 'left':
            ghost.velocity.y = 0;
            ghost.velocity.x = -ghost.speed;
            break;
        }

        ghost.prevCollisions = [] // reset the collisions, since once the ghost moves new direction, we have a whole net set of collisions
      }
    })
    // changing rotation of pacman based on direction its moving
    if (player.velocity.x > 0) {
      player.rotation = 0
    } else if (player.velocity.x < 0) {
      player.rotation = Math.PI
    } else if (player.velocity.y > 0) {
      player.rotation = Math.PI / 2
    } else if (player.velocity.y < 0) {
      player.rotation = Math.PI * 1.5
    }
}

animate();


// adding event listeners to move player
// destructure key, cause we only care about that object
// if we put in event we will see an object
window.addEventListener('keydown', ({ key }) => {
    switch (key) {
        // Move Up with W
        case 'w':
            keys.w.pressed = true
            lastKey = 'w';
            break
        // Move Left with A
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a'
            break
        // Move Down with S
        case 's':
            keys.s.pressed = true;
            lastKey = 's'
            break
        // Move Right with D
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd'
            break
    }

})

window.addEventListener('keyup', ({ key }) => {
    switch (key) {
        // Move Up with W
        case 'w':
            keys.w.pressed = false
            break
        // Move Left with A
        case 'a':
            keys.a.pressed = false
            break
        // Move Down with S
        case 's':
            keys.s.pressed = false
            break
        // Move Right with D
        case 'd':
            keys.d.pressed = false
            break
    }
})

// Add event listeners to buttons to simulate key press behavior
document.getElementById('w').addEventListener('mousedown', () => {
  keys.w.pressed = true;
  lastKey = 'w';
});

document.getElementById('a').addEventListener('mousedown', () => {
  keys.a.pressed = true;
  lastKey = 'a';
});

document.getElementById('s').addEventListener('mousedown', () => {
  keys.s.pressed = true;
  lastKey = 's';
});

document.getElementById('d').addEventListener('mousedown', () => {
  keys.d.pressed = true;
  lastKey = 'd';
});

// Same logic for when buttons are released (mouseup)
document.getElementById('w').addEventListener('mouseup', () => {
  keys.w.pressed = false;
});

document.getElementById('a').addEventListener('mouseup', () => {
  keys.a.pressed = false;
});

document.getElementById('s').addEventListener('mouseup', () => {
  keys.s.pressed = false;
});

document.getElementById('d').addEventListener('mouseup', () => {
  keys.d.pressed = false;
});

document.getElementById('w').addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents mobile default behavior
  keys.w.pressed = true;
  lastKey = 'w';
});
document.getElementById('a').addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.a.pressed = true;
  lastKey = 'a';
});
document.getElementById('s').addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.s.pressed = true;
  lastKey = 's';
});
document.getElementById('d').addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.d.pressed = true;
  lastKey = 'd';
});

// On touch end, reset the pressed state
document.getElementById('w').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.w.pressed = false;
});
document.getElementById('a').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.a.pressed = false;
});
document.getElementById('s').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.s.pressed = false;
});
document.getElementById('d').addEventListener('touchend', (e) => {
  e.preventDefault();
  keys.d.pressed = false;
});
