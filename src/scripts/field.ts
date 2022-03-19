import {GameConfig} from "./minesweeper.js";
import {FieldRenderer, Hitbox, Position} from "./renderer";

export class Field {

    protected isUnveiled: boolean;
    private hitBox: Hitbox;
    protected isFlagged: boolean;

    constructor(public readonly colNo: number,
                public readonly rowNo: number,
                gameConfig: GameConfig) {
        if (colNo < 0 || rowNo < 0
            || colNo > gameConfig.fieldSize - 1
            || rowNo > gameConfig.fieldSize - 1) {
            throw new InvalidFieldPosition(this);
        }
        this.isUnveiled = false;
        this.isFlagged = false;
    }

    public renderOnField(renderer: FieldRenderer, hitBox: Hitbox): void {
        this.hitBox = hitBox;
        renderer.render(this.getState());
    }

    protected getState(): FieldState {
        if (this.isUnveiled){
            return FieldState.Unveiled;
        }
        return this.isFlagged ? FieldState.Flagged : FieldState.Hidden;
    }

    public checkForHit(hit: Position, flagging: boolean): boolean {
        if (this.hitBox.isHit(hit)) {
            if (flagging){
                this.isFlagged = !this.isFlagged;
            } else {
                this.isUnveiled = true;
                var canvas = <HTMLCanvasElement>document.getElementById("playground");
                var ctx = canvas.getContext("2d");
                ctx.font = "30px Arial";
                ctx.fillText("5", hit.x, hit.y);
            }
            return true;
        }
        return false;
    }

    public get flagged() {
        return this.isFlagged;
    }
}

export class Mine extends Field {

    protected getState(): FieldState {
        if (this.isUnveiled){
            return FieldState.Detonated;
        }
        return this.isFlagged ? FieldState.Flagged : FieldState.Hidden;
    }

    public reveal(): void{
        this.isUnveiled = true;
    }
}

export enum FieldState {
    Hidden,
    Unveiled,
    Detonated,
    Flagged
}

export class InvalidFieldPosition extends Error {
    constructor(public readonly mine: Field) {
        super();
    }
}

export class UnknownFieldState extends Error {
    constructor(public readonly state: FieldState) {
        super();
    }
}