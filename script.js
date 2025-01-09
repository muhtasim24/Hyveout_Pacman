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
const map = [
    ['-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-'],

]

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

function animate() {
    // when we finsih one frame, its going to call this animate function
    // creates infinite loop till we tell it to stop
    requestAnimationFrame(animate);
    boundaries.forEach((boundary) => {
        boundary.draw();
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
            player.velocity.y = -5
            break
        // Move Left with A
        case 'a':
            player.velocity.x = -5
            break
        // Move Down with S
        case 's':
            player.velocity.y = 5
            break
        // Move Right with D
        case 'd':
            player.velocity.x = 5
            break
    }
    console.log(player.velocity)
})