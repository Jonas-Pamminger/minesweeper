import { Field, Mine } from "./field.js";
import { Position, Renderer } from "./renderer.js";
export class GameConfig {
    constructor(fieldSize, noOfMines) {
        this.fieldSize = fieldSize;
        this.noOfMines = noOfMines;
        this.MAX_FIELD_SIZE = 10;
        this.MAX_MINE_RATIO = 0.3;
        this.MIN_FIELD_SIZE = 3;
        this.MIN_MINE_RATION = 0.1;
        const requestedFieldSize = Math.pow(this.fieldSize, 2);
        this.mineRatio = this.noOfMines / requestedFieldSize;
    }
    isValid() {
        return this.fieldSize > this.MIN_FIELD_SIZE
            && this.mineRatio > this.MIN_MINE_RATION
            && !(this.mineRatio > this.MAX_FIELD_SIZE
                || this.mineRatio > this.MAX_MINE_RATIO);
    }
}
var GameState;
(function (GameState) {
    GameState[GameState["Continue"] = 0] = "Continue";
    GameState[GameState["GameOver"] = 1] = "GameOver";
    GameState[GameState["Victory"] = 2] = "Victory";
})(GameState || (GameState = {}));
function generateField(config) {
    function isMine() {
        function randomIntInRange(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const r = config.mineRatio * 100;
        const rand = randomIntInRange(1, 100);
        return rand <= r;
    }
    const field = new Array(config.fieldSize);
    let placedMines = 0;
    while (placedMines < config.noOfMines) {
        for (let row = 0; row < config.fieldSize; row++) {
            const r = field[row] == null
                ? new Array(config.fieldSize)
                : field[row];
            for (let col = 0; col < config.fieldSize; col++) {
                if (!(r[col] instanceof Mine)) {
                    const placeMine = (placedMines < config.noOfMines) && isMine();
                    r[col] = placeMine
                        ? new Mine(col, row, config)
                        : new Field(col, row, config);
                    if (placeMine) {
                        placedMines++;
                    }
                }
            }
            field[row] = r;
        }
    }
    return field;
}
function handleFieldHit(fields, hitPosition, flagging, config) {
    function checkForVictory() {
        let noOfMines = 0;
        let noOfFlaggedMines = 0;
        let noOfFlaggedFields = 0;
        for (let row of fields) {
            for (let field of row) {
                if (!(field instanceof Mine)) {
                    if (field.flagged) {
                        noOfFlaggedFields++;
                    }
                    continue;
                }
                noOfMines++;
                if (field.flagged) {
                    noOfFlaggedMines++;
                }
            }
        }
        return (noOfFlaggedFields === 0)
            && (noOfMines > 0)
            && (noOfMines === noOfFlaggedMines);
    }
    let colPos = 0;
    for (let row of fields) {
        let rowPos = 0;
        for (let field of row) {
            if (field.checkForHit(hitPosition, flagging)) {
                // if left click on mine
                if (!flagging && field instanceof Mine) {
                    return GameState.GameOver;
                }
                if (flagging && field instanceof Mine && checkForVictory()) {
                    return GameState.Victory;
                }
                return GameState.Continue;
            }
            rowPos++;
        }
        colPos++;
    }
    return GameState.Continue;
}
function getNumOfMinesAround(fields, colPos, rowPos) {
    let mines = 0;
    if (fields[colPos][rowPos] instanceof Mine)
        return 9;
    for (let col = colPos - 1; col <= colPos + 1; col++) {
        for (let row = rowPos - 1; row <= rowPos + 1; row++) {
            if ((col === colPos && row === rowPos) || col === -1 || col === config.fieldSize || row === -1 || row === config.fieldSize) { }
            else {
                if (fields[col][row] instanceof Mine)
                    mines++;
            }
        }
    }
    return mines;
}
function updateGameStateDisplay(state) {
    function hasClass(e, c) {
        return e.classList.contains(c);
    }
    function removeClass(e, c) {
        if (hasClass(e, c)) {
            e.classList.remove(c);
        }
    }
    function addClass(e, c) {
        if (!hasClass(e, c)) {
            e.classList.add(c);
        }
    }
    const dangerClass = "alert-danger";
    const successClass = "alert-success";
    const div = document.getElementById("gameState");
    removeClass(div, dangerClass);
    removeClass(div, successClass);
    switch (state) {
        case GameState.GameOver:
            {
                div.innerText = 'Game Over!';
                addClass(div, dangerClass);
            }
            break;
        case GameState.Victory:
            {
                div.innerText = 'Victory!';
                addClass(div, successClass);
            }
            break;
        case GameState.Continue:
            {
                div.innerText = '';
            }
            break;
        default: {
            throw new Error('unknown game state');
        }
    }
}
function revealAllMines(playingField) {
    for (let row of playingField) {
        for (let field of row) {
            if (field instanceof Mine) {
                field.reveal();
            }
        }
    }
}
let config = null;
let playingField = null;
let mineHitFlag = false;
function init() {
    document.getElementById('submit').addEventListener('click', () => {
        const fieldSize = document.getElementById('playGroundSize');
        const numOfMines = document.getElementById('numberOfMines');
        if (isNaN(+fieldSize.value) || isNaN(+numOfMines.value)) {
            alert('Input only can be a number');
        }
        else {
            config = new GameConfig(Number(fieldSize.value), Number(numOfMines.value));
            playingField = generateField(config);
            mineHitFlag = false;
            if (config.isValid()) {
                updateGameStateDisplay(GameState.Continue);
                const canvas = document.getElementById("playground");
                canvas.classList.remove('hidden');
                const context = canvas.getContext("2d");
                const renderer = new Renderer(context, config, 400, playingField);
                let minesAround = new Array(config.fieldSize);
                for (let col = 0; col < playingField.length; col++) {
                    minesAround[col] = new Array(playingField[0].length);
                    for (let row = 0; row < playingField[0].length; row++) {
                        minesAround[col][row] = getNumOfMinesAround(playingField, col, row);
                    }
                }
                renderer.MinesAround = minesAround;
                renderer.render();
                canvas.onmousedown = (event) => {
                    if (mineHitFlag) {
                        return;
                    }
                    if (event.button !== 0 && event.button !== 2) {
                        console.log('Unknown mouse button clicked');
                        return;
                    }
                    const rect = canvas.getBoundingClientRect();
                    const canvasX = event.clientX - rect.left;
                    const canvasY = event.clientY - rect.top;
                    const hitPosition = new Position(canvasX, canvasY);
                    const flagRequest = event.button === 2;
                    const gameState = handleFieldHit(playingField, hitPosition, flagRequest, config);
                    updateGameStateDisplay(gameState);
                    if (gameState === GameState.GameOver) {
                        mineHitFlag = true;
                        revealAllMines(playingField);
                        setTimeout(() => init(), 5000);
                    }
                    renderer.render();
                };
            }
            else {
                alert('Input wrong! Please try again');
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', (event) => {
    init();
});
//# sourceMappingURL=minesweeper.js.map