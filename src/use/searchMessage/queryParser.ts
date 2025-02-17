// APIに投げる検索クエリに対する実装
import apis from '@/lib/apis'
import { ChannelId, MessageId, UserId } from '@/types/entity-ids'
import {
  channelParser,
  dateParser,
  ExtractedFilter,
  parseToFilter as parseToFilterBase,
  FilterExtractor,
  FilterParser,
  makePrefixedFilterExtractor,
  messageParser,
  rawQuery,
  userParser
} from './parserBase'

/** APIに投げる型 */
type SearchMessageQuery = Parameters<typeof apis.searchMessages>

/** ソートのキー */
export type SearchMessageSortKey = SearchMessageQuery[15]

/** APIに投げる型のオブジェクト版 */
type SearchMessageQueryObject = {
  word?: string
  after?: string
  before?: string
  in?: string
  to?: string
  from?: string
  citation?: string
  bot?: boolean
  hasUrl?: boolean
  hasAttachments?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
}

/** is:系のフィルターで使う */
type AttrFlagFilterKey = 'bot'

/** has:系のフィルターで使う */
type MediaFlagFilterKey = 'attachments' | 'image' | 'audio' | 'video'

/** フィルターの実装 */
export type Filter =
  | { type: 'after'; raw: string; value: Date }
  | { type: 'before'; raw: string; value: Date }
  | { type: 'in'; raw: string; value: ChannelId }
  | { type: 'to'; raw: string; value: UserId }
  | { type: 'from'; raw: string; value: UserId }
  | { type: 'citation'; raw: string; value: MessageId }
  | { type: 'attrFlag'; raw: string; value: AttrFlagFilterKey; negate: boolean }
  | {
      type: 'mediaFlag'
      raw: string
      value: MediaFlagFilterKey
      negate: boolean
    }
export type FilterType = Filter['type']

/** フィルターを得るためのextractor */
const filterExtractors: FilterExtractor<FilterType>[] = [
  makePrefixedFilterExtractor('after', ['after:', 'since:']),
  makePrefixedFilterExtractor('before', ['before:', 'until:']),
  makePrefixedFilterExtractor('in', ['in:', '#']),
  makePrefixedFilterExtractor('to', ['to:', '@']),
  makePrefixedFilterExtractor('from', ['from:', 'by:']),
  makePrefixedFilterExtractor('citation', ['citation:', 'cite:']),
  makePrefixedFilterExtractor('attrFlag', ['is:'], ['-is:', 'not:']),
  makePrefixedFilterExtractor('mediaFlag', ['has:'], ['-has:'])
]

/** extractorの実装 */
const extractor: FilterExtractor<FilterType> = q => {
  for (const extractor of filterExtractors) {
    const result = extractor(q)
    if (typeof result === 'string') {
      continue
    }
    return result
  }
  return q
}

// フィルタの内容に依存しているparser

const attrFlagParser: FilterParser<
  FilterType,
  AttrFlagFilterKey
> = extracted => {
  switch (extracted.body) {
    case 'bot':
      return extracted.body
    default:
      return undefined
  }
}

const mediaFlagParser: FilterParser<
  FilterType,
  MediaFlagFilterKey
> = extracted => {
  switch (extracted.body) {
    case 'attachments':
    case 'image':
    case 'video':
    case 'audio':
      return extracted.body
    default:
      return undefined
  }
}

// parserの実装

