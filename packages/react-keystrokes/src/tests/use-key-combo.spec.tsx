import { describe, it, expect } from 'vitest'
import React from 'react'
import { create } from 'react-test-renderer'
import { KeystrokesProvider } from '../KeystrokesContext'
import { act } from './helpers/act'

import { createTestKeystrokes } from '@rwh/keystrokes'
import { useKeyCombo } from '..'
import { wait } from './helpers/next-tick'

const TestComponent = () => {
  const isPressed = useKeyCombo('a+b')
  return <div>{isPressed ? 'isPressed' : 'isNotPressed'}</div>
}

const TestComponentWithPreventDefault = () => {
  const isPressed = useKeyCombo('a+b', true)
  return <div>{isPressed ? 'isPressed' : 'isNotPressed'}</div>
}

describe('useKeyCombo(keyCombo) -> isPressed', () => {
  it('initial state is unpressed', async () => {
    const keystrokes = createTestKeystrokes()
    const { root } = await act(() =>
      create(
        <KeystrokesProvider keystrokes={keystrokes}>
          <TestComponent />
        </KeystrokesProvider>,
      ),
    )

    expect(root.findByType('div').children[0]).toEqual('isNotPressed')
  })

  it('tracks the pressed state', async () => {
    const keystrokes = createTestKeystrokes()

    const { root } = await act(() =>
      create(
        <KeystrokesProvider keystrokes={keystrokes}>
          <TestComponent />
        </KeystrokesProvider>,
      ),
    )

    keystrokes.press({ key: 'a' })
    keystrokes.press({ key: 'b' })
    await wait()

    expect(root.findByType('div').children[0]).toEqual('isPressed')
  })

  it('tracks the released state', async () => {
    const keystrokes = createTestKeystrokes()

    const { root } = await act(() =>
      create(
        <KeystrokesProvider keystrokes={keystrokes}>
          <TestComponent />
        </KeystrokesProvider>,
      ),
    )

    keystrokes.press({ key: 'a' })
    keystrokes.press({ key: 'b' })
    keystrokes.release({ key: 'a' })
    keystrokes.release({ key: 'b' })
    await wait()

    expect(root.findByType('div').children[0]).toEqual('isNotPressed')
  })

  it('prevents default when configured to', async () => {
    const keystrokes = createTestKeystrokes()

    const { root } = await act(() =>
      create(
        <KeystrokesProvider keystrokes={keystrokes}>
          <TestComponentWithPreventDefault />
        </KeystrokesProvider>,
      ),
    )

    let defaultPrevented = false
    const lastKeyEvent = {
      key: 'b',
      preventDefault() {
        defaultPrevented = true
      },
    }
    keystrokes.press({ key: 'a' })
    keystrokes.press(lastKeyEvent)
    keystrokes.release({ key: 'a' })
    keystrokes.release(lastKeyEvent)
    await wait()

    expect(defaultPrevented).toEqual(true)
    expect(root.findByType('div').children[0]).toEqual('isNotPressed')
  })
})
