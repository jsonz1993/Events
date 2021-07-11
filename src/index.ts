
interface FunctionWrap extends Function {
  listener?: Function
}

type EventName = string | symbol

export default class EventEmitter {

  static defaultMaxListeners = 10
  static newListenerEventName = 'newListener'
  static removeListenerEventName = 'removeListener'
  
  // typescript@4.4-beta 才支持对象的索引 symbol
  // 但是 @rollup/typescript 还没有对4.4进行支持，所以这里改用map去实现
  private eventListenerMap:Map<EventName, FunctionWrap[]> = new Map();
  private listenerCountMap: Map<EventName, number> = new Map();
  private isRunningNewListeners = false
  private defaultMaxListeners: number = EventEmitter.defaultMaxListeners

  private checkBeforeAddListener(eventName:EventName) {
    const count = this.listenerCountMap.get(eventName) || 0
    const maxListeners = this.getMaxListeners()
    if (count >= maxListeners) {
      throw new Error(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${maxListeners+1} event listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit`)
    }
    this.listenerCountMap.set(eventName, count + 1);
  }

  private generateOnceWrap(eventName: EventName, listener: FunctionWrap): FunctionWrap {
    const onceWrap = (...args) => {
      onceWrap.listener.apply(this, args)
      this.off(eventName, onceWrap)
    }
    onceWrap.listener = listener
    return onceWrap
  }

  on(eventName: EventName, listener: FunctionWrap) {
    this.checkBeforeAddListener(eventName)
    const list = this.listeners(eventName)
    const newListener = this.listeners(EventEmitter.newListenerEventName, false)
    if (eventName !== EventEmitter.newListenerEventName && newListener.length) {
      this.emit(EventEmitter.newListenerEventName, eventName, listener)
    }
    list.push(listener)
  }

  addEventListener = this.on

  once(eventName: EventName, listener: FunctionWrap) {
    const onceListener = this.generateOnceWrap(eventName, listener)
    this.on(eventName, onceListener)
  }

  prependListener(eventName: EventName, listener: FunctionWrap) {
    this.checkBeforeAddListener(eventName)
    this.emit(EventEmitter.newListenerEventName, eventName, listener)
    const list = this.listeners(eventName)
    list.unshift(listener)
  }

  prependOnceListener(eventName: EventName, listener: FunctionWrap) {
    const onceListener = this.generateOnceWrap(eventName, listener)
    this.prependListener(eventName, onceListener)
  }

  emit(eventName: EventName, ...args: any[]) {
    if (
      (this.isRunningNewListeners && eventName === EventEmitter.newListenerEventName)
    ) return
    const list = this.listeners(eventName)
    const copy = [...list]
    if (eventName === EventEmitter.newListenerEventName) {
      this.isRunningNewListeners = true
    }
    for (let i = 0; i < copy.length; i++) {
      copy[i].apply(this, args)
    }
    this.isRunningNewListeners = false
  }

  off(eventName: EventName, listener?: FunctionWrap) {
    const list = this.listeners(eventName)
    let removedListeners = list
    let nextListeners = []
    if (listener) {
      // 不应该用indexOf，因为可能重复绑定了多个相同的函数
      nextListeners = []
      removedListeners = []
      for (let i = 0; i< list.length; i++) {
        const isEmpty = list[i] === listener;
        (isEmpty? removedListeners: nextListeners).push(list[i])
      }
    }

    this.eventListenerMap.set(eventName, nextListeners)
    this.listenerCountMap.set(eventName, list.length - removedListeners.length)
    removedListeners.forEach(item => {
      this.emit(EventEmitter.removeListenerEventName, eventName, item)
    })
  }
  
  removeAllListeners(eventNames: EventName[]) {
    eventNames.forEach(key => this.off(key))
  }

  removeListener = this.off

  eventNames(): EventName[] {
    return Array.from(this.eventListenerMap.keys())
  }

  setMaxListeners(maxListeners: number) {
    this.defaultMaxListeners = maxListeners
  }

  getMaxListeners(): number {
    return this.defaultMaxListeners || EventEmitter.defaultMaxListeners
  }

  listenerCount(eventName: EventName): number{
    return this.listeners(eventName).length
  }

  listeners(eventName: EventName, init = true): FunctionWrap[]{
    let list = this.eventListenerMap.get(eventName)
    if (!list) {
      list = []
      if (init) {
        this.eventListenerMap.set(eventName, list)
      }
    }
    return list
  }

  rawListeners = this.listeners
}