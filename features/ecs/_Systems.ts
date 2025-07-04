import globalify from 'sky/utilities/globalify'

import { __systems } from './__systems'

declare global {
    class Systems extends lib.Systems {}
}

namespace lib {
    export class Systems {
        static context = true

        readonly effect: Effect

        constructor(deps: EffectDeps) {
            this.effect = new Effect(deps, this)

            this.__systemsMap = {}

            Object.keys(__systems).forEach(systemName => {
                const system = new __systems[systemName]()
                ;(this as never as Record<string, System>)[systemName] = system
                const { components } = system.constructor as never as { components: string[] }
                components.forEach(componentName => {
                    this.__systemsMap[componentName] ??= []
                    if (!this.__systemsMap[componentName].includes(system)) {
                        this.__systemsMap[componentName].push(system)
                    }
                })
            })
        }

        protected update(ev: Sky.UpdateEvent): void {
            this.__timer ??= new Timer('[Systems].run')
            Object.keys(__systems).forEach(systemName => {
                const system = (this as never as Record<string, System>)[systemName] as System
                const systemWithUpdate = system as { update?: (ev: Sky.UpdateEvent) => void }
                systemWithUpdate.update && systemWithUpdate.update(ev)
            })
        }

        private __systemsMap: Record<string, System[]>
        private __timer!: Timer
    }
}

globalify(lib)
