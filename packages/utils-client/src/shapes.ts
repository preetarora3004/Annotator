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
    const options = drawable.options || {};
    const precision = options.fixedDecimalPlaceDigits;

    sets.forEach((set: OpSet) => {
        switch (set.type) {
            case 'path': {
                ctx.save();
                const stroke =
                    options.stroke === 'none'
                        ? 'transparent'
                        : options.stroke || ctx.strokeStyle;
                const strokeWidth = options.strokeWidth ?? ctx.lineWidth;
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth;

                if (options.strokeLineDash) {
                    ctx.setLineDash(options.strokeLineDash);
                }
                if (options.strokeLineDashOffset) {
                    ctx.lineDashOffset = options.strokeLineDashOffset;
                }

                drawToContext(ctx, set, precision);
                ctx.restore();
                break;
            }
            case 'fillPath': {
                ctx.save();
                ctx.fillStyle = options.fill || '';
                const fillRule =
                    drawable.shape === 'curve' ||
                    drawable.shape === 'polygon' ||
                    drawable.shape === 'path'
                        ? 'evenodd'
                        : 'nonzero';
                drawToContext(ctx, set, precision, fillRule);
                ctx.restore();
                break;
            }
            case 'fillSketch': {
                ctx.save();
                let fweight = options.fillWeight;
                const strokeWidth = options.strokeWidth ?? ctx.lineWidth;
                if (typeof fweight !== 'number' || fweight < 0) {
                    fweight = strokeWidth / 2;
                }

                if (options.fillLineDash) {
                    ctx.setLineDash(options.fillLineDash);
                }
                if (options.fillLineDashOffset) {
                    ctx.lineDashOffset = options.fillLineDashOffset;
                }

                ctx.strokeStyle = options.fill || '';
                ctx.lineWidth = fweight;
                drawToContext(ctx, set, precision);
                ctx.restore();
                break;
            }
            default:
                drawToContext(ctx, set, precision);
        }
    });
};