<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtRouteAnnouncer />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">
        AI Image Platform - API Test Dashboard
      </h1>

      <!-- Server Status & Auth -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h2 class="text-2xl font-semibold mb-4">Server Status</h2>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <div :class="serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'"
                       class="w-3 h-3 rounded-full mr-2"></div>
                  <span class="font-medium">{{ serverStatus === 'online' ? 'Online' : 'Offline' }}</span>
                </div>
                <button @click="checkServerStatus"
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Check Status
                </button>
              </div>
              <div v-if="serverInfo" class="mt-4 text-sm text-gray-600">
                <p>Server: {{ serverInfo.url }}</p>
                <p>Last checked: {{ new Date(serverInfo.lastCheck).toLocaleTimeString() }}</p>
              </div>
            </div>

            <!-- Auth Section -->
            <div class="ml-8">
              <h3 class="text-lg font-semibold mb-2">Authentication</h3>
              <div v-if="!isLoggedIn" class="space-y-2">
                <p class="text-sm text-gray-600 mb-2">Login to access APIs:</p>
                <div class="flex gap-2">
                  <button @click="testLogin"
                          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Test Login
                  </button>
                  <button @click="loginWithGoogle" disabled
                          class="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed">
                    Google (OAuth setup needed)
                  </button>
                </div>
                <p class="text-xs text-gray-500">Use "Test Login" for now (OAuth needs configuration)</p>
              </div>

              <div v-if="isLoggedIn" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs font-bold">{{ userInitial }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ userProfile?.username || userProfile?.displayName }}</p>
                    <p class="text-xs text-gray-500">{{ userProfile?.email }}</p>
                  </div>
                </div>
                <button @click="logout"
                        class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="mb-6">
        <div class="flex space-x-1 bg-white p-1 rounded-lg shadow">
          <button v-for="tab in tabs" :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
                  class="px-4 py-2 rounded-md font-medium transition-colors">
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow p-6">
        <!-- Images Tab -->
        <div v-if="activeTab === 'images'">
          <h3 class="text-xl font-semibold mb-4">Image Management</h3>

          <!-- Image Upload -->
          <div class="mb-6 p-4 border rounded-lg">
            <h4 class="font-medium mb-2">Upload Image</h4>
            <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*"
                   class="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            <div class="flex gap-2 mb-2">
              <input v-model="imageTitle" placeholder="Image title"
                     class="flex-1 p-2 border rounded">
              <input v-model="imageDescription" placeholder="Description"
                     class="flex-1 p-2 border rounded">
            </div>
            <textarea v-model="generationParams" placeholder="Generation parameters (optional)"
                      class="w-full p-2 border rounded mb-2" rows="2"></textarea>
            <button @click="uploadImage" :disabled="!selectedFile || uploading"
                    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300">
              {{ uploading ? 'Uploading...' : 'Upload Image' }}
            </button>
          </div>

          <!-- Images List -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium">Recent Images</h4>
              <button @click="loadImages" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                Refresh
              </button>
            </div>
            <div v-if="images.length === 0" class="text-gray-500 text-center py-4">
              No images found
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="image in images" :key="image.id"
                   class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                  <img v-if="image.urls?.thumbnail" :src="getImageUrl(image.urls.thumbnail)"
                       :alt="image.title" class="max-w-full max-h-full object-contain rounded">
                  <span v-else class="text-gray-400">No preview</span>
                </div>
                <h5 class="font-medium truncate">{{ image.title || 'Untitled' }}</h5>
                <p class="text-sm text-gray-600">{{ image.user?.username || 'Unknown' }}</p>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatDate(image.createdAt) }}
                </div>
                <div v-if="image.hasWorkflow" class="mt-2">
                  <button @click="loadWorkflowForImage(image.id)"
                          class="text-blue-500 text-sm hover:underline">
                    View Workflow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workflows Tab -->
        <div v-if="activeTab === 'workflows'">
          <h3 class="text-xl font-semibold mb-4">Workflow Management</h3>

          <!-- Workflow Parser Test -->
          <div class="mb-6 p-4 border rounded-lg">
            <h4 class="font-medium mb-2">Test Workflow Parser</h4>
            <textarea v-model="testWorkflowJson" placeholder="Paste ComfyUI workflow JSON here..."
                      class="w-full p-2 border rounded mb-2" rows="6"></textarea>
            <div class="flex gap-2">
              <button @click="parseWorkflow" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Parse Workflow
              </button>
              <button @click="checkDuplicate" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                Check Duplicate
              </button>
            </div>
            <div v-if="workflowParseResult" class="mt-4 p-3 bg-gray-100 rounded">
              <pre class="text-sm overflow-auto">{{ JSON.stringify(workflowParseResult, null, 2) }}</pre>
            </div>
          </div>

          <!-- Workflows List -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium">Workflows</h4>
              <div class="flex gap-2">
                <button @click="loadWorkflows('trending')"
                        class="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600">
                  Trending
                </button>
                <button @click="loadWorkflows('recent')"
                        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Recent
                </button>
              </div>
            </div>
            <div v-if="workflows.length === 0" class="text-gray-500 text-center py-4">
              No workflows found
            </div>
            <div v-else class="space-y-4">
              <div v-for="workflow in workflows" :key="workflow.id"
                   class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h5 class="font-medium">{{ workflow.title || 'Untitled Workflow' }}</h5>
                    <p class="text-sm text-gray-600 mt-1">{{ workflow.description || 'No description' }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{{ workflow.nodeCount || 0 }} nodes</span>
                      <span>Difficulty: {{ workflow.difficultyLevel || 'N/A' }}</span>
                      <span>Downloads: {{ workflow.downloadCount || 0 }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button @click="downloadWorkflow(workflow.id)"
                            class="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">
                      Download
                    </button>
                    <button @click="forkWorkflow(workflow.id)"
                            class="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600">
                      Fork
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Test Tab -->
        <div v-if="activeTab === 'api'">
          <h3 class="text-xl font-semibold mb-4">API Endpoint Tests</h3>

          <div class="space-y-4">
            <div v-for="endpoint in apiEndpoints" :key="endpoint.url"
                 class="border rounded-lg p-4">
              <div class="flex justify-between items-center">
                <div>
                  <span :class="getMethodColor(endpoint.method)"
                        class="px-2 py-1 rounded text-xs font-mono font-bold">
                    {{ endpoint.method }}
                  </span>
                  <span class="ml-2 font-mono">{{ endpoint.url }}</span>
                </div>
                <button @click="testEndpoint(endpoint)"
                        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Test
                </button>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ endpoint.description }}</p>
              <div v-if="endpoint.result" class="mt-2 p-2 bg-gray-100 rounded text-xs">
                <div class="flex justify-between">
                  <span>Status: {{ endpoint.result.status }}</span>
                  <span>{{ endpoint.result.time }}ms</span>
                </div>
                <pre v-if="endpoint.result.data" class="mt-2 overflow-auto max-h-32">{{ JSON.stringify(endpoint.result.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const serverUrl = 'http://localhost:5000'

// Reactive state
const activeTab = ref('images')
const serverStatus = ref('unknown')
const serverInfo = ref(null)

// Auth state
const isLoggedIn = ref(false)
const userProfile = ref(null)
const accessToken = ref(null)

// Images
const images = ref([])
const selectedFile = ref(null)
const uploading = ref(false)
const imageTitle = ref('')
const imageDescription = ref('')
const generationParams = ref('')

// Workflows
const workflows = ref([])
const testWorkflowJson = ref('')
const workflowParseResult = ref(null)

// Tab configuration
const tabs = [
  { id: 'images', name: 'Images' },
  { id: 'workflows', name: 'Workflows' },
  { id: 'api', name: 'API Tests' }
]

// API endpoints for testing
const apiEndpoints = ref([
  { method: 'GET', url: '/health', description: 'Health check', result: null },
  { method: 'GET', url: '/images', description: 'List images', result: null },
  { method: 'GET', url: '/workflows', description: 'List workflows', result: null },
  { method: 'GET', url: '/workflows/trending', description: 'Trending workflows', result: null },
  { method: 'GET', url: '/workflows/recent', description: 'Recent workflows', result: null },
])

// Methods
const checkServerStatus = async () => {
  try {
    const start = Date.now()
    const response = await fetch(`${serverUrl}/health`)
    const time = Date.now() - start

    if (response.ok) {
      serverStatus.value = 'online'
      serverInfo.value = {
        url: serverUrl,
        lastCheck: new Date().toISOString(),
        responseTime: time
      }
    } else {
      serverStatus.value = 'offline'
    }
  } catch (error) {
    serverStatus.value = 'offline'
    console.error('Server check failed:', error)
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadImage = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    if (imageTitle.value) formData.append('title', imageTitle.value)
    if (imageDescription.value) formData.append('description', imageDescription.value)
    if (generationParams.value) formData.append('generationParams', generationParams.value)

    const headers = {}
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }

    const response = await fetch(`${serverUrl}/images/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Upload successful:', result)
      // Reset form
      selectedFile.value = null
      imageTitle.value = ''
      imageDescription.value = ''
      generationParams.value = ''
      if (fileInput.value) fileInput.value.value = ''

      // Reload images
      await loadImages()
    } else {
      console.error('Upload failed:', response.statusText)
    }
  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    uploading.value = false
  }
}

const loadImages = async () => {
  try {
    const response = await fetchWithAuth(`${serverUrl}/images`)
    if (response.ok) {
      const result = await response.json()
      images.value = result.images || []
    } else if (response.status === 401) {
      console.log('Authentication required for loading images')
    }
  } catch (error) {
    console.error('Failed to load images:', error)
  }
}

const loadWorkflows = async (type = 'recent') => {
  try {
    const url = type === 'trending' ? `${serverUrl}/workflows/trending` : `${serverUrl}/workflows`
    const response = await fetchWithAuth(url)
    if (response.ok) {
      const result = await response.json()
      workflows.value = Array.isArray(result) ? result : (result.workflows || [])
    } else if (response.status === 401) {
      console.log('Authentication required for loading workflows')
    }
  } catch (error) {
    console.error('Failed to load workflows:', error)
  }
}

const parseWorkflow = async () => {
  if (!testWorkflowJson.value.trim()) return

  try {
    const workflowData = JSON.parse(testWorkflowJson.value)
    const response = await fetchWithAuth(`${serverUrl}/workflows/parse`, {
      method: 'POST',
      body: JSON.stringify({ workflowData })
    })

    if (response.ok) {
      workflowParseResult.value = await response.json()
    }
  } catch (error) {
    console.error('Parse error:', error)
    workflowParseResult.value = { error: error.message }
  }
}

const checkDuplicate = async () => {
  if (!testWorkflowJson.value.trim()) return

  try {
    const workflowData = JSON.parse(testWorkflowJson.value)
    const response = await fetchWithAuth(`${serverUrl}/workflows/duplicate-check`, {
      method: 'POST',
      body: JSON.stringify({ workflowData })
    })

    if (response.ok) {
      workflowParseResult.value = await response.json()
    }
  } catch (error) {
    console.error('Duplicate check error:', error)
  }
}

const downloadWorkflow = async (workflowId) => {
  try {
    const response = await fetchWithAuth(`${serverUrl}/workflows/${workflowId}/download`)
    if (response.ok) {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflow_${workflowId}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Download error:', error)
  }
}

const forkWorkflow = async (workflowId) => {
  try {
    const response = await fetchWithAuth(`${serverUrl}/workflows/${workflowId}/fork`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Forked Workflow',
        description: 'Forked from original workflow'
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Fork successful:', result)
      await loadWorkflows()
    }
  } catch (error) {
    console.error('Fork error:', error)
  }
}

const testEndpoint = async (endpoint) => {
  try {
    const start = Date.now()
    const response = await fetchWithAuth(`${serverUrl}${endpoint.url}`)
    const time = Date.now() - start

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text()

    endpoint.result = {
      status: response.status,
      time,
      data: typeof data === 'string' && data.length > 200 ? data.substring(0, 200) + '...' : data
    }
  } catch (error) {
    endpoint.result = {
      status: 'ERROR',
      time: 0,
      data: error.message
    }
  }
}

const getMethodColor = (method) => {
  const colors = {
    GET: 'bg-blue-500 text-white',
    POST: 'bg-green-500 text-white',
    PUT: 'bg-yellow-500 text-white',
    DELETE: 'bg-red-500 text-white'
  }
  return colors[method] || 'bg-gray-500 text-white'
}

const getImageUrl = (path) => {
  return path.startsWith('http') ? path : `${serverUrl}${path}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const loadWorkflowForImage = async (imageId) => {
  try {
    const response = await fetchWithAuth(`${serverUrl}/workflows/image/${imageId}`)
    if (response.ok) {
      const workflow = await response.json()
      console.log('Workflow for image:', workflow)
      // Switch to workflows tab and show result
      activeTab.value = 'workflows'
      workflowParseResult.value = workflow
    }
  } catch (error) {
    console.error('Failed to load workflow for image:', error)
  }
}

// Initialize
onMounted(async () => {
  initAuth()
  await checkServerStatus()
  if (serverStatus.value === 'online') {
    await loadImages()
    await loadWorkflows()
  }
})

// Template refs
const fileInput = ref(null)

// Auth methods
const testLogin = async () => {
  try {
    const response = await fetch(`${serverUrl}/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const result = await response.json()
      accessToken.value = result.accessToken
      userProfile.value = result.user
      isLoggedIn.value = true

      // Store in localStorage
      localStorage.setItem('accessToken', result.accessToken)
      localStorage.setItem('userProfile', JSON.stringify(result.user))

      console.log('Test login successful:', result)
    } else {
      console.error('Test login failed:', response.statusText)
    }
  } catch (error) {
    console.error('Test login error:', error)
  }
}

const loginWithGoogle = () => {
  window.location.href = `${serverUrl}/auth/google`
}

const loginWithGitHub = () => {
  window.location.href = `${serverUrl}/auth/github`
}

const loginWithFacebook = () => {
  window.location.href = `${serverUrl}/auth/facebook`
}

const logout = async () => {
  try {
    if (accessToken.value) {
      await fetch(`${serverUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear local auth data
    isLoggedIn.value = false
    userProfile.value = null
    accessToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userProfile')
  }
}

const loadUserProfile = async () => {
  if (!accessToken.value) return

  try {
    const response = await fetch(`${serverUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
      }
    })

    if (response.ok) {
      userProfile.value = await response.json()
      isLoggedIn.value = true
      localStorage.setItem('userProfile', JSON.stringify(userProfile.value))
    } else {
      // Token might be invalid
      logout()
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    logout()
  }
}

const handleAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  if (token) {
    accessToken.value = token
    localStorage.setItem('accessToken', token)
    loadUserProfile()

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

const initAuth = () => {
  // Check for stored token
  const storedToken = localStorage.getItem('accessToken')
  const storedProfile = localStorage.getItem('userProfile')

  if (storedToken) {
    accessToken.value = storedToken
    if (storedProfile) {
      userProfile.value = JSON.parse(storedProfile)
      isLoggedIn.value = true
    }
    // Verify token is still valid
    loadUserProfile()
  }

  // Check for auth callback
  handleAuthCallback()
}

// Computed properties
const userInitial = computed(() => {
  if (userProfile.value?.displayName) {
    return userProfile.value.displayName.charAt(0).toUpperCase()
  }
  if (userProfile.value?.username) {
    return userProfile.value.username.charAt(0).toUpperCase()
  }
  if (userProfile.value?.email) {
    return userProfile.value.email.charAt(0).toUpperCase()
  }
  return '?'
})

// Helper function to add auth headers
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (accessToken.value) {
    headers['Authorization'] = `Bearer ${accessToken.value}`
  }

  return fetch(url, {
    ...options,
    headers
  })
}
</script>
