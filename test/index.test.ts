import EventEmitter from '../src/index'


const pureEe = new EventEmitter();
afterEach(() => {
  pureEe.removeAllListeners(pureEe.eventNames())
})

describe('添加监听函数', () => {
  const params = { name: 'jsonz' }

  test('on函数', done => {
    pureEe.on('test', (value) => {
      expect(value).toBe(params)
      done()
    })
    pureEe.emit('test', params)
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

  test('单词函数', )

  describe('单次监听', () => {
    
  })
})