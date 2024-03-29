/******************CANVAS CREATION SECTION *********************************** */
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');


context.scale(20, 20);

 function arenaSweep() { //this function establishes when a whole row of tetris has been filled/completed
    let rowCount = 1;
    outer: for(let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if(arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *=2;
    }
 }  

/******************************************************************************** */
function collide(arena, player) { //checks if there is a collision between the arena & player!
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}           

/***********************IMPLEMENTING COLLISIONS & ADDING MULTIPLE PIECES WHEN COLLISION HAPPENS********** */
function createMatrix(w, h) {
    const matrix = [];
    while(h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

/******************************************************************************** */
/********************PUZZLE PIECE STYLING SECTION************************************* */
/*styling puzzle pieces --- 1.matrix contains the piece/ 2.' [] ' defines a row/3. number define 
if need to draw something or not*/
function createPiece (type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {    
        return [
            [0, 2, 0],        //instead of using 1's allround we use different numbers to identify diffrent colours for each different shape 
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === '0') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
    row.forEach((value, x) => {
        if (value !== 0) {
            context.fillStyle = colours[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
    });
    });
};

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}
/**************************************************************************** */
/******************'React to user key's section**************************** */

function merge(arena, player) { //merge function puts the last position of the piece on the arena, so that we maintain the status of the pieces that have been played previously
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//************************** */ENABLING ROTATION SECTION******************************************************

function rotate(matrix, dir) {
    for(let y = 0; y < matrix.length; ++y) {
        for(let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if(dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {  //this block says if piece collides with edge of arena then move it back one 
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;  
        merge(arena, player); // basically we imprint the player on the arena we already had and reset the player
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if(collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
	player.matrix = createPiece('T');
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        resetGame();
    }
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.level = 0;
    dropInterval = 1000;
    updateScore();
}

function playerRotate(dir) {  //ensures pieces do not collide with canvas edge due to rotation
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    while(collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
/**************************************************************************** */

/***************************************************************************** */
let dropCounter = 0;
let dropInterval = 1000;
let levelSize = 100;
let levelSpeedIncrease = 100;

let lastTime = 0;

function update(time = 0) { // here were calling this update function which will take time '0'.
    const deltaTime = time - lastTime;

    dropCounter += deltaTime; // basically checking how much time has passed & if pass a certain interval...
    if(dropCounter > dropInterval) { //then we update the player pos and reset the dropCounter
        playerDrop();
    }

    lastTime = time;
    draw();           // this will enable drawing 

    requestAnimationFrame(update); //this is a function call
}

function updateScore() {
    if(player.score - levelSize * player.level > levelSize) {
        player.level++;
        dropInterval -= levelSpeedIncrease;
    }
    document.getElementById('score').innerText = 'Score: ' + player.score;
    document.getElementById('level').innerText = 'Level: ' + player.level;

}
/******************'React to user key's section.2**************************** */
document.addEventListener('keydown', event => {
    if(event.keyCode === 37) {
        playerMove(-1);
    }else if (event.keyCode === 39) {
        playerMove(1);
    }else if(event.keyCode === 40) {
        playerDrop();
    } else if(event.keyCode === 81) {
        playerRotate(-1);
    } else if(event.keyCode === 87) {
        playerRotate(1);
    }
})
/***************************************************************************** */
const colours = [
    null,
    'purple',
    'yellow',
    'orange',
    'blue',
    'aqua',
    'green',
    'red',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 5, y: 3},
    matrix: null,
    score: 0,
    level: 0,
};

playerReset();
updateScore();
update();













