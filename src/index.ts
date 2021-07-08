
type EventListenerMap = {
  [key in any]: Function[]
}

export default class EventEmitter {

  private eventListenerMap: EventListenerMap = {}
  private maxListeners = 100
  private listenersCount = 0

  private checkBeforeAddListener() {
    if (this.listenersCount > this.maxListeners) {
      throw new Error('超过最大绑定数')
    }
    this.listenersCount ++
  }

  private generateOnceWrap(eventName, listener) {
    const onceWrap = (...args) => {
      onceWrap.listener.apply(null, args)
      this.off(eventName, onceWrap)
    }
    onceWrap.listener = listener
    return onceWrap
  }

  on(eventName: any, listener: Function) {
    this.checkBeforeAddListener()
    const list = this.listeners(eventName)
    list.push(listener)
  }

  addEventListener = this.on

  once(eventName: any, listener: Function) {
    const onceListener = this.generateOnceWrap(eventName, listener)
    this.on(eventName, onceListener)
  }

  prependListener(eventName: any, listener: Function) {
    this.checkBeforeAddListener()
    const list = this.listeners(eventName)
    list.unshift(listener)
  }

  prependOnceListener(eventName: any, listener: Function) {
    const onceListener = this.generateOnceWrap(eventName, listener)
    this.prependListener(eventName, onceListener)
  }

  emit(eventName: any, ...args) {
    const list = this.listeners(eventName)
    const copy = [...list]
    for (let i = 0; i < copy.length; i++) {
      copy[i].apply(null, args)
    }
  }

  off(eventName: any, listener?: Function) {
    if (listener) {
      const list = this.listeners(eventName)
      const index = list.indexOf(listener)
      if (index !== -1) {
        list.splice(index, 1)
      }
    } else {
      this.eventListenerMap[eventName] = []
    }
  }
  
  removeAllListeners(eventNames: any[]) {
    eventNames.forEach(key => this.off(key))
  }

  removeListener = this.off

  eventNames(): any[] {
    return Object.keys(this.eventListenerMap)
  }

  setMaxListeners(maxListeners: number) {
    this.maxListeners = maxListeners
  }

  getMaxListeners(): number {
    return this.maxListeners
  }

  listenerCount(eventName: any): number{
    return this.listeners(eventName).length
  }

  listeners(eventName: any): Function[]{
    let list = this.eventListenerMap[eventName]
    if (!list) {
      this.eventListenerMap[eventName] = list = []
    }
    return list
  }

  rawListeners = this.listeners
}