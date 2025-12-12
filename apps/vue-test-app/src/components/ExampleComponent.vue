<template>
  <button @click="boom">Throw Error</button>
</template>
<script setup lang='ts'>
function boom(){
  throw new Error("Test error");
}
</script>