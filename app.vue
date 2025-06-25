<script setup lang="ts"></script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <ClientOnly>
        <NuxtPage />
      </ClientOnly>
    </NuxtLayout>
  </UApp>
</template>

<style>
/* Global variables */
:root {
  --c-selection-color: inherit;
  --c-selection-bg: #cce2ff;
  --c-input-selection-color: rgba(0, 0, 0, 0.87);
  --c-input-selection-bg: #cce2ff;
}

/* .text-link {
  @apply: text-blue hover: text-blue-600;
}

.text-link-active {
  @apply: hover: text-blue-600;
} */

/* selection */
::-webkit-selection {
  color: var(--c-selection-color);
  background-color: var(--c-selection-bg);
}
::-moz-selection {
  color: var(--c-selection-color);
  background-color: var(--c-selection-bg);
}
::selection {
  color: var(--c-selection-color);
  background-color: var(--c-selection-bg);
}
input::-webkit-selection,
textarea::-webkit-selection {
  color: var(--c-input-selection-color);
  background-color: var(--c-input-selection-bg);
}
input::-moz-selection,
textarea::-moz-selection {
  color: var(--c-input-selection-color);
  background-color: var(--c-input-selection-bg);
}
input::selection,
textarea::selection {
  color: var(--c-input-selection-color);
  background-color: var(--c-input-selection-bg);
}
</style>
