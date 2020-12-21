import { FileId, MessageId } from '@/types/entity-ids'
import { FileInfo, Message, MessageStamp } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setMessage(state, message: Message) {
    state.messagesMap.set(message.id, message)
  },
  extendMessagesMap(state, messages: Message[]) {
    messages.forEach(message => {
      state.messagesMap.set(message.id, message)
    })
  },
  deleteMessage(state, messageId: MessageId) {
    state.messagesMap.delete(messageId)
  },
  updateMessageStamps(
    state,
    { messageId, stamps }: { messageId: MessageId; stamps: MessageStamp[] }
  ) {
    const message = state.messagesMap.get(messageId)
    if (!message) return
    message.stamps = stamps
  },
  setMessagePinnedState(
    state,
    { messageId, pinned }: { messageId: MessageId; pinned: boolean }
  ) {
    const message = state.messagesMap.get(messageId)
    if (!message) return
    message.pinned = pinned
  },

  setFileMetaData(state, fileMetaData: FileInfo) {
    state.fileMetaDataMap.set(fileMetaData.id, fileMetaData)
  },
  deleteFileMetaData(state, fileId: FileId) {
    state.fileMetaDataMap.delete(fileId)
  }
})
