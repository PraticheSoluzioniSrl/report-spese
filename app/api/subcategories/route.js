import { NextResponse } from 'next/server'
import { createSubcategory, getMainCategories, deleteSubcategory } from '../../../lib/supabase-db'
import { addDemoSubcategory, getDemoCategories, deleteDemoSubcategory } from '../../../lib/demo-storage'

export async function POST (req) {
  try {
    const fd = await req.formData()
    const name = String(fd.get('name') || '').trim()
    const mainCategoryId = String(fd.get('mainCategoryId') || '').trim()
    
    console.log('📥 POST /api/subcategories ricevuto:', { name, mainCategoryId })
    
    if (!name || !mainCategoryId) {
      console.error('❌ Parametri mancanti:', { name, mainCategoryId })
      return NextResponse.json({ error: 'Il nome e la categoria principale sono obbligatori' }, { status: 400 })
    }
    
    // Usa Supabase se configurato, altrimenti demo storage
    // Per gli ID demo (stringhe), passa direttamente la stringa
    // Per Supabase (numeri), prova a convertire in numero
    const isDemoId = mainCategoryId.startsWith('cat-') || mainCategoryId.startsWith('demo-')
    const categoryId = isDemoId ? mainCategoryId : (isNaN(parseInt(mainCategoryId)) ? mainCategoryId : parseInt(mainCategoryId))
    
    console.log('🔧 ID elaborato:', { mainCategoryId, isDemoId, categoryId })
    
    const subcategory = await createSubcategory({ name, mainCategoryId: categoryId })
    if (!subcategory) {
      console.error('❌ createSubcategory ha restituito null/undefined per:', { name, categoryId })
      return NextResponse.json({ error: 'Categoria principale non trovata o errore nella creazione' }, { status: 404 })
    }
    
    console.log('✅ Sottocategoria creata con successo:', subcategory)
    return NextResponse.json({ ok: true, subcategory })
  } catch (error) {
    console.error('❌ Errore nella creazione della sottocategoria:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json({ error: error.message || 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE (req) {
  try {
    const url = new URL(req.url)
    const main = url.searchParams.get('main')
    const sub = url.searchParams.get('sub')
    
    console.log('🗑️ Eliminazione sottocategoria richiesta:', { main, sub })
    
    if (!main || !sub) {
      console.error('❌ Parametri mancanti:', { main, sub })
      return NextResponse.json({ error: 'Parametri main e sub sono obbligatori' }, { status: 400 })
    }
    
    // Usa Supabase se configurato, altrimenti demo storage
    await deleteSubcategory({ mainCategoryName: main, subcategoryName: sub })
    
    console.log('✅ Sottocategoria eliminata con successo')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Errore nella cancellazione della sottocategoria:', error)
    console.error('❌ Stack:', error.stack)
    return NextResponse.json({ 
      error: error.message || 'Errore interno del server' 
    }, { status: 500 })
  }
}