import { useSupabaseClient } from '@/composable/useSupabaseClient'

export default function useUsuarioService() {
  const supabase = useSupabaseClient()
  const T = 'usuarios' 

  const listar = async () => {
    const { data, error } = await supabase.from(T).select('*')
    if (error) throw error
    return data
  }

  const buscar = async (id) => {
    const { data, error } = await supabase.from(T).select('*').eq('id', id).single()
    if (error) throw error
    return data
  }

  const criar = async (usuario) => {
    const { data, error } = await supabase.from(T).insert([usuario]).select()
    if (error) throw error
    return data[0]
  }

  const atualizar = async (id, usuario) => {
    const { data, error } = await supabase.from(T).update(usuario).eq('id', id).select()
    if (error) throw error
    return data[0]
  }

  const excluir = async (id) => {
    const { error } = await supabase.from(T).delete().eq('id', id)
    if (error) throw error
    return true
  }

  return { listar, buscar, criar, atualizar, excluir }
}
