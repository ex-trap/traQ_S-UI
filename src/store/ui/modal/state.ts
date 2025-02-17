import {
  UserId,
  ChannelId,
  FileId,
  UserGroupId,
  TagId,
  MessageId
} from '@/types/entity-ids'
import { RouteName } from '@/router'

type ModalStateType =
  | 'user'
  | 'group'
  | 'notification'
  | 'file'
  | 'tag'
  | 'group'
  | 'channel-create'
  | 'qrcode'
  | 'clip-create'
  | 'clip-folder-create'
  | 'channel-manage'

export type ModalState =
  | UserModalState
  | NotificationModalState
  | FileModalState
  | GroupModalState
  | TagModalState
  | ChannelCreateModalState
  | QrCodeModalState
  | ClipCreateModalState
  | ClipFolderCreateModalState
  | ChannelManageModalState

interface BaseModalState {
  /** モーダル種別 */
  type: ModalStateType

  /** モーダルがルートに紐づいているか (例: ファイルモーダル) */
  relatedRoute?: RouteName
}

interface UserModalState extends BaseModalState {
  type: 'user'
  id: UserId
}

interface NotificationModalState extends BaseModalState {
  type: 'notification'
  channelId: ChannelId
}

interface FileModalState extends BaseModalState {
  type: 'file'
  id: FileId
  relatedRoute: RouteName.File
}

interface GroupModalState extends BaseModalState {
  type: 'group'
  id: UserGroupId
}

interface TagModalState extends BaseModalState {
  type: 'tag'
  id: TagId
}

interface ChannelCreateModalState extends BaseModalState {
  type: 'channel-create'

  /**
   * 親チャンネルのID
   *
   * 指定しない場合は親チャンネルが指定可能な作成画面になる
   */
  parentChannelId?: ChannelId
}

interface QrCodeModalState extends BaseModalState {
  type: 'qrcode'
}

interface ClipCreateModalState extends BaseModalState {
  type: 'clip-create'
  messageId: MessageId
}

interface ClipFolderCreateModalState extends BaseModalState {
  type: 'clip-folder-create'
}

interface ChannelManageModalState extends BaseModalState {
  type: 'channel-manage'
  id: ChannelId
}

export interface S {
  modalState: ModalState[]

  /** ロード時からモーダルを表示していて、そこからモーダルを閉じたことがないか */
  isOnInitialModalRoute: boolean

  /** モーダルを非表示にしようとしている最中か */
  isClearingModal: boolean
}

export const state: S = {
  modalState: [],
  isOnInitialModalRoute: false,
  isClearingModal: false
}
