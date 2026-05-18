import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bsmuxnnjclhcuecpybkp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbXV4bm5qY2xoY3VlY3B5YmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTQ2NzMsImV4cCI6MjA5MDA5MDY3M30.zot2f5yv6m61vgt3avydYPk87zDy0MbUecYku29oI0Y'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function getWeekNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(Math.floor((now - start) / 86400000) / 7)
}
