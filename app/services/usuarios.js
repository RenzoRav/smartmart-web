import { useSupabaseClient } from '@/composable/useSupabaseClient'

export default function useUsuarioService() {
  const supabase = useSupabaseClient()

  const listar = async () => {
    const { data, error } = await supabase.from('usuarios').select('*')
    if (error) throw error
    return data
  }

  const buscar = async (id) => {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }

  const criar = async (usuario) => {
    const { data, error } = await supabase.from('usuarios').insert([usuario]).select()
    if (error) throw error
    return data[0]
  }

  const atualizar = async (id, usuario) => {
    const { data, error } = await supabase.from('usuarios').update(usuario).eq('id', id).select()
    if (error) throw error
    return data[0]
  }

  const excluir = async (id) => {
    const { error } = await supabase.from('usuarios').delete().eq('id', id)
    if (error) throw error
    return true
  }

  return { listar, buscar, criar, atualizar, excluir }
}
