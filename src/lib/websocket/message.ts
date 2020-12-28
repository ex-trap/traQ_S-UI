import apis from '@/lib/apis'
import store from '@/store'
import _store from '@/_store'
import { MessageCreatedEvent } from './events'
import { tts } from '../tts'

export const onMessageCreated = async ({ id }: MessageCreatedEvent) => {
  const res = await apis.getMessage(id)

  if (res.data.userId !== _store.state.domain.me.detail?.id) {
    const userDisplayName =
      store.state.entities.usersMap.get(res.data.userId)?.displayName ??
      'はてな'
    tts.addQueue({
      channelId: res.data.channelId,
      userDisplayName,
      text: res.data.content
    })
  }
}
