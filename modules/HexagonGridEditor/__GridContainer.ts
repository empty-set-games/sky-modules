import ScreenMoveController2D from 'sky/controllers/ScreenMoveController2D'
import WasdController2D from 'sky/controllers/WasdController2D'

export interface __GridContainerParameters {
    gridEditor: HexagonGridEditor
    grid?: HexagonGrid
}
export default interface __GridContainer extends Enability {}
@enability
export default class __GridContainer extends Canvas.Sprite {
    readonly gridEditor: HexagonGridEditor
    grid: HexagonGrid
    camera: Vector2 = new Vector2(-105, 0)
    wasdController2D: WasdController2D
    screenMoveController2D: ScreenMoveController2D

    constructor(deps: EffectDeps, parameters: __GridContainerParameters) {
        super(deps)
        Enability.super(this)

        this.gridEditor = parameters.gridEditor

        this.grid =
            parameters.grid ??
            new HexagonGrid(this.effect, {
                hexagonSize: 50,
                hexagonOrigin: { x: 0, y: 0 },
                circles: [
                    new HexagonCircle({
                        q: 0,
                        r: 0,
                        radius: 4,
                    }),
                ],
            })

        this.wasdController2D = new WasdController2D(this.effect)

        this.screenMoveController2D = new ScreenMoveController2D(this.effect, {
            camera: this.camera,
        })
    }

    @action_hook
    protected onGlobalMouseDown(ev: Sky.MouseDownEvent): void {
        if (ev.isCaptured) {
            return
        }

        this.__transformMouse(ev)
        this.gridEditor.clickHexagon(new Vector2(ev.x, ev.y))
    }

    protected onGlobalMouseMove(ev: Sky.MouseMoveEvent): void {
        if (ev.isCaptured) {
            return
        }

        this.__transformMouse(ev)

        if (this.effect.root.isLeftMousePressed) {
            this.gridEditor.clickHexagon(new Vector2(ev.x, ev.y))
        }
    }

    protected update(ev: Sky.UpdateEvent): void {
        const cameraAcceleration = this.wasdController2D.acceleration
            .clone()
            .multiplyScalar(ev.dt * 1000)

        this.camera.x += cameraAcceleration.x
        this.camera.y -= cameraAcceleration.y
    }

    @action_hook
    protected draw(ev: Sky.DrawEvent, next: Function): void {
        if (!this.grid.enabled) {
            return
        }

        this.gridEditor.canvas.drawContext.clearRect(
            0,
            0,
            this.gridEditor.canvas.domElement.width,
            this.gridEditor.canvas.domElement.height
        )

        ev.x += window.innerWidth / 2 - this.camera.x
        ev.y += window.innerHeight / 2 - this.camera.y

        this.drawGrid(this.gridEditor.canvas.drawContext, this.grid.hexagons, ev)

        next()
    }

    drawGrid(drawContext: CanvasRenderingContext2D, hexagons: Hexagon[], ev: Sky.DrawEvent): void {
        hexagons.forEach(hexagon => {
            const point = {
                x: ev.x + hexagon.position.x,
                y: ev.y + hexagon.position.y,
            }

            Canvas.drawHexagon(drawContext, {
                x: point.x,
                y: point.y,
                radius: hexagon.size / 2,
                color: hexagon.color,
                strokeColor: '#666666',
                strokeWidth: 2,
            })
        })

        hexagons.forEach(hexagon => {
            const point = {
                x: ev.x + hexagon.position.x,
                y: ev.y + hexagon.position.y,
            }

            if (hexagon.areaSides.circle.length > 0) {
                Canvas.drawHexagon(drawContext, {
                    x: point.x,
                    y: point.y,
                    radius: hexagon.size / 2,
                    sides: hexagon.areaSides.circle,
                    strokeColor: '#666666',
                    strokeWidth: 4,
                })
            }
        })
    }

    private __transformMouse(mouse: Sky.MouseEvent): void {
        mouse.x += this.camera.x - window.innerWidth / 2
        mouse.y += this.camera.y - window.innerHeight / 2
    }
}
