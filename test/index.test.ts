import EventEmitter from '../src/index'


const pureEe = new EventEmitter();
const n = () => {}
const fn = jest.fn()
afterEach(() => {
  pureEe.removeAllListeners(pureEe.eventNames())
  fn.mockClear()
})

describe('添加监听函数', () => {
  const params = { name: 'jsonz' }

  test('on函数', () => {
    pureEe.on('test', (value) => {
      fn(value)
    })
    pureEe.emit('test', params)
    expect(fn.mock.calls[0][0]).toBe(params)
  })

  test('addEventListener 函数', done => {
    pureEe.addEventListener('test', (value) => {
      expect(value).toBe(params)
      done()
    })
    pureEe.emit('test', params)
  })

  test('函数调用多次', (done) => {
    const mock = jest.fn()
    pureEe.on('test', () => {
      mock()
    })
    pureEe.addEventListener('test', (final) => {
      mock()
      final && done()
    })
    pureEe.emit('test')
    pureEe.emit('test', true)
    expect(mock.mock.calls.length).toBe(4)
  })

  test('单次监听', (done) => {
    const mock = jest.fn()
    pureEe.once('test', () => {
      mock()
    })
    pureEe.on('test', flag => {
      mock()
      flag && done()
    })
    pureEe.emit('test')
    pureEe.emit('test', true)
    expect(mock.mock.calls.length).toBe(3)
  })
})

describe('prepend 监听函数',() => {
  test('prepend', (done) => {
    const mockFn = jest.fn()
    pureEe.on('test',() => {
      mockFn(1)
    })
    pureEe.addEventListener('test',() => {
      mockFn(2)
      done()
    })
    pureEe.prependListener('test',() => {
      mockFn(-1)
    })
    pureEe.emit('test')
    expect(mockFn.mock.calls.length).toBe(3)
    expect(mockFn.mock.calls[0][0]).toBe(-1)
    expect(mockFn.mock.calls[1][0]).toBe(1)
    expect(mockFn.mock.calls[2][0]).toBe(2)
  })

  test('prependOnce', (done) => {
    const mockFn = jest.fn()
    pureEe.on('test',(flag) => {
      mockFn(1)
      flag && done()
    })
    pureEe.prependOnceListener('test',() => {
      mockFn(-1)
    })
    pureEe.prependListener('test',() => {
      mockFn(-2)
    })
    pureEe.emit('test')
    pureEe.emit('test', true)
    expect(mockFn.mock.calls.length).toBe(5)
    expect(mockFn.mock.calls[0][0]).toBe(-2)
    expect(mockFn.mock.calls[1][0]).toBe(-1)
    expect(mockFn.mock.calls[2][0]).toBe(1)
  })
})

describe('newListener and removeListener', () => {
  test('newListener', () => {
    const ee = new EventEmitter()
    const fn = jest.fn()
    ee.on('newListener', (event, listener) => {
      if (event === 'event') {
        ee.on('event', () => {
          fn('B')
        })
      }
    })
    ee.on('event', () => {
      fn('A')
    })
    ee.emit('event')
    expect(fn.mock.calls.length).toBe(2)
    expect(fn.mock.calls[0][0]).toBe('B')
    expect(fn.mock.calls[1][0]).toBe('A')
  })

  test('removeListener', () => {
    const ee = new EventEmitter()
    const fn = jest.fn()
    ee.on('removeListener', (event, listener) => {
      if (event === 'event') {
        listener()
      }
    })
    ee.on('event', () => {
      fn('test')
    })
    ee.off('event')
    expect(fn.mock.calls.length).toBe(1)
    expect(fn.mock.calls[0][0]).toBe('test')
  })
})

describe('解绑', () => {
  test('off', () => {
    const mockFn = jest.fn()
    pureEe.on('test', () => {
      mockFn()
    })
    const fn1 = () => { mockFn() }
    pureEe.on('test', fn1)

    pureEe.emit('test')
    expect(mockFn.mock.calls.length).toBe(2)

    pureEe.off('test', fn1)
    pureEe.emit('test')
    expect(mockFn.mock.calls.length).toBe(3)

    pureEe.off('test')
    pureEe.emit('test')
    expect(mockFn.mock.calls.length).toBe(3)
  })

  test('removeAllListeners', () => {
    const mockFn = jest.fn()
    pureEe.on('test', () => { mockFn() })
    pureEe.on('test2', () => { mockFn() })
    pureEe.on('test3', () => { mockFn() })

    pureEe.removeAllListeners(['test', 'test2', 'test3'])
    pureEe.emit('test')
    pureEe.emit('test2')
    pureEe.emit('test3')
    expect(mockFn.mock.calls.length).toBe(0)
  })

  test('removeListener', () => {
    const mockFn = jest.fn()
    pureEe.on('test', () => {mockFn()})
    pureEe.removeListener('test')
    pureEe.emit('test')
    expect(mockFn.mock.calls.length).toBe(0)
  })
})

describe('监听数量', () => {
  const noop = () => {}

  test('maxListeners', () => {
    expect(pureEe.getMaxListeners()).toBe(10)
    pureEe.setMaxListeners(1)
    expect(pureEe.getMaxListeners()).toBe(1)
    pureEe.setMaxListeners(10)
  })

  test('listenerCount', () => {
    pureEe.on('test', () => {})
    pureEe.on('test', noop)
    pureEe.on('test', noop)
    expect(pureEe.listenerCount('test')).toBe(3)
    pureEe.on('test', noop)
    expect(pureEe.listenerCount('test')).toBe(4)
    pureEe.off('test', noop)
    expect(pureEe.listenerCount('test')).toBe(1)
    pureEe.off('test')
    expect(pureEe.listenerCount('test')).toBe(0)
  })

  test('超过最大监听数', () => {
    const ee = new EventEmitter()
    ee.setMaxListeners(1)
    ee.on('test', () => {})
    ee.on('test1', () => {})

    expect(() => {
      ee.on('test', () => {})
    }).toThrow()
    ee.setMaxListeners(100)
    ee.on('test', () => {})
  })
})

test('eventNames', () => {
  const ee = new EventEmitter()
  const noop = () => {}
  ee.on('test', noop)
  ee.on('test1', noop)
  expect(ee.eventNames()).toEqual(['test', 'test1'])
})

test('listeners', () => {
  const ee = new EventEmitter()
  const noop = () => {}
  const noop1 = () => {}
  ee.on('test', noop)
  ee.on('test', noop1)
  expect(ee.listeners('test')).toEqual([noop, noop1])
})

describe('Nodejs.org emitter.rawListeners(eventName) test', () => {
  test('once', () => {
    const mockFn = jest.fn()
    const emitter = new EventEmitter()
    emitter.once('log', () => mockFn('log once'))

    const listeners = emitter.rawListeners('log')
    const logFnWrapper = listeners[0]
    logFnWrapper?.listener()
    expect(mockFn.mock.calls.length).toBe(1)
    emitter.emit('log')
    expect(mockFn.mock.calls.length).toBe(2)

    logFnWrapper()
    expect(mockFn.mock.calls.length).toBe(3)
    emitter.emit('log')
    expect(mockFn.mock.calls.length).toBe(3)
  })

  test('normal', () => {
    const emitter = new EventEmitter()
    const mockFn = jest.fn()

    emitter.on('log', mockFn);
    const newListeners = emitter.rawListeners('log');
    newListeners[0]();
    emitter.emit('log');
    expect(mockFn.mock.calls.length).toBe(2)
  })
})

