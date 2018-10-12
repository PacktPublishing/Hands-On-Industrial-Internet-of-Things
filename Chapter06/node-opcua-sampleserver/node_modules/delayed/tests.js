var delayed         = require('./')
  , sinon           = require('sinon')
  , test            = require('tape')
  , expectedNullCtx = typeof window != 'undefined' ? window : null


test('test delay() no-arg 100ms', function (t) {
  var spy = sinon.spy()

  delayed.delay(spy, 100)

  t.equal(spy.callCount, 0)

  setTimeout(function () { t.equal(spy.callCount, 0) }, 50)
  setTimeout(function () { t.equal(spy.callCount, 0) }, 75)
  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.equal(spy.firstCall.args.length, 0)
    t.same(spy.thisValues[0], expectedNullCtx)
    t.end()
  }, 110)
})


test('test delay() curried arguments', function (t) {
  var spy = sinon.spy()
    , ctx = {}

  delayed.delay(spy, 10, ctx, 'foo', 'bar')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'foo', 'bar' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 20)
})


test('test delay() cancelable', function (t) {
  var spy = sinon.spy()
    , timeout = delayed.delay(spy, 100)

  t.equal(spy.callCount, 0)
  clearTimeout(timeout)

  setTimeout(function () {
    t.equal(spy.callCount, 0)
    t.end()
  }, 20)
})


test('defer() no-arg', function (t) {
  var spy = sinon.spy()

  delayed.defer(spy)

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.equal(spy.firstCall.args.length, 0)
    t.same(spy.thisValues[0], expectedNullCtx)
    t.end()
  }, 5)
})


test('defer() curried arguments', function (t) {
  var spy = sinon.spy()
    , ctx = {}

  delayed.defer(spy, ctx, 'foo', 'bar')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'foo', 'bar' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 5)
})


test('defer() cancelable', function (t) {
  var spy = sinon.spy()
    , timeout = delayed.defer(spy)

  t.equal(spy.callCount, 0)
  clearTimeout(timeout)

  setTimeout(function () {
    t.equal(spy.callCount, 0)
    t.end()
  }, 5)
})


test('delayed() no-arg 100ms', function (t) {
  var spy = sinon.spy()

  delayed.delayed(spy, 100)()

  t.equal(spy.callCount, 0)

  setTimeout(function () { t.equal(spy.callCount, 0) }, 50)
  setTimeout(function () { t.equal(spy.callCount, 0) }, 75)
  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args.length, 0)
    t.same(spy.thisValues[0], expectedNullCtx)
    t.end()
  }, 110)
})


test('delayed() curried arguments', function (t) {
  var spy = sinon.spy()
    , ctx = {}

  delayed.delayed(spy, 10, ctx, 'foo', 'bar')('bang', 'boo')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'foo', 'bar', 'bang', 'boo' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 20)
})


test('delayed() multiple calls, curried', function (t) {
  var spy = sinon.spy()
    , ctx = {}
    , fn = delayed.delayed(spy, 10, ctx, 'spicy')

  fn('foo', 'bar')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'spicy', 'foo', 'bar' ])
    t.same(spy.thisValues[0], ctx)
    fn('boom', 'bang')

    setTimeout(function () {
      t.equal(spy.callCount, 2)
      t.deepEqual(spy.secondCall.args, [ 'spicy', 'boom', 'bang' ])
      t.same(spy.thisValues[1], ctx)
      t.end()
    }, 20)
  }, 20)
})


test('deferred() no-arg', function (t) {
  var spy = sinon.spy()

  delayed.deferred(spy)()

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args.length, 0)
    t.same(spy.thisValues[0], expectedNullCtx)
    t.end()
  }, 5)
})


test('deferred() curried arguments', function (t) {
  var spy = sinon.spy()
    , ctx = {}

  delayed.deferred(spy, ctx, 'foo', 'bar')('bang', 'boo')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'foo', 'bar', 'bang', 'boo' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 5)
})


test('deferred() multiple calls, curried', function (t) {
  var spy = sinon.spy()
    , ctx = {}
    , fn = delayed.deferred(spy, ctx, 'spicy')

  fn('foo', 'bar')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'spicy', 'foo', 'bar' ])
    t.same(spy.thisValues[0], ctx)
    fn('boom', 'bang')

    setTimeout(function () {
      t.equal(spy.callCount, 2)
      t.deepEqual(spy.secondCall.args, [ 'spicy', 'boom', 'bang' ])
      t.same(spy.thisValues[1], ctx)
      t.end()
    }, 5)
  }, 5)
})


test('debounce() same as cumulativeDelayed()', function (t) {
  t.same(delayed.cumulativeDelayed, delayed.debounce, 'same function')
  t.end()
})


test('cumulativeDelayed() no-arg 100ms', function (t) {
  var spy = sinon.spy()

  delayed.cumulativeDelayed(spy, 100)()

  t.equal(spy.callCount, 0)

  setTimeout(function () { t.equal(spy.callCount, 0) }, 50)
  setTimeout(function () { t.equal(spy.callCount, 0) }, 75)
  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args.length, 0)
    t.same(spy.thisValues[0], expectedNullCtx)
    t.end()
  }, 110)
})


test('cumulativeDelayed() curried arguments', function (t) {
  var spy = sinon.spy()
    , ctx = {}

  delayed.cumulativeDelayed(spy, 10, ctx, 'foo', 'bar')('bang', 'boo')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'foo', 'bar', 'bang', 'boo' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 20)
})


test('cumulativeDelayed() multiple calls within same tick, curried', function (t) {
  var spy = sinon.spy()
    , ctx = {}
    , fn = delayed.cumulativeDelayed(spy, 10, ctx, 'spicy')

  fn('foo1', 'bar1')
  fn('foo2', 'bar2')
  fn('foo3', 'bar3')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 1)
    t.deepEqual(spy.firstCall.args, [ 'spicy', 'foo3', 'bar3' ])
    t.same(spy.thisValues[0], ctx)
    t.end()
  }, 20)
})


test('cumulativeDelayed() multiple calls across ticks, curried', function (t) {
  var spy = sinon.spy()
    , ctx = {}
    , fn = delayed.cumulativeDelayed(spy, 50, ctx, 'spicy')

  fn('foo1', 'bar1')

  t.equal(spy.callCount, 0)

  setTimeout(function () {
    t.equal(spy.callCount, 0)
    fn('foo2', 'bar2')
    setTimeout(function () {
      t.equal(spy.callCount, 0)
      fn('foo3', 'bar3')
      setTimeout(function () {
        t.equal(spy.callCount, 0)
        fn('foo4', 'bar4')
        setTimeout(function () {
          t.equal(spy.callCount, 1)
          t.deepEqual(spy.firstCall.args, [ 'spicy', 'foo4', 'bar4' ])
          t.same(spy.thisValues[0], ctx)
          t.end()
        }, 100)
      }, 30)
    }, 30)
  }, 30)
})
