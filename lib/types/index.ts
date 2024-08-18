import { MessageBase } from './ai'

export type Message = MessageBase & {
  id: string
}

export type Stock = {
  symbol: string
  price: number
  delta: number
}

export type Event = {
  date: string
  headline: string
  description: string
}

export type Purchase = {
  numberOfShares?: number
  symbol: string
  price: number
  status: 'requires_action' | 'completed' | 'expired'
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, unknown> {
  id: string
  email: string
  password: string
  salt: string
}
