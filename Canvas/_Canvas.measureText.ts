import globalify from 'sky/utilities/globalify'

declare global {
    namespace Canvas {
        function drawText(ctx: CanvasRenderingContext2D, text: string): void
    }
}

namespace CanvasModule {
    export function drawText(ctx: CanvasRenderingContext2D, text: string): TextMetrics {
        return ctx.measureText(text)
    }
}

globalify.namespace('Canvas', CanvasModule)
