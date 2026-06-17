import { supabase, isDemo } from './supabase'
import { DEMO_ENTRIES, DEMO_DAY_MUSIC } from '../data/demoData'

// ── Read ─────────────────────────────────────────────────────────

export async function getEntries(day) {
  if (isDemo) {
    return day != null
      ? DEMO_ENTRIES.filter(e => e.day === day)
      : DEMO_ENTRIES
  }
  let q = supabase.from('entries').select('*').order('created_at', { ascending: true })
  if (day != null) q = q.eq('day', day)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getDays() {
  if (isDemo) {
    return [...new Set(DEMO_ENTRIES.map(e => e.day))].sort((a, b) => a - b)
  }
  const { data, error } = await supabase
    .from('entries')
    .select('day')
    .order('day')
  if (error) throw error
  return [...new Set(data.map(d => d.day))].sort((a, b) => a - b)
}

export async function getDayMusic(day) {
  if (isDemo) return DEMO_DAY_MUSIC[day] ?? null
  const { data } = await supabase
    .from('day_music')
    .select('music_url')
    .eq('day', day)
    .single()
  return data?.music_url ?? null
}

// ── Write ────────────────────────────────────────────────────────

export async function createEntry(entry) {
  if (isDemo) throw new Error('演示模式：请先配置 Supabase 以保存数据')
  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEntry(id, updates) {
  if (isDemo) throw new Error('演示模式：请先配置 Supabase 以保存数据')
  const { data, error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEntry(id) {
  if (isDemo) throw new Error('演示模式：请先配置 Supabase 以保存数据')
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) throw error
}

export async function upsertDayMusic(day, musicUrl) {
  if (isDemo) throw new Error('演示模式：请先配置 Supabase 以保存数据')
  const { error } = await supabase
    .from('day_music')
    .upsert({ day, music_url: musicUrl })
  if (error) throw error
}

// ── Storage ──────────────────────────────────────────────────────

export async function uploadFile(bucket, file, path) {
  if (!supabase) throw new Error('Supabase 未配置')
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)
  return publicUrl
}

export async function deleteFile(bucket, path) {
  if (!supabase) return
  await supabase.storage.from(bucket).remove([path])
}
