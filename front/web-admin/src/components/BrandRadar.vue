<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  {
    compact: false
  }
);
</script>

<template>
  <div class="radar-logo" :class="{ compact }" aria-hidden="true">
    <span class="logo-surface"></span>
    <span class="logo-ring ring-a"></span>
    <span class="logo-ring ring-b"></span>
    <span class="logo-ring ring-c"></span>
    <span class="logo-sweep"></span>
    <span class="logo-dot"></span>
    <span class="logo-book left"></span>
    <span class="logo-book right"></span>
    <span class="logo-book spine"></span>
  </div>
</template>

<style scoped>
.radar-logo {
  --logo-size: 68px;
  position: relative;
  width: var(--logo-size);
  height: var(--logo-size);
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, #42b1ff 0%, #1777ff 58%, #1f40c6 100%);
  box-shadow: 0 18px 34px rgba(23, 119, 255, 0.24);
}

.radar-logo.compact {
  --logo-size: 44px;
  border-radius: 14px;
}

.logo-surface {
  position: absolute;
  inset: 6px;
  border-radius: 16px 16px 20px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.04));
}

.radar-logo.compact .logo-surface {
  inset: 4px;
  border-radius: 11px 11px 14px 14px;
}

.logo-ring {
  position: absolute;
  left: 50%;
  border: 2px solid rgba(255, 255, 255, 0.88);
  border-bottom-color: transparent;
  border-left-color: transparent;
  border-radius: 999px;
  transform: translateX(-50%) rotate(-17deg);
  transform-origin: center;
}

.ring-a {
  top: 11px;
  width: 34px;
  height: 34px;
}

.ring-b {
  top: 7px;
  width: 43px;
  height: 43px;
  opacity: 0.8;
}

.ring-c {
  top: 2px;
  width: 52px;
  height: 52px;
  opacity: 0.56;
}

.radar-logo.compact .ring-a {
  top: 7px;
  width: 22px;
  height: 22px;
}

.radar-logo.compact .ring-b {
  top: 4px;
  width: 28px;
  height: 28px;
}

.radar-logo.compact .ring-c {
  top: 1px;
  width: 34px;
  height: 34px;
}

.logo-sweep {
  position: absolute;
  top: 25px;
  left: 50%;
  width: 2px;
  height: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), #ffffff);
  transform: translateX(-50%) rotate(50deg);
  transform-origin: top center;
  border-radius: 999px;
}

.radar-logo.compact .logo-sweep {
  top: 16px;
  height: 12px;
}

.logo-dot {
  position: absolute;
  top: 19px;
  right: 13px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dff4ff;
  box-shadow: 0 0 0 3px rgba(223, 244, 255, 0.2);
}

.radar-logo.compact .logo-dot {
  top: 12px;
  right: 8px;
  width: 5px;
  height: 5px;
}

.logo-book {
  position: absolute;
  bottom: 11px;
  width: 20px;
  height: 15px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(223, 240, 255, 0.84));
}

.logo-book.left {
  left: 12px;
  border-radius: 6px 2px 10px 12px;
  transform: skewY(10deg);
}

.logo-book.right {
  right: 12px;
  border-radius: 2px 6px 12px 10px;
  transform: skewY(-10deg);
}

.logo-book.spine {
  left: 50%;
  width: 8px;
  height: 17px;
  bottom: 10px;
  border-radius: 4px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #e6f5ff, #8fd0ff);
}

.radar-logo.compact .logo-book {
  bottom: 7px;
  width: 13px;
  height: 10px;
}

.radar-logo.compact .logo-book.left {
  left: 8px;
  border-radius: 4px 2px 8px 8px;
}

.radar-logo.compact .logo-book.right {
  right: 8px;
  border-radius: 2px 4px 8px 8px;
}

.radar-logo.compact .logo-book.spine {
  width: 6px;
  height: 12px;
  bottom: 6px;
}
</style>
