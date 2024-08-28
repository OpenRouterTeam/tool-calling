'use client'

import { useActions, useUIState } from 'ai/rsc'

import type { AI } from '@/lib/chat/actions'
import type { Stock } from '@/lib/types'
import { useQueryState } from 'nuqs'
import { handleMessageSubmission } from '@/lib/chat/utils'

export function Stocks({ stocks }: { stocks: Stock[] }) {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const [modelSlug, _] = useQueryState('modelSlug')

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
        {stocks.map(stock => (
          <button
            key={stock.symbol}
            className="flex cursor-pointer flex-row gap-2 rounded-lg bg-white dark:bg-zinc-800 p-2 text-left hover:bg-zinc-700 sm:w-52"
            onClick={() =>
              handleMessageSubmission(
                `View ${stock.symbol}`,
                modelSlug,
                setMessages,
                submitUserMessage,
                false
              )
            }
          >
            <div
              className={`text-xl ${
                stock.delta > 0 ? 'text-green-600' : 'text-red-600'
              } flex w-11 flex-row justify-center rounded-md bg-white/10 p-2`}
            >
              {stock.delta > 0 ? '↑' : '↓'}
            </div>
            <div className="flex flex-col">
              <div className="bold uppercase text-zinc-300">{stock.symbol}</div>
              <div className="text-base text-zinc-500">
                ${stock.price.toExponential(1)}
              </div>
            </div>
            <div className="ml-auto flex flex-col">
              <div
                className={`${
                  stock.delta > 0 ? 'text-green-600' : 'text-red-600'
                } bold text-right uppercase`}
              >
                {` ${((stock.delta / stock.price) * 100).toExponential(1)}%`}
              </div>
              <div
                className={`${
                  stock.delta > 0 ? 'text-green-700' : 'text-red-700'
                } text-right text-base`}
              >
                {stock.delta.toExponential(1)}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 text-center text-sm text-zinc-500">
        Note: Data and latency are simulated for illustrative purposes and
        should not be considered as financial advice.
      </div>
    </div>
  )
}
