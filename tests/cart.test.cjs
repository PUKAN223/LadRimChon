const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// Compile pure TypeScript modules in memory; no new test dependency or generated files.
function load(relative) {
  const filename = path.resolve(__dirname, '..', relative)
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  mod._compile(output, filename)
  return mod.exports
}
const { default: reducer, addItem, updateQuantity, restoreCart } = load('src/store/slices/cart.slice.ts')
const { validateCart } = load('src/lib/validate-cart.ts')
const shop = { id: 'shop-1', name: 'ร้านทดสอบ', isOpen: true }
const product = { id: 'p1', shopId: shop.id, name: 'อาหาร', price: 50, isAvailable: true, stock: 3,
  options: [{ id: 'o1', name: 'ขนาด', required: true, maxSelect: 1, choices: [{ id: 'c1', name: 'ธรรมดา', priceAdd: 0 }] }] }
const item = { id: 'i1', productId: 'p1', productName: 'อาหาร', productImageUrl: '', price: 50, quantity: 1,
  selectedChoices: [{ optionId: 'o1', choiceId: 'c1', choiceName: 'ธรรมดา', priceAdd: 0 }], note: '', subtotal: 50 }
const addition = (value = item, shopId = shop.id) => addItem({ shopId, shopName: shop.name, item: value })
const cart = () => reducer(undefined, addition())

test('same configuration merges; different notes stay separate', () => {
  let state = reducer(cart(), addition({ ...item, id: 'i2' }))
  assert.equal(state.items.length, 1)
  assert.equal(state.items[0].subtotal, 100)
  state = reducer(state, addition({ ...item, id: 'i3', note: 'ไม่เผ็ด' }))
  assert.equal(state.items.length, 2)
})
test('different shops remain together in the cart', () => {
  const state = cart()
  const next = reducer(state, addition({ ...item, id: 'i2' }, 'shop-2'))
  assert.equal(next.items.length, 2)
  assert.equal(next.items[0].shopId, shop.id)
  assert.equal(next.items[1].shopId, 'shop-2')
})
test('quantity bounds and totals remain consistent', () => {
  for (const quantity of [0, -3, 1000, 1.7, NaN]) {
    const state = reducer(cart(), updateQuantity({ id: item.id, quantity }))
    assert.ok(state.items[0].quantity >= 1 && state.items[0].quantity <= 99)
    assert.equal(state.items[0].subtotal, state.items[0].quantity * 50)
  }
})
test('restoring a persisted cart preserves choices and totals', () => {
  const saved = JSON.parse(JSON.stringify(cart()))
  assert.deepEqual(reducer(undefined, restoreCart(saved)), saved)
})
test('valid checkout passes; closed shop and unavailable product fail', () => {
  assert.equal(validateCart(cart().items, shop, [product]), null)
  assert.ok(validateCart(cart().items, { ...shop, isOpen: false }, [product]))
  assert.ok(validateCart(cart().items, shop, [{ ...product, isAvailable: false }]))
})
test('required choices, changed prices, and invalid choices fail', () => {
  assert.ok(validateCart(reducer(undefined, addition({ ...item, selectedChoices: [] })).items, shop, [product]))
  assert.ok(validateCart(cart().items, shop, [{ ...product, price: 60 }]))
  assert.ok(validateCart(cart().items, shop, [{ ...product, options: [] }]))
})
test('stock is checked across separate notes for the same product', () => {
  let state = reducer(undefined, addition({ ...item, quantity: 2 }))
  state = reducer(state, addition({ ...item, id: 'i2', note: 'ไม่เผ็ด', quantity: 2 }))
  assert.ok(validateCart(state.items, shop, [product]))
})
test('duplicate selected choices are rejected', () => {
  const state = reducer(undefined, addition({ ...item, selectedChoices: [...item.selectedChoices, ...item.selectedChoices] }))
  assert.ok(validateCart(state.items, shop, [product]))
})
