export class Field {
    constructor(colNo, rowNo, gameConfig) {
        this.colNo = colNo;
        this.rowNo = rowNo;
        if (colNo < 0 || rowNo < 0
            || colNo > gameConfig.fieldSize - 1
            || rowNo > gameConfig.fieldSize - 1) {
            throw new InvalidFieldPosition(this);
        }
        this.isUnveiled = false;
        this.isFlagged = false;
    }
    renderOnField(renderer, hitBox) {
        this.hitBox = hitBox;
        renderer.render(this.getState());
    }
    getState() {
        if (this.isUnveiled) {
            return FieldState.Unveiled;
        }
        return this.isFlagged ? FieldState.Flagged : FieldState.Hidden;
    }
    checkForHit(hit, flagging) {
        if (this.hitBox.isHit(hit)) {
            if (flagging) {
                this.isFlagged = !this.isFlagged;
            }
            else {
                this.isUnveiled = true;
            }
            return true;
        }
        return false;
    }
    get flagged() {
        return this.isFlagged;
    }
}
export class Mine extends Field {
    getState() {
        if (this.isUnveiled) {
            return FieldState.Detonated;
        }
        return this.isFlagged ? FieldState.Flagged : FieldState.Hidden;
    }
    reveal() {
        this.isUnveiled = true;
    }
}
export var FieldState;
(function (FieldState) {
    FieldState[FieldState["Hidden"] = 0] = "Hidden";
    FieldState[FieldState["Unveiled"] = 1] = "Unveiled";
    FieldState[FieldState["Detonated"] = 2] = "Detonated";
    FieldState[FieldState["Flagged"] = 3] = "Flagged";
})(FieldState || (FieldState = {}));
export class InvalidFieldPosition extends Error {
    constructor(mine) {
        super();
        this.mine = mine;
    }
}
export class UnknownFieldState extends Error {
    constructor(state) {
        super();
        this.state = state;
    }
}
//# sourceMappingURL=field.js.map