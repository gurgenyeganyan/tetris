const gameCont = document.getElementById("game-container"),
    leftB = document.getElementById("left"),
    rightB = document.getElementById("right"),
    downB = document.getElementById("down"),
    qB = document.getElementById("l-rot"),
    eB = document.getElementById("r-rot"),
    pauseB = document.getElementById("pause"),
    restartB = document.getElementById("restart"),
    scoreDiv = document.getElementById("score"),
    levelDiv = document.getElementById("level"),
    linesDiv = document.getElementById("lines"),
    hsdiv = document.getElementById("highscores"),
    messageBox = document.getElementById("message-box"),
    side = document.getElementById("side"),
    controls = document.getElementById("controls");

let activeCellColor = "#353638",
    inactiveCellColor = "#837c7c";

const tetroes = [
    {
        name: 'l',
        states: [
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ],
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ]
        ]
    },
    {
        name: 'j',
        states: [
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]
            ],
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]
            ]
        ]
    },
    {
        name: "s",
        states: [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1]
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0]
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0]
            ],
        ]
    },
    {
        name: "z",
        states: [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0]
            ]
        ]
    },
    {
        name: "t",
        states: [
            [
                [0, 0, 0,],
                [1, 1, 1,],
                [0, 1, 0,]
            ],
            [
                [0, 1, 0,],
                [1, 1, 0,],
                [0, 1, 0,]
            ],
            [
                [0, 1, 0,],
                [1, 1, 1,],
                [0, 0, 0,]
            ],
            [
                [0, 1, 0,],
                [0, 1, 1,],
                [0, 1, 0,]
            ]
        ]
    },
    {
        name: "o",
        states: [
            [
                [1, 1],
                [1, 1]
            ]
        ]
    },
    {
        name: "i",
        states: [
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0]
            ],
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ],
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        ]
    }
];

let gameLevel = 1,
    gameSpeed = 1000,
    gameScore = 0,
    linesCleared = 0,
    sessionHighscores = [],
    isPaused = false,
    isGameOver = false,
    isLastBreath = false,
    lastBreathTimeout,
    fieldState,
    propagate;



let currentTetro = {
    state: 0,
    states: 0,
    coords: {
        x: 0,
        y: 0
    },
    name: "",
    lowest() {
        return this.coords.y + determineHeight(this.state);
    },
    highest() {
        return this.coords.y + determinePeak(this.state);
    },
    leftmost() {
        return this.coords.x + determineEdges(this.state, true);
    },
    rightmost() {
        return this.coords.x + determineEdges(this.state, false);
    }
};

let proposedTetro = {
    state: 0,
    lowest() {
        return currentTetro.coords.y + determineHeight(this.state);
    },
    highest() {
        return currentTetro.coords.y + determinePeak(this.state);
    },
    leftmost() {
        return currentTetro.coords.x + determineEdges(this.state, true);
    },
    rightmost() {
        return currentTetro.coords.x + determineEdges(this.state, false);
    }
};

function resetGlobals() {
    gameLevel = 1;
    gameSpeed = 1000;
    gameScore = 0;
    linesCleared = 0;
    isPaused = false;
    isGameOver = false;
}

function resetFieldState() {
    fieldState = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ];
}

function initialDraw() {
    for(let i = 0; i < 4; i++) {
        const row = document.createElement('div');
        row.id = `pre-${i}`;
        row.classList.add("js-row");
        for(let j = 0; j < 4; j++) {
            const cell = document.createElement("div");
            cell.id = `pre-${i}:${j}`;
            cell.classList.add("pre-cell");
            row.appendChild(cell);
        }  
        preview.appendChild(row);
    }

    for(let i = 2; i < fieldState.length - 1; i++) {
        const row = document.createElement('div');
        row.id = `${i}`;
        row.classList.add("js-row");
        for(let j = 0; j < fieldState[i].length; j++) {
            const cell = document.createElement("div");
            cell.id = `${i}:${j}`;
            cell.classList.add("cell");
            row.appendChild(cell);
        }  
        gameCont.appendChild(row);
    }
}


function randomTo(num) {
    return Math.floor(Math.random() * num);
}

function determineHeight(state) {
	for (let i = state.length - 1; i > 0; i--) {
		let d = state[i].includes(1);
		if(d) return i;
	}
}

function determinePeak(state) {
    for(let i = 0; i < state.length; i++) {
        let d = state[i].includes(1);
        if(d) return i;
    }
}

function determineEdges (state, isForLeft){
	let leftMost = Infinity,
		rightMost = -Infinity;
	for (let i = 0; i < state.length; i++) {
		let left = state[i].indexOf(1),
			right = state[i].lastIndexOf(1);
		if(left < leftMost && left >= 0) leftMost = left;
		if(right > rightMost) rightMost = right;
    }
    return isForLeft? leftMost : rightMost;
}

