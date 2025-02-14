import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import clsx from 'clsx'

export default function Pagination({
  page,
  totalPage,
  setPage,
}: {
  page: number
  totalPage: number
  setPage: (page: number) => void
}) {
  if (!totalPage) return null
  return (
    <div className="w-full flex items-center justify-start space-x-4">
      <button
        type="button"
        className={clsx('disabled:text-on-surface-disable disabled:cursor-not-allowed', {
          'text-on-surface hover:opacity-70': page !== 1,
        })}
        onClick={() => setPage(page === 1 ? page : page - 1)}
        disabled={page === 1}
      >
        <ArrowLeft weight="bold" />
      </button>

      <span className="text-on-surface">
        {page}&nbsp;/&nbsp;{totalPage}
      </span>

      <button
        type="button"
        className={clsx('disabled:text-on-surface-disable disabled:cursor-not-allowed', {
          'text-on-surface hover:opacity-70': page !== totalPage,
        })}
        onClick={() => setPage(page === totalPage ? page : page + 1)}
        disabled={page === totalPage}
      >
        <ArrowRight weight="bold" />
      </button>
    </div>
  )
}
