import globalify from 'sky/utilities/globalify'

import { __systems } from './__systems'

declare global {
    function defineSystem(systemName: string, Class: Class): void
}

namespace lib {
    export function defineSystem(systemName: string, Class: Class): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(__systems as any)[systemName] = Class
    }
}

globalify(lib)
