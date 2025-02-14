import { useTranslation } from '@pancakeswap/localization'
import { DashboardPoolType } from 'pages/dashboard'
import Header from 'views/Dashboard/components/Header'
import TransactionTable from 'views/Dashboard/components/TransactionsTable'
import useOverviewData from 'views/Dashboard/hooks/useOverviewData'

export default function Transactions({ poolType = 'v3' }: { poolType: DashboardPoolType }) {
  const { t } = useTranslation()

  // const transactions = useProtocolTransactions(poolType)
  const { transactions } = useOverviewData(poolType)

  return (
    <div className="w-full flex flex-col items-start space-y-5">
      <Header title={t('Transactions')} />

      <TransactionTable transactions={transactions} />
    </div>
  )
}
