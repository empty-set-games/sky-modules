import Three from 'pkgs/three'
import globalify from 'sky/utilities/globalify'

declare global {
    namespace Sky {
        interface PerspectiveCameraParameters extends SkyModule.PerspectiveCameraParameters {}

        class PerspectiveCamera extends SkyModule.PerspectiveCamera {}
    }
}

namespace SkyModule {
    export interface PerspectiveCameraParameters {
        fov?: () => number
        aspect?: () => number
        near: () => number
        far: () => number
    }
    export class PerspectiveCamera extends Three.PerspectiveCamera {
        constructor(deps: EffectDeps, parameters: PerspectiveCameraParameters) {
            const aspect =
                parameters.aspect ?? ((): number => window.innerWidth / window.innerHeight)

            super(
                parameters.fov ? parameters.fov() : 120,
                aspect(),
                parameters.near(),
                parameters.far()
            )

            new WindowEventListener(
                'resize',
                () => {
                    this.aspect = aspect()
                    this.updateProjectionMatrix()
                },
                deps
            )
        }
    }
}

globalify.namespace('Sky', SkyModule)
