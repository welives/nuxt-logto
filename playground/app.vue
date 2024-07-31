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
      <button @click="() => fetchAccessToken({ resource: 'http://localhost:4000' })">
        fetchAccessToken
      </button>
    </div>
  </div>
</template>

<script setup>
import { useLogto } from './.nuxt/imports'

const { claims, userInfo, accessToken, signIn, signOut, signUp, fetchContext, fetchUserInfo, fetchAccessToken } = useLogto()
</script>
