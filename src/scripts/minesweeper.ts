import {Field, Mine} from "./field.js";
import {Position, Renderer} from "./renderer.js";

export class GameConfig {

    private readonly MAX_FIELD_SIZE: number = 10;
    private readonly MAX_MINE_RATIO: number = 0.3;
    private readonly MIN_FIELD_SIZE: number = 3;
    private readonly MIN_MINE_RATION: number = 0.1;
    public readonly mineRatio;

    constructor(public readonly fieldSize: number,
                public readonly noOfMines: number) {
        const requestedFieldSize = Math.pow(this.fieldSize, 2);
        this.mineRatio = this.noOfMines / requestedFieldSize;
    }

    public isValid(): boolean {
        return this.fieldSize > this.MIN_FIELD_SIZE
            && this.mineRatio > this.MIN_MINE_RATION
            && !(this.mineRatio > this.MAX_FIELD_SIZE
                || this.mineRatio > this.MAX_MINE_RATIO);
    }
}

enum GameState {
    Continue,
    GameOver,
    Victory
}

function generateField(config: GameConfig): Field[][] {

    function isMine(): boolean {

        function randomIntInRange(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        const r = config.mineRatio * 100;
        const rand = randomIntInRange(1, 100);
        return rand <= r;
    }

    const field = new Array<Array<Field>>(config.fieldSize);
    let placedMines = 0;
    while (placedMines < config.noOfMines) {
        for (let row = 0; row < config.fieldSize; row++) {
            const r = field[row] == null
                ? new Array<Field>(config.fieldSize)
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

function handleFieldHit(fields: Field[][], hitPosition: Position, flagging: boolean, config: GameConfig): GameState {
    let no = 0;
    function checkForVictory(): boolean {
        let noOfMines = 0;
        let noOfFlaggedMines = 0;
        let noOfFlaggedFields = 0;
        for (let row of fields) {
            for (let field of row) {
                if (!(field instanceof Mine)) {
                    if (field.flagged){
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
    function getNumOfMinesAround(colPos: number, rowPos: number): number{
        let mines = 0;
        for(let col: number = colPos - 1; col <= colPos + 1; col++){
            for(let row: number = rowPos - 1; row <= rowPos + 1; row++){
                if((col !== colPos && row !== rowPos ) || col === - 1 || col === config.fieldSize || row === - 1 || row === config.fieldSize ){}
                else{
                    if(fields[col][row] instanceof Mine) mines++;
                }
            }
        }
        return 0;
    }
    let colPos: number = 0;
    for (let row of fields) {
        let rowPos: number = 0;
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

function updateGameStateDisplay(state: GameState): void {

    function hasClass(e: HTMLElement, c: string): boolean {
        return e.classList.contains(c);
    }

    function removeClass(e: HTMLElement, c: string): void {
        if (hasClass(e, c)) {
            e.classList.remove(c)
        }
    }

    function addClass(e: HTMLElement, c: string): void {
        if (!hasClass(e, c)) {
            e.classList.add(c);
        }
    }

    const dangerClass = "alert-danger";
    const successClass = "alert-success";
    const div: HTMLElement = document.getElementById("gameState");
    removeClass(div, dangerClass);
    removeClass(div, successClass);

    switch (state) {
        case GameState.GameOver: {
            div.innerText = 'Game Over!'
            addClass(div, dangerClass);
        }
            break;
        case GameState.Victory: {
            div.innerText = 'Victory!';
            addClass(div, successClass);
        }
            break;
        case GameState.Continue: {
            div.innerText = '';
        }
            break;
        default: {
            throw new Error('unknown game state');
        }
    }
}

function revealAllMines(playingField: Field[][]): void {
    for (let row of playingField) {
        for (let field of row) {
            if (field instanceof Mine) {
                (<Mine>field).reveal();
            }
        }
    }
}

let config: GameConfig = null;
let playingField: Field[][] = null;
let mineHitFlag = false;

function init() {
    config = new GameConfig(5, 4);
    playingField = generateField(config);
    mineHitFlag = false;

    updateGameStateDisplay(GameState.Continue);

    const canvas: any = document.getElementById("playground");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    const renderer = new Renderer(context, config, 400, playingField);
    renderer.render();

    canvas.onmousedown = (event: MouseEvent) => {
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

document.addEventListener('DOMContentLoaded', (event) => {
    var canvas = <HTMLCanvasElement>document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font = "30px Arial";
    ctx.fillText("Hello World", 10, 50);
    init();
});