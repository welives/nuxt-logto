<template>
  <div>
    <div>Nuxt module playground!</div>
    <br>

    <div>{{ JSON.stringify(claims) }}</div>
    <br>

    <div>{{ JSON.stringify(userInfo) }}</div>
    <br>

    <div>{{ JSON.stringify(accessToken) }}</div>
    <br>

    <div>
      <button @click="() => signIn()">
        Sign In
      </button>
      <button @click="() => signUp()">
        Sign Up
      </button>
      <button @click="() => signOut()">
        Sign Out
      </button>
      <button @click="() => fetchContext({ fetchUserInfo: true, getAccessToken: true })">
        fetchContext
      </button>
      <button @click="() => fetchUserInfo()">
        fetchUserInfo
      </button>
      <button @click="() => fetchAccessToken({ resource: 'http://localhost:4000/api' })">
        fetchAccessToken
      </button>
    </div>
    <br>

    <div>
      <button @click="fetchCoursePacks">
        fetchCoursePacks
      </button>
      <button @click="() => fetchCoursePack('canufpk8uthjghssvkx4tvhj')">
        fetchCoursePack
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogto } from './.nuxt/imports'

const { claims, userInfo, accessToken, signIn, signOut, signUp, fetchContext, fetchUserInfo, fetchAccessToken } = useLogto()

async function fetchCoursePacks() {
  const { data } = await useFetch(`/api/course-pack`)
  console.log('app.vue', data.value)
}
async function fetchCoursePack(id: string) {
  const token = await getToken()
  const headers = new Headers()
  if (token.value) {
    headers.set('Authorization', `Bearer ${token.value}`)
  }
  const { data } = await useFetch(`/api/course-pack/${id}`, { headers })
  console.log('app.vue', data.value)
}
</script>
