import { nanoid } from 'nanoid'
import { ErrorMessage } from '@/components/ui/error-message'
import { UserMessage } from '@/components/stocks/message'
import React from 'react'

interface Message {
  id: string
  display: React.ReactNode
}

type SetMessagesFunction = (
  updater: (currentMessages: Message[]) => Message[]
) => void

type SubmitUserMessageFunction = (
  message: string,
  modelSlug: string | null
) => Promise<Message>

export async function handleMessageSubmission(
  message: string,
  modelSlug: string | null,
  setMessages: SetMessagesFunction,
  submitUserMessage: SubmitUserMessageFunction,
  shouldAppendOptimisticUserMessage: boolean = true
): Promise<void> {
  if (shouldAppendOptimisticUserMessage) {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{message}</UserMessage>
      }
    ])
  }

  try {
    const responseMessage = await submitUserMessage(message, modelSlug)
    setMessages(currentMessages => [...currentMessages, responseMessage])
  } catch (error) {
    console.error('Error submitting user message:', error)
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <ErrorMessage modelSlug={modelSlug} />
      }
    ])
  }
}