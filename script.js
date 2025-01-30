const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d') // 

canvas.width = window.innerWidth // size of the window's width
canvas.height = window.innerHeight // size of the window's height

class Boundary {
    static width = 40;
    static height = 40;
    constructor({ position }){
        this.position = position;
        this.width = 40;
        this.height = 40;
    }
    draw() { // drawing out our boundary
        c.fillStyle = 'blue';
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Player {
    constructor( {position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
    }
    draw() {
        // drawing circle
        // need to begin path and close it 
        c.beginPath()
        // in the arc, we give x, y, radius, and its angles in radians, so we give 0 radians, and pi * 2, to give full circle
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
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

// creating a representation of what the map should look like
// everytime I loop over a dash, i want to generate a new square

const boundaries = []
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

const map = [
    ['-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-'],

]

// for each row in the map
map.forEach( (row, rowIndex) => {
    // for each symbol in the the row
    row.forEach( (symbol, colIndex) => {
        // want to switch the out the symbol
        switch (symbol) {
            // if we have a dash, we create a boundary
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * colIndex,
                            y: Boundary.height * rowIndex
                        }
                    })
                )
        }
    })
})

function circleCollidesWithRectangle( {circle, rectangle }) {
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width
    )
}

function animate() {
    // when we finsih one frame, its going to call this animate function
    // creates infinite loop till we tell it to stop
    requestAnimationFrame(animate);
    
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
    console.log(keys.d.pressed)
    console.log(keys.s.pressed)

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
    console.log(keys.d.pressed)
    console.log(keys.s.pressed)
})