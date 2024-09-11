import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid,
  openRouterBaseUrl,
  mistralNanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import {
  getEventsParameters,
  listStocksParameters,
  showStockPriceParameters,
  showStockPurchaseParameters
} from '../types/tools'
import { APICallError, CoreMessage } from 'ai'

const defaultModelSlug = 'anthropic/claude-3.5-sonnet'
const defaultErrorMessage = 'An error occurred while processing your request.'
const systemMessage = `\
You are a stock trading conversation bot and you can help users buy stocks, step by step.
You and the user can discuss stock prices and the user can adjust the amount of stocks they want to buy, or place an order, in the UI.
You are allowed to show imaginary prices and changes in price. This is demonstration purposes only.

If the user requests purchasing a stock, call \`showStockPurchaseUI\` to show the purchase UI.
If the user just wants the price, call \`showStockPrice\` to show the price.
If you want to show trending stocks, call \`listStocks\`.
If you want to show events, call \`getEvents\`.
If the user wants to sell stock, or complete another impossible task, respond that you are a demo and cannot do that.

Don't forget to provide parameters to each tools.

Besides that, you can also chat with users and do some calculations if needed.`

const dummyAssistantMessage = {
  id: nanoid(),
  role: 'assistant',
  content: '[waiting for user input]'
} satisfies Message

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

function isAPICallError(error: unknown): error is APICallError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    'responseBody' in error
  )
}

const getErrorMessage = (error: unknown): string => {
  if (isAPICallError(error)) {
    return error.responseBody || error.message || defaultErrorMessage
  }
  return defaultErrorMessage
}

function isMistralModel(modelSlug?: string): boolean {
  return modelSlug === 'mistralai/mistral-large'
}

function isGeminiModel(modelSlug?: string): boolean {
  return (
    modelSlug === 'google/gemini-flash-1.5' ||
    modelSlug === 'google/gemini-pro-1.5'
  )
}

function shouldAddDummyAssistantMessage(modelSlug?: string): boolean {
  return isMistralModel(modelSlug) || isGeminiModel(modelSlug)
}

function getToolCallId(modelSlug?: string): string {
  return isMistralModel(modelSlug) ? mistralNanoid() : nanoid()
}

