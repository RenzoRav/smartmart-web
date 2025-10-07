import { useSupabaseClient } from '@/composable/useSupabaseClient'

export default function useProdutoService() {
  const supabase = useSupabaseClient()
  const T = 'produtos'

  const listar = async () => {
    const { data, error } = await supabase
      .from(T)
      .select('id, sku, nome, preco, custo, ativo, criadoEm:criado_em')
    if (error) throw error
    return data
  }

  const criar = async (produto) => {
    const { data, error } = await supabase
      .from(T)
      .insert([produto])
      .select('id, sku, nome, preco, custo, ativo, criadoEm:criado_em')
    if (error) throw error
    return data[0]
  }

  const atualizar = async (id, produto) => {
    const { data, error } = await supabase
      .from(T)
      .update(produto)
      .eq('id', id)
      .select('id, sku, nome, preco, custo, ativo, criadoEm:criado_em')
    if (error) throw error
    return data[0]
  }

  const excluir = async (id) => {
    const { error } = await supabase.from(T).delete().eq('id', id)
    if (error) throw error
    return true
  }

  return { listar, criar, atualizar, excluir }
}