let followingTetro = tetroes[randomTo(tetroes.length)],
    followingState = followingTetro.states[randomTo(followingTetro.states.length - 1)];

function pauseGame() {
    if(isGameOver) return;
    if(isPaused) {
        pauseB.innerHTML = "P &#10073;&#10073;";
        pauseB.classList.remove("active-button");
        leftB.addEventListener("mousedown", goLeft);
        rightB.addEventListener("mousedown", goRight);
        downB.addEventListener("mousedown", goDown);
        eB.addEventListener("mousedown", turnClockwise);
        qB.addEventListener("mousedown", turnCounterClockwise);
        restartB.addEventListener("mousedown", restartGame);
        hideMessageBox();
        resumeGame();
        return;
    }
    isPaused = true;
    pauseB.innerHTML = "P &#9658";
    pauseB.classList.add("active-button");
    leftB.removeEventListener("mousedown", goLeft);
    rightB.removeEventListener("mousedown", goRight);
    downB.removeEventListener("mousedown", goDown);
    eB.removeEventListener("mousedown", turnClockwise);
    qB.removeEventListener("mousedown", turnCounterClockwise);
    restartB.removeEventListener("mousedown", restartGame);
    displayMessageBox("GAME</br>PAUSED");
    clearInterval(propagate);
    clearTimeout(lastBreathTimeout);
}

function resumeGame() {
    isPaused = false;
    propagate = setInterval(moveDown, gameSpeed);
}



function nextTetro() {
    let tetro = followingTetro;
        tetroName = tetro.name; 
        tetroState = followingState,
        initialCoords = {
            x: 3,
            y: 0
        },
    currentTetro.state = tetroState;
    currentTetro.states = tetro.states;
    currentTetro.coords = initialCoords;
    currentTetro.name = tetroName;
    resumeGame();
    updateFieldState();
    updateField();
    followingTetro = tetroes[randomTo(tetroes.length)];
    followingState = followingTetro.states[randomTo(followingTetro.states.length - 1)];
    updatePreview();
}



function clearField(afterCollision = false) {
        if(afterCollision) {
            for(let i = 0; i < fieldState.length - 1; i++) {
                if(!fieldState[i].includes(0)) {
                    linesCleared++;
                    updateStats();
                    gameScore+= gameLevel * 100;
                    fieldState.splice(i, 1);
                    fieldState.splice(2, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                }
            }
        } else {
            for(let i = 0; i < fieldState.length - 1; i++) {
                for(let j = 0; j < 10; j++) {
                    if(fieldState[i][j] != 2) {
                        fieldState[i][j] = 0;
                    }
                }
            }
        }
}

function updateField() {
    for(let i = 2; i < fieldState.length - 1; i++) {
        for(let j = 0; j < 10; j++) {
            if(fieldState[i][j] === 1 || fieldState[i][j] === 2) {
                document.getElementById(`${i}:${j}`).style.background = activeCellColor;
            } else  {
                document.getElementById(`${i}:${j}`).style.background = inactiveCellColor;
            }
        }
    }
}

function lastBreath() {
    isLastBreath = true;
    updateFieldState();
    lastBreathTimeout = setTimeout(collision, gameSpeed);
}


function collision() {
    isLastBreath = false;
    clearInterval(propagate);
    gameScore += (currentTetro.rightmost() - currentTetro.leftmost() + 1);
    for(let x = currentTetro.coords.x, i = 0; i < currentTetro.state.length; x++, i++) {
        for(let y = currentTetro.coords.y, j = 0; j < currentTetro.state[i].length; y++, j++) {
                    if(currentTetro.state[j][i] && currentTetro.state[j][i] === 1) {
                        fieldState[y][x] = 2; 
                }                        
            }
        }
    clearField(true);
    nextTetro();
    updateStats();
}



function updatePreview() {
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            document.getElementById(`pre-${i}:${j}`).style.background = '#c5c9c8';
        }
    }
    for(let i = 0; i < followingState.length; i++) {
        for(let j = 0; j < followingState[i].length; j++) {
            if(followingState[i][j]) {
                document.getElementById(`pre-${i}:${j}`).style.background = activeCellColor;
            }
        }
    }
}

function updateStats() {
    scoreDiv.innerHTML = `Score: ${gameScore}`;
    levelDiv.innerHTML = `level: ${gameLevel}`;
    linesDiv.innerHTML = `Lines: ${linesCleared}`;
    gameLevel = Math.floor(linesCleared / 10) + 1;
    gameSpeed = 1000 * (0.8**(gameLevel - 1));
}

