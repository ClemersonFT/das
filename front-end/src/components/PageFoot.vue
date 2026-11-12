<template>
  <!-- Z, traço 3: contexto à esquerda, ação final à direita -->
  <footer class="page-foot">
    <div class="page-foot__left"><slot name="left" /></div>
    <div class="page-foot__right"><slot name="right" /></div>
  </footer>
</template>
