<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })

// Déterminer le type d'erreur et le message approprié
const errorInfo = computed(() => {
  const statusCode = props.error?.statusCode || 500
  const statusMessage = props.error?.statusMessage || 'Erreur interne du serveur'
  
  let title = 'Une erreur est survenue'
  let description = 'Nous nous excusons pour ce désagrément.'
  let icon = 'i-lucide-alert-triangle'
  
  switch (statusCode) {
    case 404:
      title = 'Page non trouvée'
      description = 'La page que vous recherchez n\'existe pas.'
      icon = 'i-lucide-search-x'
      break
    case 403:
      title = 'Accès refusé'
      description = 'Vous n\'avez pas l\'autorisation d\'accéder à cette page.'
      icon = 'i-lucide-shield-x'
      break
    case 500:
      title = 'Erreur du serveur'
      description = 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
      icon = 'i-lucide-server-crash'
      break
    default:
      title = `Erreur ${statusCode}`
      description = statusMessage
  }
  
  return { statusCode, title, description, icon }
})

// Meta pour SEO
useSeoMeta({
  title: () => `${errorInfo.value.statusCode} - ${errorInfo.value.title}`,
  robots: 'noindex,nofollow'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Icône d'erreur -->
      <div class="mb-8">
        <UIcon 
          :name="errorInfo.icon" 
          class="mx-auto text-6xl text-red-500 mb-4" 
        />
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ errorInfo.statusCode }}
        </h1>
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {{ errorInfo.title }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ errorInfo.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <UButton 
          @click="handleError" 
          size="lg" 
          class="w-full"
          icon="i-lucide-home"
        >
          Retour à l'accueil
        </UButton>
        
        <UButton 
          @click="$router.go(-1)" 
          variant="outline" 
          size="lg" 
          class="w-full"
          icon="i-lucide-arrow-left"
        >
          Page précédente
        </UButton>
      </div>

      <!-- Détails techniques (en mode développement) -->
      <div v-if="$config.public.dev && error?.stack" class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
        <details>
          <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Détails techniques
          </summary>
          <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{{ error.stack }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>
