import '#/client/imports'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import useData from 'sky/platform/web/renderer/useData'

import PageLayout from '#/layouts/PageLayout'

import HomePageData from './+data'
import Counter from './Counter'
import { onTest } from './HomePage.telefunc'
import A from './A'
import B from './B'

const a = new A()
const b = new B()

console.log(a, b, a.foo(), b.foo())

export default observer(function HomePage(): ReactNode {
    const { t } = useTranslation()

    useData(HomePageData)

    useEffect(() => {
        onTest(42)
    }, [])

    return (
        <PageLayout>
            {t`title`}
            <br />
            <Counter />
        </PageLayout>
    )
})
