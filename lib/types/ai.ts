import { EAToolCallPart, EAToolResultPart } from './tools'

type DataContent = string | Uint8Array | ArrayBuffer | Buffer
interface ImagePart {
  type: 'image'
  /**
Image data. Can either be:

- data: a base64-encoded string, a Uint8Array, an ArrayBuffer, or a Buffer
- URL: a URL that points to the image
   */
  image: DataContent | URL
  /**
Optional mime type of the image.
   */
  mimeType?: string
}

type TextPart$1 = {
  type: 'text'
  text: string
}

type UserContent = string | Array<TextPart$1 | ImagePart>

type SystemMessage = {
  role: 'system'
  content: string
}

type UserMessage = {
  role: 'user'
  content: UserContent
}

type AssistantContent = string | Array<TextPart | EAToolCallPart>

type AssistantMessage = {
  role: 'assistant'
  content: AssistantContent
}
type ToolMessage = {
  role: 'tool'
  content: ToolContent
}
type ToolContent = Array<EAToolResultPart>

type TextPart = {
  type: 'text'
  text: string
}

export type MessageBase =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolMessage
