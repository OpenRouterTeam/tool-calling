import { Event, Purchase, Stock } from '.'
import { z } from 'zod'

type ToolResultPart<TName = string, TResult = unknown> = {
  type: 'tool-result'
  /**
ID of the tool call that this result is associated with.
 */
  toolCallId: string
  /**
Name of the tool that generated this result.
  */
  toolName: TName
  /**
Result of the tool call. This is a JSON-serializable object.
   */
  result: TResult
  /**
Optional flag if the result is an error or an error message.
   */
  isError?: boolean
}

type ToolCallPart<TName = string, TArgs = unknown> = {
  type: 'tool-call'
  /**
ID of the tool call. This ID is used to match the tool call with the tool result.
 */
  toolCallId: string
  /**
Name of the tool that is being called.
 */
  toolName: TName
  /**
Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
   */
  args: TArgs
}

export const showStockPurchaseParameters = z.object({
  symbol: z
    .string()
    .describe(
      'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
    ),
  price: z.number().describe('The price of the stock.'),
  numberOfShares: z
    .number()
    .optional()
    .describe(
      'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
    )
})

export const showStockPriceParameters = z.object({
  symbol: z
    .string()
    .describe(
      'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
    ),
  price: z.number().describe('The price of the stock.'),
  delta: z.number().describe('The change in price of the stock')
})

export const getEventsParameters = z.object({
  events: z.array(
    z.object({
      date: z.string().describe('The date of the event, in ISO-8601 format'),
      headline: z.string().describe('The headline of the event'),
      description: z.string().describe('The description of the event')
    })
  )
})

export const listStocksParameters = z.object({
  stocks: z.array(
    z.object({
      symbol: z.string().describe('The symbol of the stock'),
      price: z.number().describe('The price of the stock'),
      delta: z.number().describe('The change in price of the stock')
    })
  )
})

export type EAToolCallPart =
  | ToolCallPart<'listStocks', z.infer<typeof listStocksParameters>>
  | ToolCallPart<'getEvents', z.infer<typeof getEventsParameters>>
  | ToolCallPart<'showStockPrice', z.infer<typeof showStockPriceParameters>>
  | ToolCallPart<
      'showStockPurchase',
      z.infer<typeof showStockPurchaseParameters>
    >

export type EAToolResultPart =
  | ToolResultPart<'listStocks', Stock[]>
  | ToolResultPart<'getEvents', Event[]>
  | ToolResultPart<'showStockPrice', Stock>
  | ToolResultPart<'showStockPurchase', Purchase>
