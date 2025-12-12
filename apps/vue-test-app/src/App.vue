<template><div><h1>Sourcemap Test</h1><ExampleComponent/></div></template>

<script setup lang='ts'>
import { defineAsyncComponent } from 'vue';

const ExampleComponent = defineAsyncComponent(() => 
  import('./components/ExampleComponent.vue')
);
</script> 