<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close') }" :title="`登录 PikPak 账号`">
    <template #body>
      <LoginForm @submitted="emit('close')"></LoginForm>
    </template>
  </UModal>
</template>
