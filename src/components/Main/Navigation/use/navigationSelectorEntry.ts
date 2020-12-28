import _store from '@/_store'
import store from '@/store'
import { computed, reactive } from 'vue'
import {
  NavigationItemType,
  EphemeralNavigationItemType
} from './navigationConstructor'
import { ThemeClaim } from '@/lib/styles'
import { isDefined } from '@/lib/util/array'

export type NavigationSelectorEntry = {
  type: NavigationItemType
  iconName: string
  iconMdi?: boolean
  hasNotification?: boolean
}

export type EphemeralNavigationSelectorEntry = {
  type: EphemeralNavigationItemType
  iconName: string
  iconMdi?: boolean
  colorClaim?: ThemeClaim<string> // 色
}

export const createItems = (notificationState: {
  channel: boolean
  dm: boolean
}): NavigationSelectorEntry[] => [
  {
    type: 'home',
    iconName: 'home',
    iconMdi: true,
    hasNotification: notificationState.channel
  },
  {
    type: 'channels',
    iconName: 'hash'
  },
  {
    type: 'activity',
    iconName: 'activity'
  },
  {
    type: 'users',
    iconName: 'user',
    hasNotification: notificationState.dm
  },
  {
    type: 'clips',
    iconName: 'bookmark',
    iconMdi: true
  }
]
export const ephemeralItems: Record<
  NonNullable<EphemeralNavigationItemType>,
  EphemeralNavigationSelectorEntry
> = {
  qall: {
    type: 'qall',
    iconName: 'phone',
    iconMdi: true,
    colorClaim: (_, common) => common.ui.qall
  }
}

const useNavigationSelectorEntry = () => {
  const unreadChannels = computed(() => [
    ...store.state.domain.me.unreadChannelsMap.values()
  ])
  const notificationState = reactive({
    channel: computed(() =>
      unreadChannels.value.some(c =>
        store.state.entities.channelsMap.has(c.channelId)
      )
    ),
    dm: computed(() =>
      unreadChannels.value.some(c =>
        store.state.entities.dmChannelsMap.has(c.channelId)
      )
    )
  })
  const entries = computed(() => createItems(notificationState))

  const hasActiveQallSession = computed(() => {
    return !!_store.getters.app.rtc.qallSession
  })
  const ephemeralEntries = computed(() =>
    [hasActiveQallSession.value ? ephemeralItems.qall : undefined].filter(
      isDefined
    )
  )

  return {
    entries,
    ephemeralEntries
  }
}
export default useNavigationSelectorEntry
