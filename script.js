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
boundaries.forEach((boundary) => {
    boundary.draw();
})