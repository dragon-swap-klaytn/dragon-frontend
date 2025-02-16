import { useTranslation } from '@pancakeswap/localization'
import { PoolType } from 'types'
import Header from 'views/Dashboard/components/Header'
import TransactionTable from 'views/Dashboard/components/TransactionsTable'
import useOverviewData from 'views/Dashboard/hooks/useOverviewData'

export default function Transactions({ poolType = 'v3' }: { poolType: PoolType }) {
  const { t } = useTranslation()

  // const transactions = useProtocolTransactions(poolType)
  const { transactions } = useOverviewData(poolType)

  return (
    <div className="w-full flex flex-col items-start space-y-5">
      <Header id="transactions" title={t('Transactions')} />

      <TransactionTable transactions={transactions} />
    </div>
  )
}