function updateHighScores() {
    hsdiv.innerHTML = "Highscores:";
    for(let i = 0; i < sessionHighscores.length; i++) {
        hsdiv.innerHTML += `<div>${i+1} : ${sessionHighscores[i]}</div>`;
    }
}

function updateSessionHighScores(score) {
    if(score === 0) return;
    switch(sessionHighscores.length) {
        case 0:
            sessionHighscores.push(score);
        break;
        case 5:
            if(score > Math.min(...sessionHighscores)) {
                sessionHighscores.sort((a, b) => b - a);
                sessionHighscores.splice(sessionHighscores.length - 1, 1, score);
                sessionHighscores.sort((a, b) => b - a);
            }
        break;
        default:
                sessionHighscores.push(score);
                sessionHighscores.sort((a, b) => b - a);
    }
}

function updateFieldState(triggerLastBreath = false, duringLastBreath = false) {
    rows: for(let x = currentTetro.coords.x, i = 0; i < currentTetro.state.length; x++, i++) {
        columns: for(let y = currentTetro.coords.y, j = 0; j < currentTetro.state[i].length; y++, j++) {
                    if(currentTetro.state[j][i] === 1 &&
                        fieldState[y + 1][x] === 2) {
                        if(isLastBreath) {
                            fieldState[y][x] = 1;                        
                        } else {
                            if(currentTetro.lowest() < 2){
                                gameOver();
                                return;
                            } else {
                                triggerLastBreath = true;
                            }
                        }
                    } else {
                        if(duringLastBreath) {
                            if(j === currentTetro.state[i].length - 1 && currentTetro.lowest() != 21) {
                                for (let x = currentTetro.coords.x, i = 0; i < currentTetro.state.length; x++, i++) {
                                    if(currentTetro.state[j][i] === 1 &&
                                        fieldState[y + 1][x] === 2) {

                                        }
                                }
                                    
                                }
                                     clearTimeout(lastBreathTimeout);
                                     isLastBreath = false;
                        }
                        if(currentTetro.state[j][i] === 1) {
                        fieldState[y][x] = 1;
                            } else {
                                if(fieldState[y] && fieldState[y][x] && fieldState[y][x] != 2) {
                                fieldState[y][x] = 0;
                            }
                        }
                    }                         
                }
            }
    if(triggerLastBreath) {
        lastBreath();
    }
}

function rotateCollision(tetro) {
    for(let i = tetro.highest(); i <= tetro.lowest(); i++) {
        for(let j = tetro.leftmost(); j <= tetro.rightmost(); j++)
        if(fieldState[i][j] === 2) return true;
    }
}


function sideCollision(tetro, side) {
    for(let x = currentTetro.coords.x, i = 0; i < currentTetro.state.length; x++, i++) {
        for(let y = currentTetro.coords.y, j = 0; j < currentTetro.state[i].length; y++, j++) {
            switch(side) {
                case left:
                    if(currentTetro.state[j][i] === 1 &&
                        fieldState[y][x - 1] === 2) {
                        return true;
                    };
                break;
                case right:
                    if(currentTetro.state[j][i] === 1 &&
                        fieldState[y][x + 1] === 2) {
                        return true;
                    };
                break;
            }
        }
    }

}

function moveDown() {
    if(isLastBreath) {
        clearTimeout(lastBreathTimeout);
        collision();
        return;
    }
    clearField();
    currentTetro.coords.y++;
    updateFieldState();
    updateField();
}

function moveRight() {
    if(currentTetro.rightmost() === fieldState[0].length - 1 ||
            sideCollision(currentTetro, right)
        ) return;
    clearField();
    currentTetro.coords.x++;
    if(isLastBreath){
        updateFieldState(false, true);
    } else {
        updateFieldState();
    }
    updateField();
}
function moveLeft() {
    if(currentTetro.leftmost() === 0 ||
        sideCollision(currentTetro, left)
        ) return;
    clearField();
    currentTetro.coords.x--;
    if(isLastBreath){
        updateFieldState(false, true);
    } else {
        updateFieldState();
    }
    updateField();
}

function rotateClockwise() {
    clearField();
    const stateIndex = currentTetro.states.indexOf(currentTetro.state);
    if(stateIndex === currentTetro.states.length -1) {
        return  currentTetro.states[0];
    } else {
        return  currentTetro.states[stateIndex + 1];
    }
}

function rotateCounterClockwise() {
    clearField();
    const stateIndex = currentTetro.states.indexOf(currentTetro.state);
    if(stateIndex === 0) {
        return  currentTetro.states[currentTetro.states.length - 1];
    } else {
        return  currentTetro.states[stateIndex - 1];
    }
   
}

function isGhost(state) {
    proposedTetro.state = state;
    if(proposedTetro.leftmost() < 0 ||
        proposedTetro.rightmost() > 9 ||
        rotateCollision(proposedTetro)
        ) {
        return true;
    } return false;
}


