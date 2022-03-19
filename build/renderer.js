import { FieldState, UnknownFieldState } from "./field.js";
export class Renderer {
    constructor(ctx, gameConfig, fieldPixelSize, fields) {
        this.ctx = ctx;
        this.gameConfig = gameConfig;
        this.fieldPixelSize = fieldPixelSize;
        this.fields = fields;
    }
    render() {
        this.renderFields();
        this.drawGrid();
    }
    renderFields() {
        const singleFieldPixel = this.fieldPixelSize / this.gameConfig.fieldSize;
        const translateFieldPos = (f) => {
            const leftUpperX = f.colNo * singleFieldPixel;
            const leftUpperY = f.rowNo * singleFieldPixel;
            const rightLowerX = leftUpperX + singleFieldPixel;
            const rightLowerY = leftUpperY + singleFieldPixel;
            return [new Position(leftUpperX, leftUpperY), new Position(rightLowerX, rightLowerY)];
        };
        let col = 0;
        let row = 0;
        for (let fRow of this.fields) {
            row = 0;
            for (let field of fRow) {
                const [leftUpper, rightLower] = translateFieldPos(field);
                const fRenderer = new FieldRenderer(c => {
                    this.drawRect(leftUpper, rightLower, c, col, row);
                });
                field.renderOnField(fRenderer, new Hitbox(leftUpper, rightLower));
                row++;
            }
            col++;
        }
    }
    drawGrid() {
        const gap = this.fieldPixelSize / this.gameConfig.fieldSize;
        const origin = new Position(0, 0);
        let start = origin;
        let end = start.moveY(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            this.drawLine(start, end);
            start = start.moveX(gap);
            end = end.moveX(gap);
        }
        start = origin;
        end = start.moveX(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            this.drawLine(start, end);
            start = start.moveY(gap);
            end = end.moveY(gap);
        }
    }
    drawLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }
    drawRect(leftUpper, rightLower, color, col, row) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(leftUpper.x, leftUpper.y, leftUpper.horizontalDistanceTo(rightLower), leftUpper.verticalDistanceTo(rightLower));
        this.ctx.fill();
        if (color === 'white') {
            let canvas = document.getElementById("playground");
            let context = canvas.getContext("2d");
            context.fillStyle = 'black';
            let mines = (this.MinesAround[col][row]);
            let minesStr = mines.toString();
            context.fillText(minesStr, leftUpper.x + leftUpper.horizontalDistanceTo(rightLower) / 2 - 6, leftUpper.y + leftUpper.verticalDistanceTo(rightLower) / 2 + 6);
        }
    }
}
export class FieldRenderer {
    constructor(draw) {
        this.draw = draw;
    }
    render(state) {
        let color = null;
        switch (state) {
            case FieldState.Hidden:
                {
                    color = 'grey';
                }
                break;
            case FieldState.Unveiled:
                {
                    color = 'white';
                }
                break;
            case FieldState.Flagged:
                {
                    color = 'blue';
                }
                break;
            case FieldState.Detonated:
                {
                    color = 'red';
                }
                break;
            default: {
                throw new UnknownFieldState(state);
            }
        }
        this.draw(color);
    }
}
export class Hitbox {
    constructor(leftUpper, rightLower) {
        this.leftUpper = leftUpper;
        this.rightLower = rightLower;
    }
    isHit(hit) {
        return hit.x >= this.leftUpper.x
            && hit.x <= this.rightLower.x
            && hit.y >= this.leftUpper.y
            && hit.y <= this.rightLower.y;
    }
}
export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    moveX(pixel) {
        return new Position(this.x + pixel, this.y);
    }
    moveY(pixel) {
        return new Position(this.x, this.y + pixel);
    }
    horizontalDistanceTo(other) {
        const distance = this.x - other.x;
        return Math.abs(distance);
    }
    verticalDistanceTo(other) {
        const distance = this.y - other.y;
        return Math.abs(distance);
    }
}
//# sourceMappingURL=renderer.js.map