import type { IronSession } from 'iron-session'
import { PromiseQueue } from '../utils/promise-queue'
import type { PersistKey, Storage } from '../utils/types'

export type ExtendedStorageKey = `${PersistKey}` | 'redirectTo'

export interface SessionData {
  [PersistKey.AccessToken]?: string
  [PersistKey.IdToken]?: string
  [PersistKey.SignInSession]?: string
  [PersistKey.RefreshToken]?: string
  redirectTo?: string
}

/**
 * 使用 IronSession 代替 logto 默认的 CookieStorage
 */
export default class NuxtStorage implements Storage<ExtendedStorageKey> {
  #saveQueue: PromiseQueue
  constructor(private readonly session: IronSession<SessionData>) {
    this.#saveQueue = new PromiseQueue()
  }

  async setItem(key: ExtendedStorageKey, value: string) {
    this.session[key] = value
    await this.save()
  }

  async getItem(key: ExtendedStorageKey) {
    return this.session[key] ?? null
  }

  async removeItem(key: ExtendedStorageKey) {
    this.session[key] = void 0
    await this.save()
  }

  async save() {
    await this.#saveQueue.enqueue(async () => this.session.save())
  }

  async destroy() {
    this.session.destroy()
    await this.save()
  }
}
