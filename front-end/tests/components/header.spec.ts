import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Header from '~/components/Header.vue'

describe('Header Component', () => {
  it('deve renderizar o título corretamente', async () => {
    // mountSuspended é o segredo: ele carrega plugins, pinia e router do Nuxt
    const component = await mountSuspended(Header)
    
    expect(component.text()).toContain('Minha Plataforma de Streaming')
  })
})