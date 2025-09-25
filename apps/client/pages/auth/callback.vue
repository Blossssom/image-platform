<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div v-if="status === 'loading'" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Completing authentication...</p>
      </div>

      <div v-else-if="status === 'success'" class="text-center">
        <div class="text-green-500 text-6xl mb-4">✓</div>
        <h2 class="text-xl font-semibold mb-2">Authentication Successful!</h2>
        <p class="text-gray-600 mb-4">You have been successfully logged in.</p>
        <p class="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>

      <div v-else-if="status === 'error'" class="text-center">
        <div class="text-red-500 text-6xl mb-4">✗</div>
        <h2 class="text-xl font-semibold mb-2">Authentication Failed</h2>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        <button @click="goHome" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const status = ref('loading')
const errorMessage = ref('')

onMounted(() => {
  const token = route.query.token
  const error = route.query.error
  const errorDescription = route.query.description

  if (error) {
    status.value = 'error'
    errorMessage.value = errorDescription || error || 'Authentication failed'
    return
  }

  if (token) {
    // Store token and redirect to main app
    localStorage.setItem('accessToken', token)
    status.value = 'success'

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    status.value = 'error'
    errorMessage.value = 'No authentication token received'
  }
})

const goHome = () => {
  router.push('/')
}
</script>