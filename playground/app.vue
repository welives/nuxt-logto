<template>
  <div>
    <div>Nuxt module playground!</div>
    <br />

    <div>{{ JSON.stringify(claims) }}</div>
    <br />

    <div>{{ JSON.stringify(userInfo) }}</div>
    <br />

    <div>{{ JSON.stringify(accessToken) }}</div>
    <br />

    <div>
      <button @click="() => signIn()">Sign In</button>
      <button @click="() => signUp()">Sign Up</button>
      <button @click="() => signOut()">Sign Out</button>
      <button @click="() => fetchContext()">Refresh</button>
      <button @click="() => fetchUserInfo()">UserInfo</button>
      <button @click="() => fetchIdToken()">fetchIdToken</button>
    </div>
  </div>
</template>

<script setup>
import { useLogto } from './.nuxt/imports'
const { claims, userInfo, accessToken, signIn, signOut, signUp, fetchContext, fetchUserInfo, fetchIdToken } = useLogto()
</script>
