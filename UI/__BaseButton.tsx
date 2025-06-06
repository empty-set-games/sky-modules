import { TextView } from 'pkgs/troika-three-text'
import Sprite from 'sky/views/Sprite'
import Svg, { SvgParameters } from 'sky/views/Svg'

export interface BaseButtonParameters {
    text: string
    x: number
    y: number
    w?: number
    h?: number
    paddingX?: number
    paddingY?: number

    textParams?: UI.MakeTextParams
    hoverTextParams?: UI.MakeTextParams
    pressTextParams?: UI.MakeTextParams

    textureParams?: UI.MakeRoundedRectTextureParams
    hoverTextureParams?: UI.MakeRoundedRectTextureParams
    pressTextureParams?: UI.MakeRoundedRectTextureParams

    icon?: string

    iconParams?: Omit<SvgParameters, 'path'>
    hoverIconParams?: Omit<SvgParameters, 'path'>
    pressIconParams?: Omit<SvgParameters, 'path'>

    rounded?: 'all' | 'top' | 'bottom'

    radius?: number
}
export interface BaseButton extends Visibility {}
@visibility
export class BaseButton extends Sprite {
    w!: number
    h!: number

    constructor(deps: EffectDeps, params: BaseButtonParameters) {
        super(deps)

        return asyncConstructor(this, BaseButton.asyncConstructor, params)
    }

    private static async asyncConstructor(
        this: BaseButton,
        params: BaseButtonParameters
    ): Promise<void> {
        const renderer = this.effect.context(Sky.Renderer)

        this.position.x = params.x
        this.position.y = params.y

        this.__textView = UI.makeText({
            text: params.text,
            color: 0xffffff,
            fontSize: 20,

            ...(params.textParams ?? {}),
        })

        this.__hoverTextView = UI.makeText({
            text: params.text,
            color: 0x000000,
            fontSize: 20,

            ...(params.hoverTextParams ?? {}),
        })

        this.__pressTextView = UI.makeText({
            text: params.text,
            color: 0xffffff,
            fontSize: 20,

            ...(params.pressTextParams ?? {}),
        })

        await Promise.all([
            new Promise<void>(resolve => {
                this.__textView.sync(resolve)
            }),

            new Promise<void>(resolve => {
                this.__hoverTextView.sync(resolve)
            }),

            new Promise<void>(resolve => {
                this.__pressTextView.sync(resolve)
            }),
        ])

        this.__strokeWidth = params.textureParams?.strokeWidth ?? 2
        this.__hoverStrokeWidth = params.hoverTextureParams?.strokeWidth ?? 2
        this.__pressStrokeWidth = params.pressTextureParams?.strokeWidth ?? 2

        this.w =
            params.w ??
            Math.floor(this.__textView.geometry.boundingBox?.max.x! + (params.paddingX ?? 32)) * 2
        this.h =
            params.h ??
            Math.floor(this.__textView.geometry.boundingBox?.max.y! + (params.paddingY ?? 2)) * 2

        this.__texture = UI.makeRoundedRectTexture({
            w: this.w,
            h: this.h,
            color: 0x000000,
            opacity: 0,
            strokeColor: 0xffffff,
            strokeWidth: 2,

            radius: params.radius ?? 16,

            ...(params.textureParams ?? {}),

            pixelRatio: renderer.pixelRatio,
            rounded: params.rounded,
        })

        this.__hoverTexture = UI.makeRoundedRectTexture({
            w: this.w,
            h: this.h,
            radius: params.radius ?? 16,
            color: 0xffffff,
            opacity: 1,
            strokeColor: 0xffffff,
            strokeWidth: 2,

            ...(params.hoverTextureParams ?? {}),

            pixelRatio: renderer.pixelRatio,
            rounded: params.rounded,
        })

        this.__pressTexture = UI.makeRoundedRectTexture({
            w: this.w,
            h: this.h,
            radius: params.radius ?? 16,
            color: 0x000000,
            opacity: 0.5,
            strokeColor: 0xffffff,
            strokeWidth: 2,

            ...(params.pressTextureParams ?? {}),

            pixelRatio: renderer.pixelRatio,
            rounded: params.rounded,
        })

        const geometry = new Three.PlaneGeometry(1, 1, 1, 1)
        const material = (this.__material = new Three.MeshBasicMaterial({
            map: this.__texture,
            transparent: true,
            depthWrite: false,
        }))
        const plane = (this.__plane = new Three.Mesh(geometry, material))
        plane.position.x = this.w / 2
        plane.position.y = this.h / 2

        if (params.icon) {
            const icon = await new Svg({
                path: params.icon,
                ...params.iconParams!,
            })
            icon.position.x = this.w - 20
            icon.position.y = this.h / 2 - 1
            this.__icon = icon

            this.__iconColor = params.iconParams?.color
            this.__iconHoverColor = params.hoverIconParams?.color
            this.__iconPressColor = params.pressIconParams?.color
        }

        this.__textView!.position.x = this.w / 2
        this.__textView!.position.y = this.h / 2
        this.__hoverTextView!.position.x = this.w / 2
        this.__hoverTextView!.position.y = this.h / 2
        this.__pressTextView!.position.x = this.w / 2
        this.__pressTextView!.position.y = this.h / 2

        this.add(plane)
        this.add(this.__textView)
        this.__icon && this.add(this.__icon)

        this.__updateState()
    }

