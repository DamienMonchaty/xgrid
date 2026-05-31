/**
 * Composable pour optimiser les styles du DataTable
 * Utilise la memoization pour éviter les recalculs inutiles
 */

import type { Column } from '../types/datatable.types'
import { SIZE_CLASSES, ALIGNMENT_CLASSES, REGEX_PATTERNS } from '../constants/datatable.constants'

// Cache pour les styles calculés
export const useDataTableStyles = () => {
  const stylesCache = new Map<string, Record<string, string>>()
  /**
   * Calcule les styles optimisés pour une colonne avec mise en cache
   * @param key - Clé de la colonne
   * @param column - Configuration de la colonne
   * @param columnWidths - Largeurs actuelles des colonnes
   * @returns Styles CSS pour la colonne
   */
  const getOptimizedColumnStyles = (
    key: string, 
    column: Column, 
    columnWidths: Record<string, number>
  ): Record<string, string> => {
    const currentWidth = columnWidths[key]
    
    // Créer une clé de cache basée sur les paramètres qui affectent le style
    const cacheKey = `${key}-${currentWidth}-${column.width}-${column.minWidth}-${column.maxWidth}`
    
    // Vérifier le cache
    if (stylesCache.has(cacheKey)) {
      return stylesCache.get(cacheKey)!
    }
    
    // Calculer les nouveaux styles
    const styles: Record<string, string> = {}
    
    if (currentWidth) {
      const widthValue = `${currentWidth}px !important`
      styles.width = widthValue
      styles.minWidth = widthValue
      styles.maxWidth = widthValue
    } else if (column.width) {
      const widthValue = typeof column.width === 'number' 
        ? `${column.width}px !important`
        : `${column.width} !important`
      
      if (typeof column.width === 'number') {
        styles.width = widthValue
        styles.minWidth = widthValue
        styles.maxWidth = widthValue
      } else {
        styles.width = widthValue
      }
    }
    
    // Ajouter les contraintes min/max si définies
    if (column.minWidth && !currentWidth) {
      styles.minWidth = typeof column.minWidth === 'number' 
        ? `${column.minWidth}px` 
        : column.minWidth
    }
    
    if (column.maxWidth && !currentWidth) {
      styles.maxWidth = typeof column.maxWidth === 'number' 
        ? `${column.maxWidth}px` 
        : column.maxWidth
    }
    
    // Mettre en cache et retourner
    stylesCache.set(cacheKey, styles)
    return styles
  }

  /**
   * Extrait les classes de couleur d'un string de classes CSS
   * @param textClasses - Classes CSS texte
   * @returns Classes de couleur uniquement
   */
  const extractColorClasses = (textClasses: string): string => {
    return textClasses.split(' ').filter(cls => 
      cls.startsWith('text-') && !REGEX_PATTERNS.SIZE_CLASS.test(cls)
    ).join(' ')
  }

  /**
   * Extrait les classes de taille d'un string de classes CSS
   * @param textClasses - Classes CSS texte
   * @returns Classes de taille uniquement
   */
  const extractSizeClasses = (textClasses: string): string => {
    return textClasses.split(' ').filter(cls => 
      REGEX_PATTERNS.SIZE_CLASS.test(cls)
    ).join(' ')
  }

  /**
   * Extrait les classes non-texte d'un string de classes CSS
   * @param textClasses - Classes CSS
   * @returns Classes non-texte
   */
  const extractNonTextClasses = (textClasses: string): string => {
    return textClasses.split(' ').filter(cls => !cls.startsWith('text-')).join(' ')
  }

  /**
   * Génère les classes CSS pour les en-têtes triables
   * @param column - Configuration de la colonne
   * @returns Classes CSS
   */
  const getSortableHeaderClasses = (column: Column): string => {
    const classes = ['flex items-center']
    
    // Gestion de l'alignement pour les en-têtes triables
    if (column.filterable) {
      switch (column.align) {
        case 'center':
          classes.push('justify-center relative')
          break
        case 'right':
          classes.push('justify-end gap-1')
          break
        case 'left':
        default:
          classes.push('justify-between')
          break
      }
    } else {
      switch (column.align) {
        case 'center':
          classes.push('justify-center')
          break
        case 'right':
          classes.push('justify-end')
          break
        case 'left':
        default:
          classes.push('justify-start')
          break
      }
    }
    
    return classes.join(' ')
  }

  /**
   * Génère les classes CSS pour les en-têtes non-triables
   * @param column - Configuration de la colonne
   * @returns Classes CSS
   */
  const getNonSortableHeaderClasses = (column: Column): string => {
    const classes = ['flex items-center']

    // Alignment via flex justification so the label follows column.align
    // (text-align on the <th> alone has no effect on flex children)
    if (column.filterable) {
      switch (column.align) {
        case 'center':
          classes.push('justify-center relative')
          break
        case 'right':
          classes.push('justify-end gap-1')
          break
        case 'left':
        default:
          classes.push('justify-between')
          break
      }
    } else {
      switch (column.align) {
        case 'center':
          classes.push('justify-center')
          break
        case 'right':
          classes.push('justify-end')
          break
        case 'left':
        default:
          classes.push('justify-start')
          break
      }
    }

    return classes.join(' ')
  }

  /**
   * Génère les classes CSS pour les cellules d'en-tête
   * @param key - Clé de la colonne
   * @param column - Configuration de la colonne (optionnelle)
   * @param theme - Thème actuel
   * @param draggedColumn - Colonne en cours de glisser-déposer
   * @returns Classes CSS
   */
  const getHeaderCellClasses = (
    key: string, 
    column: Column | undefined,
    theme: Record<string, string | undefined>,
    draggedColumn: string
  ): string => {
    const isUtilityCol = key === 'checkbox' || key === 'expand'

    const utilityPaddingClass = key === 'expand'
      ? 'px-1 py-2'
      : 'px-2 py-2'

    const classes = [
      isUtilityCol ? utilityPaddingClass : (theme.cellPadding || SIZE_CLASSES.md.cellPadding),
      isUtilityCol ? 'align-middle' : '',
      'relative group/column select-none transition-colors'
    ]

    // Curseur selon les capacités de la colonne
    if (column?.draggable) {
      classes.push('cursor-move')
    } else {
      classes.push('cursor-default')
    }

    // Classes de texte d'en-tête avec taille et couleur
    if (key !== 'checkbox' && key !== 'expand') {
      const headerTextClasses = theme.headerText || 'text-sm font-medium text-gray-700'
      classes.push(headerTextClasses)
    }

    // Alignement spécial pour certaines colonnes
    const specialAlignments: Record<string, string> = {
      actions: ALIGNMENT_CLASSES.right,
      checkbox: `${ALIGNMENT_CLASSES.center} w-8`,
      expand: `${ALIGNMENT_CLASSES.center} w-8`
    }
    
    if (specialAlignments[key]) {
      classes.push(specialAlignments[key])
    } else if (column?.align) {
      // Apply text alignment for the <th> based on column.align
      // (sortable headers also need this; browser default for <th> is text-align: center)
      classes.push(ALIGNMENT_CLASSES[column.align])
    } else if (!column && key !== 'actions' && key !== 'checkbox') {
      classes.push(ALIGNMENT_CLASSES.left)
    } else if (column && !column.align) {
      // Default to left alignment when no align is specified
      classes.push(ALIGNMENT_CLASSES.left)
    }

    // État de glisser-déposer
    if (draggedColumn === key) {
      classes.push('bg-blue-100')
    }

    // Bordures de cellule
    if (theme.cellBorder) {
      classes.push(theme.cellBorder)
    }

    return classes.filter(Boolean).join(' ')
  }

  /**
   * Génère les classes CSS pour les cellules du corps
   * @param key - Clé de la colonne
   * @param column - Configuration de la colonne (optionnelle)
   * @param theme - Thème actuel
   * @param wrapText - Si le texte doit être retourné à la ligne
   * @returns Classes CSS
   */
  const getBodyCellClasses = (
    key: string,
    column: Column | undefined,
    theme: Record<string, string | undefined>,
    wrapText: boolean
  ): string => {
    const isUtilityCol = key === 'checkbox' || key === 'expand'
    const utilityPaddingClass = key === 'expand'
      ? 'px-1 py-2'
      : 'px-2 py-2'

    const classes = [isUtilityCol ? utilityPaddingClass : (theme.cellPadding || SIZE_CLASSES.md.cellPadding)]

    if (isUtilityCol) {
      classes.push('align-middle')
    }

    // Appliquer les classes de texte du thème pour les cellules normales
    if (key !== 'loading' && key !== 'empty' && key !== 'checkbox' && key !== 'expand') {
      const rowTextClasses = theme.rowText || 'text-sm text-gray-900'
      classes.push(rowTextClasses)
    }

    // Alignement
    if (column?.align) {
      classes.push(ALIGNMENT_CLASSES[column.align])
    } else {
      const specialAlignments: Record<string, string> = {
        actions: ALIGNMENT_CLASSES.right,
        checkbox: ALIGNMENT_CLASSES.center,
        expand: ALIGNMENT_CLASSES.center,
        default: ALIGNMENT_CLASSES.left
      }
      classes.push(specialAlignments[key] || specialAlignments.default as string)
    }

    // Styles spéciaux selon la clé
    const specialStyles: Record<string, string> = {
      title: 'font-medium',
      loading: `${theme.loadingBackground || 'bg-gray-50'} py-6`,
      empty: `${theme.emptyBackground || 'bg-gray-50'} ${ALIGNMENT_CLASSES.center} py-6`
    }
    
    if (specialStyles[key]) {
      classes.push(specialStyles[key])
    }

    // Bordures
    if (theme.cellBorder) {
      classes.push(theme.cellBorder)
    }

    // Gestion du retour à la ligne - priorité à column.wrap si défini, sinon wrapText global
    if (!isUtilityCol) {
      const shouldWrap = column?.wrap !== undefined ? column.wrap : wrapText
      classes.push(shouldWrap ? 'break-words' : 'truncate')
    }

    return classes.filter(Boolean).join(' ')
  }

  /**
   * Vide le cache des styles (utile pour le développement)
   */
  const clearStylesCache = (): void => {
    stylesCache.clear()
  }

  /**
   * Obtient les statistiques du cache
   * @returns Statistiques du cache
   */
  const getCacheStats = () => {
    return {
      size: stylesCache.size,
      keys: Array.from(stylesCache.keys())
    }
  }

  return {
    getOptimizedColumnStyles,
    extractColorClasses,
    extractSizeClasses,
    extractNonTextClasses,
    getSortableHeaderClasses,
    getNonSortableHeaderClasses,
    getHeaderCellClasses,
    getBodyCellClasses,
    clearStylesCache,
    getCacheStats
  }
}
