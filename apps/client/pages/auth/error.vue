<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <div class="text-red-500 text-6xl mb-4">⚠</div>
      <h2 class="text-xl font-semibold mb-2">Authentication Error</h2>
      <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
      <div class="space-y-2">
        <button @click="retryAuth" class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Try Again
        </button>
        <button @click="goHome" class="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const errorMessage = computed(() => {
  const error = route.query.error
  const description = route.query.description

  if (description) return description
  if (error === 'access_denied') return 'You cancelled the authentication process.'
  if (error === 'unauthorized_client') return 'The application is not authorized.'
  if (error) return `Authentication error: ${error}`

  return 'An unknown authentication error occurred.'
})

const retryAuth = () => {
  router.push('/')
}

const goHome = () => {
  router.push('/')
}
</script>