async function submitUserMessage(
  content: string,
  modelSlug?: string,
  openRouterKey?: string
) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const prevConversation = aiState.get().messages
  const userMessage = {
    id: nanoid(),
    role: 'user',
    content
  } satisfies Message

  aiState.update({
    ...aiState.get(),
    messages: [...prevConversation, userMessage]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const openrouter = createOpenRouter({
    baseURL: openRouterBaseUrl + '/api/v1/',
    apiKey: openRouterKey ?? process.env.OPENROUTER_API_KEY
    // send extra body parameters to openrouter if needed: https://openrouter.ai/docs
    // extraBody: {
    //   provider: {
    //     order: ['OctoAI', 'Lepton']
    //   }
    // }
  })
  const model = openrouter(modelSlug || defaultModelSlug)
  const messages = [
    {
      role: 'system',
      content: systemMessage
    },
    ...aiState.get().messages.map((message: any) => ({
      role: message.role,
      content: message.content,
      name: message.name
    }))
  ] satisfies CoreMessage[]

  let result

  try {
    result = await streamUI({
      model,
      initial: <SpinnerMessage />,
      messages,
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      tools: {
        listStocks: {
          description: 'List three imaginary stocks that are trending.',
          parameters: listStocksParameters,
          generate: async function* ({ stocks }) {
            yield (
              <BotCard>
                <StocksSkeleton />
              </BotCard>
            )

            await sleep(1000)

            const toolCallId = getToolCallId(modelSlug)

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'listStocks',
                      toolCallId,
                      args: { stocks }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'listStocks',
                      toolCallId,
                      result: stocks
                    }
                  ]
                },
                ...(shouldAddDummyAssistantMessage(modelSlug)
                  ? [dummyAssistantMessage]
                  : [])
              ]
            })

            return (
              <BotCard>
                <Stocks stocks={stocks} />
              </BotCard>
            )
          }
        },
        showStockPrice: {
          description:
            'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
          parameters: showStockPriceParameters,
          generate: async function* ({ symbol, price, delta }) {
            yield (
              <BotCard>
                <StockSkeleton />
              </BotCard>
            )

            await sleep(1000)

            const toolCallId = getToolCallId(modelSlug)

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPrice',
                      toolCallId,
                      args: { symbol, price, delta }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPrice',
                      toolCallId,
                      result: { symbol, price, delta }
                    }
                  ]
                },
                ...(shouldAddDummyAssistantMessage(modelSlug)
                  ? [dummyAssistantMessage]
                  : [])
              ]
            })

            return (
              <BotCard>
                <Stock stock={{ symbol, price, delta }} />
              </BotCard>
            )
          }
        },
        showStockPurchase: {
          description:
            'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
          parameters: showStockPurchaseParameters,
          generate: async function* ({ symbol, price, numberOfShares = 100 }) {
            const toolCallId = getToolCallId(modelSlug)

            if (numberOfShares <= 0 || numberOfShares > 1000) {
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    id: nanoid(),
                    role: 'assistant',
                    content: [
                      {
                        type: 'tool-call',
                        toolName: 'showStockPurchase',
                        toolCallId,
                        args: { symbol, price, numberOfShares }
                      }
                    ]
                  },
                  {
                    id: nanoid(),
                    role: 'tool',
                    content: [
                      {
                        type: 'tool-result',
                        toolName: 'showStockPurchase',
                        toolCallId,
                        result: {
                          symbol,
                          price,
                          numberOfShares,
                          status: 'expired'
                        }
                      }
                    ]
                  },
                  ...(shouldAddDummyAssistantMessage(modelSlug)
                    ? [dummyAssistantMessage]
                    : []),
                  {
                    id: nanoid(),
                    role: 'system',
                    content: `[User has selected an invalid amount]`
                  }
                ]
              })

              return <BotMessage content={'Invalid amount'} />
            } else {
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    id: nanoid(),
                    role: 'assistant',
                    content: [
                      {
                        type: 'tool-call',
                        toolName: 'showStockPurchase',
                        toolCallId,
                        args: { symbol, price, numberOfShares }
                      }
                    ]
                  },
                  {
                    id: nanoid(),
                    role: 'tool',
                    content: [
                      {
                        type: 'tool-result',
                        toolName: 'showStockPurchase',
                        toolCallId,
                        result: {
                          symbol,
                          price,
                          numberOfShares,
                          status: 'requires_action'
                        }
                      }
                    ]
                  },
                  ...(shouldAddDummyAssistantMessage(modelSlug)
                    ? [dummyAssistantMessage]
                    : [])
                ]
              })

              return (
                <BotCard>
                  <Purchase
                    purchase={{
                      numberOfShares,
                      symbol,
                      price: +price,
                      status: 'requires_action'
                    }}
                  />
                </BotCard>
              )
            }
          }
        },
        getEvents: {
          description:
            'List funny imaginary events between user highlighted dates that describe stock activity.',
          parameters: getEventsParameters,
          generate: async function* ({ events }) {
            yield (
              <BotCard>
                <EventsSkeleton />
              </BotCard>
            )

            await sleep(1000)

            const toolCallId = getToolCallId(modelSlug)

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'getEvents',
                      toolCallId,
                      args: { events }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'getEvents',
                      toolCallId,
                      result: events
                    }
                  ]
                },
                ...(shouldAddDummyAssistantMessage(modelSlug)
                  ? [dummyAssistantMessage]
                  : [])
              ]
            })

            return (
              <BotCard>
                <Events events={events} />
              </BotCard>
            )
          }
        }
      }
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return {
      id: nanoid(),
      display: <BotMessage content={errorMessage} />
    }
  }

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            switch (tool.toolName) {
              case 'listStocks':
                return <Stocks stocks={tool.result} />
              case 'showStockPrice':
                return <Stock stock={tool.result} />
              case 'showStockPurchase':
                return <Purchase purchase={tool.result} />
              case 'getEvents':
                return <Events events={tool.result} />
              default:
                return null
            }
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
