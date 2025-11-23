import { Rect, Circle, FabricObject } from 'fabric';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Options } from 'roughjs/bin/core';
import { drawDrawable } from './shapes';

let generator: RoughGenerator | null = null;

const getGenerator = (): RoughGenerator => {
    if (!generator) {
        generator = new RoughGenerator();
    }
    return generator;
};

export class RoughRect extends Rect {
    private roughConfig: Options = {
        roughness: 1,
        bowing: 1,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
    };

    constructor(options?: any) {
        super(options);
        if (options?.roughConfig) {
            this.roughConfig = { ...this.roughConfig, ...options.roughConfig };
        }

        if (options?.stroke) this.roughConfig.stroke = options.stroke;
        if (options?.strokeWidth) this.roughConfig.strokeWidth = options.strokeWidth;
        if (options?.fill) this.roughConfig.fill = options.fill === 'transparent' ? undefined : options.fill;
    }

    _render(ctx: CanvasRenderingContext2D): void {
        const gen = getGenerator();
        const x = -this.width! / 2;
        const y = -this.height! / 2;
        const rx = Math.min(this.rx || 0, this.width! / 2);
        const ry = Math.min(this.ry || 0, this.height! / 2);
        
        let drawable;
        if (rx > 0 || ry > 0) {
            const path = `M ${x} ${y + ry} 
                Q ${x} ${y} ${x + rx} ${y} 
                L ${x + this.width! - rx} ${y} 
                Q ${x + this.width!} ${y} ${x + this.width!} ${y + ry} 
                L ${x + this.width!} ${y + this.height! - ry} 
                Q ${x + this.width!} ${y + this.height!} ${x + this.width! - rx} ${y + this.height!} 
                L ${x + rx} ${y + this.height!} 
                Q ${x} ${y + this.height!} ${x} ${y + this.height! - ry} 
                Z`;
            const fillValue = this.fill === 'transparent' || !this.fill ? undefined : (this.fill as string);
            drawable = gen.path(path, {
                ...this.roughConfig,
                ...(fillValue !== undefined && { fill: fillValue }),
                stroke: (this.stroke as string) || '#000000',
                strokeWidth: this.strokeWidth || 2,
            });
        } else {
            const fillValue = this.fill === 'transparent' || !this.fill ? undefined : (this.fill as string);
            drawable = gen.rectangle(
                x,
                y,
                this.width!,
                this.height!,
                {
                    ...this.roughConfig,
                    ...(fillValue !== undefined && { fill: fillValue }),
                    stroke: (this.stroke as string) || '#000000',
                    strokeWidth: this.strokeWidth || 2,
                }
            );
        }

        ctx.save();
        drawDrawable(ctx, drawable);
        ctx.restore();
    }

    setRoughConfig(config: Partial<Options>): void {
        this.roughConfig = { ...this.roughConfig, ...config };
        this.dirty = true;
    }

    getRoughConfig(): Options {
        return { ...this.roughConfig };
    }
}

export class RoughCircle extends Circle {
    private roughConfig: Options = {
        roughness: 1,
        bowing: 1,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 2,
    };

    constructor(options?: any) {
        super(options);
        if (options?.roughConfig) {
            this.roughConfig = { ...this.roughConfig, ...options.roughConfig };
        }
        
        if (options?.stroke) this.roughConfig.stroke = options.stroke;
        if (options?.strokeWidth) this.roughConfig.strokeWidth = options.strokeWidth;
        if (options?.fill) this.roughConfig.fill = options.fill === 'transparent' ? undefined : options.fill;
    }

    _render(ctx: CanvasRenderingContext2D): void {
        const gen = getGenerator();
        const radius = this.radius!;
        
        const fillValue = this.fill === 'transparent' || !this.fill ? undefined : (this.fill as string);
        const drawable = gen.circle(
            0,
            0,
            radius * 2,
            {
                ...this.roughConfig,
                ...(fillValue !== undefined && { fill: fillValue }),
                stroke: (this.stroke as string) || '#000000',
                strokeWidth: this.strokeWidth || 2,
            }
        );

        ctx.save();
        drawDrawable(ctx, drawable);
        ctx.restore();
    }

    setRoughConfig(config: Partial<Options>): void {
        this.roughConfig = { ...this.roughConfig, ...config };
        this.dirty = true;
    }

    getRoughConfig(): Options {
        return { ...this.roughConfig };
    }
}

