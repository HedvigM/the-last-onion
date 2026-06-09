<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageToggle from '@/components/LanguageToggle.vue'

const { t } = useI18n()
</script>

<template>
  <div class="marketing">
    <header class="m-nav">
      <RouterLink to="/" class="m-brand">{{ t('marketing.shell.brand') }}</RouterLink>
      <nav class="m-nav-links">
        <RouterLink to="/about" class="m-nav-link">{{ t('marketing.shell.about') }}</RouterLink>
        <a href="/#features" class="m-nav-link">{{ t('marketing.shell.features') }}</a>
        <LanguageToggle />
        <RouterLink to="/login" class="m-nav-link">{{ t('marketing.shell.signIn') }}</RouterLink>
        <RouterLink to="/login?register=1" class="m-btn m-btn-primary m-btn-sm">
          {{ t('marketing.shell.getStarted') }}
        </RouterLink>
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
        <h2>{{ t('marketing.shell.footerThanks') }}</h2>
      </div>

      <div class="m-footer-grid">
        <div class="m-footer-col">
          <RouterLink to="/" class="m-footer-logo">{{ t('nav.brand') }}</RouterLink>
          <p style="margin-top: 0.75rem">{{ t('marketing.shell.footerTagline') }}</p>
        </div>
        <div class="m-footer-col">
          <h3>{{ t('marketing.shell.explore') }}</h3>
          <RouterLink to="/">{{ t('marketing.shell.home') }}</RouterLink>
          <RouterLink to="/about">{{ t('marketing.shell.about') }}</RouterLink>
          <a href="/#features">{{ t('marketing.shell.features') }}</a>
        </div>
        <div class="m-footer-col">
          <h3>{{ t('marketing.shell.getStartedTitle') }}</h3>
          <RouterLink to="/login?register=1">{{ t('marketing.shell.createAccount') }}</RouterLink>
          <RouterLink to="/login">{{ t('marketing.shell.signIn') }}</RouterLink>
        </div>
        <div class="m-footer-col">
          <h3>{{ t('marketing.shell.builtFor') }}</h3>
          <p>{{ t('marketing.shell.builtForRoommates') }}</p>
          <p>{{ t('marketing.shell.builtForFamilies') }}</p>
          <p>{{ t('marketing.shell.builtForAnyone') }}</p>
        </div>
      </div>

      <div class="m-footer-bottom">
        <span>{{ t('marketing.shell.copyright') }}</span>
        <span>{{ t('marketing.shell.footerMeta') }}</span>
      </div>
    </div>
  </div>
</template>

<style>
@import '@/assets/landing.css';
</style>
