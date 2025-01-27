import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { createTestKeystrokes, Keystrokes } from '@rwh/keystrokes'
import { useKey, useKeystrokes } from '..'
import { wait } from './helpers/next-tick'
import { defineComponent } from 'vue'

const ProviderComponent = defineComponent({
  props: ['keystrokes'],
  setup(props: { keystrokes: Keystrokes }) {
    const { keystrokes } = props
    useKeystrokes(keystrokes)
  },
  template: `
    <slot />
  `,
})

const TestComponent = defineComponent({
  setup() {
    return { isPressed: useKey('a') }
  },
  template: `
    <div>{{isPressed ? 'isPressed' : 'isNotPressed'}}</div>
`,
})

const TestComponentWithPreventDefault = defineComponent({
  setup() {
    return { isPressed: useKey('a', true) }
  },
  template: `
    <div>{{isPressed ? 'isPressed' : 'isNotPressed'}}</div>
`,
})

describe('useKey(key) -> isPressed', () => {
  it('initial state is unpressed', async () => {
    const keystrokes = createTestKeystrokes()
    const w = mount(ProviderComponent, {
      slots: { default: TestComponent },
      props: { keystrokes },
    })
    expect(w.get('div').text()).toEqual('isNotPressed')
  })

  it('tracks the pressed state', async () => {
    const keystrokes = createTestKeystrokes()
    const w = mount(ProviderComponent, {
      slots: { default: TestComponent },
      props: { keystrokes },
    })

    keystrokes.press({ key: 'a' })
    await wait()

    expect(w.get('div').text()).toEqual('isPressed')
  })

  it('tracks the released state', async () => {
    const keystrokes = createTestKeystrokes()
    const w = mount(ProviderComponent, {
      slots: { default: TestComponent },
      props: { keystrokes },
    })

    keystrokes.press({ key: 'a' })
    await wait()

    keystrokes.release({ key: 'a' })
    await wait()

    expect(w.get('div').text()).toEqual('isNotPressed')
  })

  it('prevents default when configured to', async () => {
    const keystrokes = createTestKeystrokes()
    const w = mount(ProviderComponent, {
      slots: { default: TestComponentWithPreventDefault },
      props: { keystrokes },
    })

    let defaultPrevented = false
    const keyEvent = {
      key: 'a',
      preventDefault() {
        defaultPrevented = true
      },
    }
    keystrokes.press(keyEvent)
    keystrokes.release(keyEvent)
    await wait()

    expect(defaultPrevented).toEqual(true)
    expect(w.get('div').text()).toEqual('isNotPressed')
  })
})
