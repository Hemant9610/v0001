import { supabase } from './supabase'

// Method 1: Using .single() - throws error if 0 or >1 records
export const getExactlyOneRecord = async (table: string, column: string, value: any) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
      .single() // Forces exactly one record
    
    if (error) {
      console.error('Single record error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Method 2: Using .maybeSingle() - returns null if no records, error if >1
export const getMaybeSingleRecord = async (table: string, column: string, value: any) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
      .maybeSingle() // Returns null if no records, error if multiple
    
    return { data, error }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Method 3: Using limit(1) and manual validation
export const getFirstRecord = async (table: string, column: string, value: any) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
      .limit(1)
    
    if (error) {
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'No records found' } }
    }
    
    return { data: data[0], error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Method 4: Force single with custom validation
export const getForcedSingleRecord = async (table: string, column: string, value: any) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
    
    if (error) {
      return { data: null, error }
    }
    
    if (!data || data.length === 0) {
      return { data: null, error: { message: 'No records found' } }
    }
    
    if (data.length > 1) {
      return { data: null, error: { message: 'Multiple records found, expected exactly one' } }
    }
    
    return { data: data[0], error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Method 5: Using order and limit for consistent results
export const getConsistentSingleRecord = async (table: string, column: string, value: any, orderBy: string = 'created_at') => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(column, value)
      .order(orderBy, { ascending: false })
      .limit(1)
      .single()
    
    return { data, error }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}