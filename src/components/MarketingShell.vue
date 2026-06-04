<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="marketing">
    <header class="m-nav">
      <RouterLink to="/" class="m-brand">the last onion</RouterLink>
      <nav class="m-nav-links">
        <RouterLink to="/about" class="m-nav-link">About</RouterLink>
        <a href="/#features" class="m-nav-link">Features</a>
        <RouterLink to="/login" class="m-nav-link">Sign in</RouterLink>
        <RouterLink to="/login?register=1" class="m-btn m-btn-primary m-btn-sm">Get started</RouterLink>
      </nav>
    </header>

    <slot />

    <div class="m-footer-wrap">
      <svg class="m-wavy" viewBox="0 0 1200 12" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 6 Q150 0 300 6 T600 6 T900 6 T1200 6 V12 H0 Z"
          fill="currentColor"
        />
      </svg>

      <div class="m-footer-hero">
        <h2>Thanks for stopping by.</h2>
      </div>

      <div class="m-footer-grid">
        <div class="m-footer-col">
          <RouterLink to="/" class="m-footer-logo">🧅 The Last Onion</RouterLink>
          <p style="margin-top: 0.75rem">
            Shared grocery lists for households. One fridge, one list, fewer duplicate onions.
          </p>
        </div>
        <div class="m-footer-col">
          <h3>Explore</h3>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
          <a href="/#features">Features</a>
        </div>
        <div class="m-footer-col">
          <h3>Get started</h3>
          <RouterLink to="/login?register=1">Create account</RouterLink>
          <RouterLink to="/login">Sign in</RouterLink>
        </div>
        <div class="m-footer-col">
          <h3>Built for</h3>
          <p>Roommates & partners</p>
          <p>Families & shared homes</p>
          <p>Anyone who shops together</p>
        </div>
      </div>

      <div class="m-footer-bottom">
        <span>© The Last Onion</span>
        <span>Free to use · Real-time sync</span>
      </div>
    </div>
  </div>
</template>

<style>
@import '@/assets/landing.css';
</style>
