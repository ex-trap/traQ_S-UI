<template>
  <main-view-header-popup-frame>
    <header-tools-menu-item
      v-if="isMobile"
      icon-name="phone"
      icon-mdi
      :class="$style.qallIcon"
      :label="qallLabel"
      :disabled="
        isArchived ||
        (hasActiveQallSession &&
          (!isJoinedQallSession || !isJoinedWithCurrentDevice))
      "
      :data-is-active="$boolAttr(isQallSessionOpened)"
      @click="emit('click-qall')"
    />
    <header-tools-menu-item
      v-if="isChildChannelCreatable"
      icon-name="hash"
      label="子チャンネルを作成"
      @click="emit('click-create-channel')"
    />
    <header-tools-menu-item
      v-if="showNotificationSettingBtn"
      icon-name="notified-or-subscribed"
      label="通知設定"
      @click="emit('click-notification')"
    />
    <header-tools-menu-item
      icon-name="search"
      icon-mdi
      label="チャンネル内検索"
      @click="emit('click-search')"
    />
    <header-tools-menu-item
      icon-name="link"
      icon-mdi
      label="チャンネルリンクをコピー"
      @click="emit('click-copy-channel-link')"
    />
    <header-tools-menu-item
      v-if="hasChannelEditPermission"
      icon-name="hash"
      :class="$style.manageChannel"
      label="チャンネル管理"
      @click="emit('click-manage-channel')"
    />
  </main-view-header-popup-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import MainViewHeaderPopupFrame from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupFrame.vue'
import HeaderToolsMenuItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderPopupMenuItem.vue'
import useIsMobile from '@/use/isMobile'
import store from '@/store'
import { UserPermission } from '@traptitech/traq'

export default defineComponent({
  name: 'ChannelViewHeaderToolsMenu',
  components: {
    MainViewHeaderPopupFrame,
    HeaderToolsMenuItem
  },
  props: {
    showNotificationSettingBtn: { type: Boolean, default: true },
    hasActiveQallSession: { type: Boolean, default: false },
    isQallSessionOpened: { type: Boolean, default: false },
    isJoinedQallSession: { type: Boolean, default: false },
    isJoinedWithCurrentDevice: { type: Boolean, default: false },
    isChildChannelCreatable: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const { isMobile } = useIsMobile()
    const qallLabel = computed(() => {
      if (props.isQallSessionOpened) {
        if (props.isJoinedWithCurrentDevice) {
          return 'Qallを終了'
        }
        if (props.isJoinedQallSession) {
          return '別のデバイスでQall中'
        }
        return 'Qallに参加'
      }
      if (props.hasActiveQallSession) {
        return '他チャンネルでQall中'
      }
      return 'Qallを開始'
    })
    const hasChannelEditPermission = computed(() =>
      store.state.domain.me.detail?.permissions.includes(
        UserPermission.EditChannel
      )
    )
    return { emit, isMobile, qallLabel, hasChannelEditPermission }
  }
})
</script>

<style lang="scss" module>
.qallIcon {
  &[data-is-active] {
    color: $common-ui-qall;
  }
}
.manageChannel {
  color: $theme-accent-error;
}
</style>
