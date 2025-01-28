import '../styles/global.css'
import '../styles/sb-admin-2.css'
//import '../public/fontawesome-free/css/all.css'

import * as RootState from '../components/states/RootState'
import { PageRelatedContextWrapper } from '../components/states/PageRelatedState'
import { PaymentExpenseStateWrapper} from '../components/states/PaymentExpenseState'

export default function App({ Component, pageProps }) {
    return <RootState.RootPageStateWrapper>
        <PageRelatedContextWrapper>
            <PaymentExpenseStateWrapper>
                <Component {...pageProps} />
            </PaymentExpenseStateWrapper>
        </PageRelatedContextWrapper>
    </RootState.RootPageStateWrapper>
}