function goDown() {
    moveDown();
    downB.classList.add("active-button");
}

function goRight() {
    moveRight();
            rightB.classList.add("active-button");
}

function goLeft() {
    moveLeft();
    leftB.classList.add("active-button");
}

function turnClockwise() {
    if(isGhost(rotateClockwise() ) ) {
        return;
    }
    currentTetro.state = rotateClockwise();
    if(isLastBreath){
        updateFieldState(false, true);
    } else {
        updateFieldState();
    }
    updateField();
    eB.classList.add("active-button");
}

function turnCounterClockwise() {
    if(isGhost(rotateCounterClockwise() ) ) {
        return;
    }
    currentTetro.state = rotateCounterClockwise();
    if(isLastBreath){
        updateFieldState(false, true);
    } else {
        updateFieldState();
    }
    updateField();
    qB.classList.add("active-button");
}

function clearBtn(e) {
    e.stopPropagation();
    e.target.classList.remove("active-button");
}

function parseKeyStroke(e) {
    switch (e.which) {
        case 83:
        case 40:
            if(!isPaused && !isGameOver) goDown();
            break;
        case 68:
        case 39:
            if(!isPaused && !isGameOver) goRight();
            break;
        case 65:
        case 37:
            if(!isPaused && !isGameOver) goLeft();
            break;
        case 69:
            if(!isPaused && !isGameOver) turnClockwise();
            break;
        case 81:
            if(!isPaused && !isGameOver) turnCounterClockwise();
            break;
        case 80:
            if(!isGameOver) pauseGame();
            //pauseB.classList.toggle("active-button");
            break;
        case 82:
            if(!isPaused) {
                restartGame();
                restartB.classList.add("active-button");
            }
            
            break;
    }
}

function startGameEnter(e) {
    if(e.which === 13) {
        startGame();
    }
}

function parseKeyUp(e) {
    switch (e.which) {
        case 83:
        case 40:
            downB.classList.remove("active-button");
            break;
        case 68:
        case 39:
            rightB.classList.remove("active-button");
            break;
        case 65:
        case 37:
            leftB.classList.remove("active-button");
            break;
        case 69:
            eB.classList.remove("active-button");
            break;
        case 81:
            qB.classList.remove("active-button");
            break;
        case 82:
            restartB.classList.remove("active-button");
    }
}

    
leftB.addEventListener("mousedown", goLeft);
rightB.addEventListener("mousedown", goRight);
downB.addEventListener("mousedown", goDown);
eB.addEventListener("mousedown", turnClockwise);
qB.addEventListener("mousedown", turnCounterClockwise);
pauseB.addEventListener("mousedown", pauseGame);
restartB.addEventListener("mousedown", restartGame);


document.getElementById("controls").addEventListener("mouseup", clearBtn);



function restartGame(isBeginning = false){
    hideMessageBox();
    resetFieldState();
    resetGlobals();
    clearInterval(propagate);
    updateField();  
    nextTetro();
    updateStats();
    if(!isBeginning) {
        updateHighScores();
    }
}

function startGame() {
    document.body.removeEventListener("keydown", startGameEnter);
    controls.style.zIndex = 1;
    side.style.zIndex = 1;
    document.body.addEventListener("keydown", parseKeyStroke);
    document.body.addEventListener("keyup", parseKeyUp);
    hideMessageBox();
    restartGame(true);
}

function gameOver(){
    isGameOver = true;
    clearInterval(propagate);
    //pauseB.removeEventListener("mousedown", pauseGame);
    leftB.removeEventListener("mousedown", goLeft);
    rightB.removeEventListener("mousedown", goRight);
    downB.removeEventListener("mousedown", goDown);
    eB.removeEventListener("mousedown", turnClockwise);
    qB.removeEventListener("mousedown", turnCounterClockwise);
    displayMessageBox(`GAME</br>OVER</br></br>SCORE:</br>${gameScore}`);
    updateSessionHighScores(gameScore);
}

function displayMessageBox(message) {
    messageBox.style.visibility = "visible";
    messageBox.innerHTML = message;
    controls.style.opacity = 0.5;
    side.style.opacity = 0.5;
}

function hideMessageBox() {
    messageBox.style.visibility = "hidden";
        side.style.opacity = 1;
        controls.style.opacity = 1;
}

controls.style.zIndex = -1;
side.style.zIndex = -1;
resetFieldState();
initialDraw();
updateStats();
displayMessageBox(`PLEASE,</br><button id=startGameButton" onclick="startGame()">START THE</br>GAME &#x2b90;</button>`);
document.body.addEventListener("keydown", startGameEnter);
isPaused = true;