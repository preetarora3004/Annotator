import { RoughGenerator } from "roughjs/bin/generator";
import type { OpSet, Drawable, Config } from "roughjs/bin/core";

export const drawToContext = (
    ctx: CanvasRenderingContext2D, 
    drawing: OpSet, 
    fixedDecimals?: number, 
    rule: CanvasFillRule = 'nonzero'
): void => {
    ctx.beginPath();
    for (const item of drawing.ops) {
        const data = ((typeof fixedDecimals === 'number') && fixedDecimals >= 0) 
            ? (item.data.map((d: any) => +d.toFixed(fixedDecimals))) 
            : item.data;

        switch (item.op) {
            case 'move': {
                const [x = 0, y = 0] = data;
                ctx.moveTo(x, y);
                break;
            }
            case 'bcurveTo': {
                const [x1 = 0, y1 = 0, x2 = 0, y2 = 0, x = 0, y = 0] = data;
                ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
                break;
            }
            case 'lineTo': {
                const [x = 0, y = 0] = data;
                ctx.lineTo(x, y);
                break;
            }
        }
    }
    if (drawing.type === 'fillPath') {
        ctx.fill(rule);
    } else {
        ctx.stroke();
    }
};

export const drawDrawable = (
    ctx: CanvasRenderingContext2D, 
    drawable: Drawable
): void => {
    const sets = drawable.sets || [];
    const precision = drawable.options.fixedDecimalPlaceDigits;

    sets.forEach((set: OpSet) => {
        drawToContext(ctx, set, precision);
    });
};