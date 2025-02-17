<template>
  <div
    :class="$style.container"
    :aria-selected="state.isSelected"
    :data-is-inactive="$boolAttr(state.isInactive)"
  >
    <!-- チャンネル表示本体 -->
    <div
      :class="$style.channel"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <channel-element-hash
        :class="$style.channelHash"
        :has-child="!ignoreChildren && state.hasChild"
        :is-selected="state.isSelected"
        :is-opened="isOpened"
        :has-notification="notificationState.hasNotification"
        :has-notification-on-child="notificationState.hasNotificationOnChild"
        :is-inactive="state.isInactive"
        @click="onChannelHashClick"
        @mouseenter="onHashMouseEnter"
        @mouseleave="onHashMouseLeave"
      />
      <channel-element-name
        :channel="channel"
        :show-shortened-path="showShortenedPath"
        :is-selected="state.isSelected"
        @click="onChannelNameClick"
      />
      <channel-element-unread-badge
        :is-noticeable="notificationState.isNoticeable"
        :unread-count="notificationState.unreadCount"
        @click="onChannelNameClick"
      />
    </div>
    <channel-element-topic
      v-if="showTopic"
      :class="$style.topic"
      :channel-id="channel.id"
      @click="onChannelNameClick"
    />

    <!-- 子チャンネル表示 -->
    <channel-list
      :is-shown="!ignoreChildren && isOpened"
      :class="$style.children"
      :channels="state.children"
    />

    <!-- チャンネルの背景 -->
    <div
      v-if="state.isSelected || isChannelBgHovered"
      :class="$style.selectedBg"
      :data-is-hovered="$boolAttr(isChannelBgHovered)"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  PropType,
  Ref,
  defineAsyncComponent
} from 'vue'
import store from '@/store'
import { ChannelTreeNode } from '@/lib/channelTree'
import { ChannelId } from '@/types/entity-ids'
import ChannelElementHash from './ChannelElementHash.vue'
import ChannelElementTopic from './ChannelElementTopic.vue'
import ChannelElementUnreadBadge from './ChannelElementUnreadBadge.vue'
import ChannelElementName from './ChannelElementName.vue'
import { deepSome } from '@/lib/util/tree'
import { Channel } from '@traptitech/traq'
import useHover from '@/use/hover'

const useChannelClick = (
  context: SetupContext,
  id: ChannelId,
  isChildShown: Ref<boolean>
) => {
  const onChannelNameClick = () => context.emit('channel-select', id)
  const onChannelHashClick = () => {
    context.emit(
      isChildShown.value ? 'channel-folding-toggle' : 'channel-select',
      id
    )
  }
  return {
    onChannelHashClick,
    onChannelNameClick
  }
}

const useNotification = (props: TypedProps) => {
  const unreadChannel = computed(() =>
    store.state.domain.me.unreadChannelsMap.get(props.channel.id)
  )

  const notificationState = reactive({
    hasNotification: computed(() => !!unreadChannel.value),
    hasNotificationOnChild: computed(() =>
      props.ignoreChildren
        ? false
        : deepSome(props.channel, channel =>
            store.state.domain.me.unreadChannelsMap.has(channel.id)
          )
    ),
    unreadCount: computed(() => unreadChannel.value?.count),
    isNoticeable: computed(() => unreadChannel.value?.noticeable)
  })
  return notificationState
}

interface Props {
  channel: ChannelTreeNode | Channel
  isOpened: boolean
  ignoreChildren: boolean
  showShortenedPath: boolean
  showTopic: boolean
}

interface WithChildrenProps extends Props {
  channel: ChannelTreeNode
  showShortenedPath: false
  ignoreChildren: false
}

interface IgnoreChildrenProps extends Props {
  channel: Channel
  showShortenedPath: true
  ignoreChildren: true
}

type TypedProps = WithChildrenProps | IgnoreChildrenProps

// 型エラー・コンポーネント循環参照の回避
const ChannelList = defineAsyncComponent(() => import('./ChannelList.vue'))

export default defineComponent({
  name: 'ChannelElement',
  components: {
    ChannelList,
    ChannelElementHash,
    ChannelElementTopic,
    ChannelElementUnreadBadge,
    ChannelElementName
  },
  props: {
    /** 対象チャンネル */
    channel: {
      type: Object as PropType<ChannelTreeNode | Channel>,
      required: true
    },
    /** 子チャンネルを展開表示しているか */
    isOpened: {
      type: Boolean,
      default: false
    },
    /** 子チャンネルを無視する */
    ignoreChildren: {
      type: Boolean,
      default: false
    },
    showShortenedPath: {
      type: Boolean,
      default: false
    },
    showTopic: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const typedProps = props as TypedProps

    const state = reactive({
      children: computed(() =>
        typedProps.ignoreChildren
          ? []
          : typedProps.channel.children.filter(ch => !ch.archived)
      ),
      hasChild: computed((): boolean => state.children.length > 0),
      isInactive: computed(
        () => !typedProps.ignoreChildren && !typedProps.channel.active
      ),
      isSelected: computed(
        () =>
          store.state.domain.messagesView.currentChannelId ===
          typedProps.channel.id
      )
    })
    const isChildShown = computed(() => !props.ignoreChildren && state.hasChild)

    const { onChannelHashClick, onChannelNameClick } = useChannelClick(
      context,
      typedProps.channel.id,
      isChildShown
    )
    const notificationState = useNotification(typedProps)

    const { isHovered, onMouseEnter, onMouseLeave } = useHover()
    const {
      isHovered: isHashHovered,
      onMouseEnter: onHashMouseEnter,
      onMouseLeave: onHashMouseLeave
    } = useHover()
    const isChannelBgHovered = computed(
      () => isHovered.value && !(state.hasChild && isHashHovered.value)
    )

    return {
      state,
      notificationState,
      onChannelHashClick,
      onChannelNameClick,
      onMouseEnter,
      onMouseLeave,
      onHashMouseEnter,
      onHashMouseLeave,
      isChannelBgHovered
    }
  }
})
</script>

<style lang="scss" module>
$elementHeight: 32px;
$bgHeight: 36px;
$bgLeftShift: 8px;
$topicLeftPadding: 40px;

.container {
  @include color-ui-primary;
  display: block;
  user-select: none;
  position: relative;
  contain: layout;
  &[data-is-inactive] {
    @include color-ui-secondary;
  }
  &[aria-selected='true'] {
    @include color-accent-primary;
  }
}
.channel {
  display: flex;
  align-items: center;
  position: relative;
  height: $elementHeight;
  padding-right: 4px;
  margin-left: $bgLeftShift;
  z-index: 0;
}
.channelHash {
  flex-shrink: 0;
  cursor: pointer;
}
.children {
  display: block;
  position: relative;
  z-index: 0;
  margin-left: 20px;
}
.selectedBg {
  position: absolute;
  width: calc(100% + #{$bgLeftShift});
  height: $bgHeight;
  top: -($bgHeight - $elementHeight)/2;
  left: 0;
  z-index: 0;
  border-top-left-radius: 100vw;
  border-bottom-left-radius: 100vw;
  opacity: 0.1;
  pointer-events: none;

  display: none;
  .container[aria-selected='true'] > & {
    @include background-accent-primary;
    display: block;
  }
  &[data-is-hovered] {
    display: block;
    background: $theme-ui-primary;
  }
}
.topic {
  padding: {
    left: $topicLeftPadding + $bgLeftShift;
    right: 8px;
  }
}
</style>
