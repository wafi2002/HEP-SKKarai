<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { login } = useAuth()

const username = ref('')
const password = ref('')
const checkbox = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Username dan password required'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await login({
      username: username.value,
      password: password.value,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    errorMessage.value = error.data?.message || error.message || 'Login failed. Sila cuba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
    <v-form @submit.prevent="handleLogin">
        <v-row class="d-flex mb-3">
            <v-col cols="12" v-if="errorMessage">
                <v-alert
                    type="error"
                    variant="tonal"
                    closable
                    @click:close="errorMessage = ''"
                >
                    {{ errorMessage }}
                </v-alert>
            </v-col>

            <v-col cols="12">
                <v-label class="font-weight-bold mb-1">Username</v-label>
                <v-text-field 
                    v-model="username"
                    variant="outlined" 
                    color="primary"
                    :disabled="loading"
                    required
                ></v-text-field>
            </v-col>

            <v-col cols="12">
                <v-label class="font-weight-bold mb-1">Password</v-label>
                <v-text-field 
                    v-model="password"
                    variant="outlined" 
                    :type="showPassword ? 'text' : 'password'"
                    color="primary"
                    :disabled="loading"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    required
                ></v-text-field>
            </v-col>

            <v-col cols="12" class="pt-0">
                <div class="d-flex flex-wrap align-center ml-n2">
                    <v-checkbox 
                        v-model="checkbox" 
                        color="primary" 
                        hide-details
                        :disabled="loading"
                    >
                        <template v-slot:label class="text-body-1">Remember this Device</template>
                    </v-checkbox>
                    <div class="ml-sm-auto">
                        <NuxtLink 
                            to="/auth/forgot-password"
                            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
                        >
                            Forgot Password ?
                        </NuxtLink>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" class="pt-0">
                <v-btn 
                    type="submit"
                    color="primary" 
                    size="large" 
                    block 
                    flat
                    :loading="loading"
                    :disabled="loading"
                >
                    Sign in
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>