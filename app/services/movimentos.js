import { useSupabaseClient } from '@/composable/useSupabaseClient'

export default function useMovimentoService() {
  const supabase = useSupabaseClient()

  const listar = async () => {
    const { data, error } = await supabase.from('movimentos_estoque').select('*')
    if (error) throw error
    return data
  }

  const criar = async (mov) => {
    const payload = {
      produto_id: mov.produto_id ?? mov.produto?.id,
      quantidade: mov.quantidade,
      tipo: mov.tipo,
      motivo: mov.motivo
    }
    const { data, error } = await supabase.from('movimentos_estoque').insert([payload]).select()
    if (error) throw error
    return data[0]
  }

  const atualizar = async (id, mov) => {
    const payload = {
      produto_id: mov.produto_id ?? mov.produto?.id,
      quantidade: mov.quantidade,
      tipo: mov.tipo,
      motivo: mov.motivo
    }
    const { data, error } = await supabase.from('movimentos_estoque').update(payload).eq('id', id).select()
    if (error) throw error
    return data[0]
  }

  const excluir = async (id) => {
    const { error } = await supabase.from('movimentos_estoque').delete().eq('id', id)
    if (error) throw error
    return true
  }

  return { listar, criar, atualizar, excluir }
}
