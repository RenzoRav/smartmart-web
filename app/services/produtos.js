import { useSupabaseClient } from '@/composable/useSupabaseClient'

export default function useProdutoService() {
  const supabase = useSupabaseClient()

  const listar = async () => {
    const { data, error } = await supabase.from('produtos').select('*')
    if (error) throw error
    return data
  }

  const criar = async (produto) => {
    const { data, error } = await supabase.from('produtos').insert([produto]).select()
    if (error) throw error
    return data[0]
  }

  const atualizar = async (id, produto) => {
    const { data, error } = await supabase.from('produtos').update(produto).eq('id', id).select()
    if (error) throw error
    return data[0]
  }

  const excluir = async (id) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw error
    return true
  }

  return { listar, criar, atualizar, excluir }
}
