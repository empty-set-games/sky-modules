import globalify from 'sky/utilities/globalify'

import * as lib from '.'

globalify({ asyncConstructor: lib.default })

declare global {
    function asyncConstructor<T, A extends unknown[]>(
        This: Promise<T> | T,
        asyncConstructor: (this: T, ...args: A) => void,
        ...args: A
    ): T
}
