import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import api from '@/lib/api'
import { me } from './index'
import { ChannelId } from '@/types/entity-ids'

export const meActionContext = (context: any) =>
  moduleActionContext(context, me)

export const actions = defineActions({
  async fetchUnreadChannels(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMyUnreadChannels()
    commit.setUnreadChannelsSet(res.data)
  },

  /** チャンネルを既読にする */
  readChannel(context, payload: { channelId: ChannelId }) {
    const { commit } = meActionContext(context)
    commit.deleteUnreadChannel(payload.channelId)
    api.readChannel(payload.channelId)
  },

  async fetchStaredChannels(context) {
    const { commit } = meActionContext(context)
    const result = await api.getMyStars()
    commit.setStaredChannels(result.data)
  },
  async starChannel(context, id: ChannelId) {
    await api.addMyStar({
      channelId: id
    })
  },
  async unstarChannel(context, id: ChannelId) {
    await api.removeMyStar(id)
  },
  async fetchStampHistory(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMyStampHistory()
    const history = Object.fromEntries(
      res.data.map(h => [h.stampId, new Date(h.datetime)])
    )
    commit.setStampHistory(history)
  },
  async fetchMe(context) {
    const { commit } = meActionContext(context)
    const res = await api.getMe()
    commit.setDetail(res.data)
  }
})