    protected onGlobalMouseMove(ev: Sky.MouseMoveEvent): void {
        if (ev.isCaptured) {
            this.__hovered = false
            this.__updateState()
            return
        }

        this.__hovered = this.__checkPoint(new Vector2(ev.x, ev.y))

        this.__updateState()

        if (this.__hovered) {
            ev.isCaptured = true
        }
    }

    protected onGlobalMouseDown(ev: Sky.MouseDownEvent): void {
        if (ev.isCaptured) {
            return
        }

        if (this.__hovered) {
            this.__waitClick = true

            ev.isCaptured = true
        }

        this.__updateState()
    }

    protected onGlobalMouseUp(ev: Sky.MouseUpEvent): void {
        if (ev.isCaptured) {
            return
        }

        if (this.__hovered && this.__waitClick) {
            this._onClick()

            ev.isCaptured = true
        }

        this.__waitClick = false

        this.__updateState()
    }

    protected _updateZOrder(ev: Sky.UpdateZOrderEvent): void {
        this.__plane.renderOrder = ev.z
        ++ev.z

        this.__textView.renderOrder = ev.z
        this.__hoverTextView.renderOrder = ev.z
        this.__pressTextView.renderOrder = ev.z
        ++ev.z

        if (this.__icon) {
            this.__icon.view.renderOrder = ev.z
            ++ev.z
        }
    }

    protected _onClick(): void {
        //
    }

    private __updateState(): void {
        if (!this.__material) {
            return
        }

        if (this.__hovered) {
            if (this.__waitClick) {
                this.__material.map = this.__pressTexture
                this.__plane.scale.set(
                    this.w + this.__pressStrokeWidth,
                    this.h + this.__pressStrokeWidth,
                    1
                )
                this.remove(this.__textView)
                this.remove(this.__hoverTextView)
                this.add(this.__pressTextView)
                this.__icon && this.__icon.applyColor(this.__iconPressColor!)
            } else {
                this.__material.map = this.__hoverTexture
                this.__plane.scale.set(
                    this.w + this.__hoverStrokeWidth,
                    this.h + this.__hoverStrokeWidth,
                    1
                )
                this.remove(this.__textView)
                this.add(this.__hoverTextView)
                this.remove(this.__pressTextView)
                this.__icon && this.__icon.applyColor(this.__iconHoverColor!)
            }
        } else {
            this.__material.map = this.__texture
            this.__plane.scale.set(this.w + this.__strokeWidth, this.h + this.__strokeWidth, 1)
            this.__plane.material = this.__material
            this.add(this.__textView)
            this.remove(this.__hoverTextView)
            this.remove(this.__pressTextView)
            this.__icon && this.__icon.applyColor(this.__iconColor!)
        }
    }

    private __checkPoint(point: Vector2): boolean {
        if (point.x >= 0 && point.x <= this.w) {
            if (point.y >= 0 && point.y <= this.h) {
                return true
            }
        }

        return false
    }

    private __plane!: Three.Mesh
    private __material!: Three.MeshBasicMaterial
    private __hovered: boolean = false
    private __waitClick: boolean = false

    private __texture!: Three.Texture
    private __hoverTexture!: Three.Texture
    private __pressTexture!: Three.Texture

    private __strokeWidth!: number
    private __hoverStrokeWidth!: number
    private __pressStrokeWidth!: number

    private __textView!: TextView
    private __hoverTextView!: TextView
    private __pressTextView!: TextView

    private __icon?: Svg
    private __iconColor?: Three.ColorRepresentation
    private __iconHoverColor?: Three.ColorRepresentation
    private __iconPressColor?: Three.ColorRepresentation
}
