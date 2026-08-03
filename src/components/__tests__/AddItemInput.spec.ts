import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import en from '@/locales/en.json'
import AddItemInput from '../AddItemInput.vue'

function mountInput() {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })
  return mount(AddItemInput, { global: { plugins: [i18n] } })
}

function pasteEvent(text: string): ClipboardEvent {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: () => text },
  })
  return event
}

describe('AddItemInput', () => {
  it('queues a multi-item paste instead of adding it right away', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').element.dispatchEvent(pasteEvent('Milk\nBread\nCream\n2 dl'))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('addMany')).toBeUndefined()
    expect(wrapper.text()).toContain('Milk')
    expect(wrapper.text()).toContain('Bread')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('addMany')?.[0]?.[0]).toEqual([
      { name: 'Milk', quantity: null, unit: null },
      { name: 'Bread', quantity: null, unit: null },
      { name: 'Cream', quantity: 2, unit: 'dl' },
    ])
  })

  it('lets a queued item be removed before adding', async () => {
    const wrapper = mountInput()

    wrapper.find('input').element.dispatchEvent(pasteEvent('Milk\nBread'))
    await wrapper.vm.$nextTick()

    await wrapper.get('.pending-remove').trigger('click')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('addMany')?.[0]?.[0]).toEqual([
      { name: 'Bread', quantity: null, unit: null },
    ])
  })

  it('still adds a single typed item through the add event', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').setValue('Onion')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')?.[0]).toEqual(['Onion'])
    expect(wrapper.emitted('addMany')).toBeUndefined()
  })

  it('splits an amount typed in front of the name', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').setValue('5 dl Vetemjöl')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.emitted('addMany')?.[0]?.[0]).toEqual([
      { name: 'Vetemjöl', quantity: 5, unit: 'dl' },
    ])
  })
})