const parser = async (
  extracted: ExtractedFilter<FilterType>
): Promise<Filter | undefined> => {
  const type = extracted.type
  switch (type) {
    case 'after':
    case 'before': {
      const result = dateParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'in': {
      const result = channelParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'to':
    case 'from': {
      const result = await userParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'citation': {
      const result = messageParser(extracted)
      return result
        ? { type, raw: rawQuery(extracted), value: result }
        : undefined
    }
    case 'attrFlag': {
      const result = attrFlagParser(extracted)
      return result
        ? {
            type,
            raw: rawQuery(extracted),
            value: result,
            negate: extracted.negate
          }
        : undefined
    }
    case 'mediaFlag': {
      const result = mediaFlagParser(extracted)
      return result
        ? {
            type,
            raw: rawQuery(extracted),
            value: result,
            negate: extracted.negate
          }
        : undefined
    }
  }
}

/** extractorとparserをまとめて実装を注入したもの */
const parseQueryFragmentToFilter = parseToFilterBase(
  parser,
  extractor,
  q => q.indexOf(':') < 0 && !q.startsWith('#') && !q.startsWith('@')
)

/** 実際のクエリに対応するオブジェクトへの変換 */
const filterOrStringToSearchMessageQuery = (
  f: Filter | string
): SearchMessageQueryObject => {
  if (typeof f === 'string') {
    return { word: f }
  }

  switch (f.type) {
    case 'after':
    case 'before':
      return {
        ...emptySearchMessageQueryObject,
        [f.type]: f.value.toISOString()
      }
    case 'in':
    case 'to':
    case 'from':
    case 'citation':
      return { ...emptySearchMessageQueryObject, [f.type]: f.value }
    case 'attrFlag':
      return { ...emptySearchMessageQueryObject, [f.value]: !f.negate }
    case 'mediaFlag':
      return {
        ...emptySearchMessageQueryObject,
        [`has${f.value[0].toUpperCase() + f.value.slice(1)}`]: !f.negate
      }
  }
}

const useQueryParer = () => {
  /**
   * クエリをパースし、検索ワードとフィルタに変換する
   */
  const parseQuery = async (
    query: string
  ): Promise<SearchMessageQueryObject> => {
    const parseds = await Promise.all(
      query
        .split(' ')
        .filter(q => q)
        .map(parseQueryFragmentToFilter)
    )
    return parseds
      .map(filterOrStringToSearchMessageQuery)
      .reduce(mergeSearchMessageQueryObject, emptySearchMessageQueryObject)
  }

  const toSearchMessageParam = (
    obj: SearchMessageQueryObject,
    options?: Partial<{
      limit: number
      offset: number
      sort: SearchMessageSortKey
    }>
  ): SearchMessageQuery => [
    obj.word,
    obj.after,
    obj.before,
    obj.in,
    obj.to,
    obj.from,
    obj.citation,
    obj.bot,
    obj.hasUrl,
    obj.hasAttachments,
    obj.hasImage,
    obj.hasVideo,
    obj.hasAudio,
    options?.limit,
    options?.offset,
    options?.sort
  ]

  return { parseQuery, toSearchMessageParam }
}

export default useQueryParer

// util

const emptySearchMessageQueryObject: SearchMessageQueryObject = {
  word: undefined,
  after: undefined,
  before: undefined,
  in: undefined,
  to: undefined,
  from: undefined,
  citation: undefined,
  bot: undefined,
  hasUrl: undefined,
  hasAttachments: undefined,
  hasImage: undefined,
  hasVideo: undefined,
  hasAudio: undefined
}

const mergeSearchMessageQueryObject = (
  q1: SearchMessageQueryObject,
  q2: SearchMessageQueryObject
): SearchMessageQueryObject => ({
  word: [q1.word, q2.word].filter(v => v).join(' '),
  after: q1.after ?? q2.after,
  before: q1.before ?? q2.before,
  in: q1.in ?? q2.in,
  to: q1.to ?? q2.to,
  from: q1.from ?? q2.from,
  citation: q1.citation ?? q2.citation,
  bot: q1.bot ?? q2.bot,
  hasUrl: q1.hasUrl ?? q2.hasUrl,
  hasAttachments: q1.hasAttachments ?? q2.hasAttachments,
  hasImage: q1.hasImage ?? q2.hasImage,
  hasVideo: q1.hasVideo ?? q2.hasVideo,
  hasAudio: q1.hasAudio ?? q2.hasAudio
})
