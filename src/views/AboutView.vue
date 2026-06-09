<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MarketingShell from '@/components/MarketingShell.vue'

const { t } = useI18n()

const beliefs = computed(() => [
  {
    emoji: '🧅',
    title: t('marketing.about.belief1Title'),
    text: t('marketing.about.belief1Text'),
  },
  {
    emoji: '🏡',
    title: t('marketing.about.belief2Title'),
    text: t('marketing.about.belief2Text'),
  },
  {
    emoji: '☕',
    title: t('marketing.about.belief3Title'),
    text: t('marketing.about.belief3Text'),
  },
])

const faqs = computed(() => [
  { q: t('marketing.about.faq1Q'), a: t('marketing.about.faq1A') },
  { q: t('marketing.about.faq2Q'), a: t('marketing.about.faq2A') },
  { q: t('marketing.about.faq3Q'), a: t('marketing.about.faq3A') },
  { q: t('marketing.about.faq4Q'), a: t('marketing.about.faq4A') },
])
</script>

<template>
  <MarketingShell>
    <section class="about-hero">
      <div class="about-hero-card m-card">
        <p class="about-eyebrow font-script">{{ t('marketing.about.eyebrow') }}</p>
        <h1 class="about-title font-serif">{{ t('marketing.about.title') }}</h1>
        <p class="about-lead">{{ t('marketing.about.lead') }}</p>
      </div>
    </section>

    <div class="m-ribbon">
      <p class="m-ribbon-inner">{{ t('marketing.about.ribbon') }}</p>
    </div>

    <section class="story-section">
      <div class="story-grid">
        <div class="story-col">
          <h2 class="font-serif">{{ t('marketing.about.shortVersion') }}</h2>
          <hr class="card-rule" />
          <p>{{ t('marketing.about.shortVersionP1') }}</p>
          <p>{{ t('marketing.about.shortVersionP2') }}</p>
        </div>
        <div class="story-col">
          <h2 class="font-serif">{{ t('marketing.about.whyWeMadeIt') }}</h2>
          <hr class="card-rule" />
          <p>{{ t('marketing.about.whyWeMadeItP1') }}</p>
          <p>{{ t('marketing.about.whyWeMadeItP2') }}</p>
        </div>
      </div>
    </section>

    <section class="beliefs-band">
      <h2 class="section-title font-serif" style="color: #fff">{{ t('marketing.about.whatWeBelieve') }}</h2>
      <div class="beliefs-grid">
        <article v-for="(item, i) in beliefs" :key="i" class="belief-card m-card">
          <span class="belief-emoji" aria-hidden="true">{{ item.emoji }}</span>
          <h3 class="font-serif">{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="faq-section">
      <div class="faq-box">
        <h2 class="section-title font-serif">{{ t('marketing.about.faqTitle') }}</h2>
        <dl class="faq-list">
          <div v-for="(item, i) in faqs" :key="i" class="faq-item">
            <dt>{{ item.q }}</dt>
            <dd>{{ item.a }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="about-cta">
      <RouterLink to="/login?register=1" class="m-btn m-btn-primary--green">
        {{ t('marketing.about.createFreeAccount') }}
      </RouterLink>
      <RouterLink to="/" class="m-btn m-btn-secondary">{{ t('marketing.about.backToHome') }}</RouterLink>
    </section>
  </MarketingShell>
</template>

<style scoped>
.about-hero {
  background: repeating-linear-gradient(
    90deg,
    var(--m-green-100, #d4e8dc) 0,
    var(--m-green-100, #d4e8dc) 10px,
    var(--m-cream, #f7f4ed) 10px,
    var(--m-cream, #f7f4ed) 20px
  );
  padding: 3rem 1.5rem;
  display: flex;
  justify-content: center;
}

.about-hero-card {
  max-width: 28rem;
  width: 100%;
  padding: 2.5rem 2rem;
  text-align: center;
}

.about-eyebrow {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--m-green-mid, #2d6a4f);
}

.about-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  color: var(--m-green-dark, #1b4332);
}

.about-lead {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--muted);
}

.story-section {
  padding: 3rem 1.5rem;
  background: var(--m-cream, #f7f4ed);
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  max-width: 56rem;
  margin: 0 auto;
}

.story-col h2 {
  margin: 0 0 0.75rem;
  font-size: 1.375rem;
  color: var(--m-green-dark, #1b4332);
}

.card-rule {
  border: none;
  border-top: 1.5px solid var(--m-green-dark, #1b4332);
  margin: 0 0 1rem;
  opacity: 0.2;
}

.story-col p {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--muted);
}

.story-col p:last-child {
  margin-bottom: 0;
}

.beliefs-band {
  background: var(--m-green-mid, #2d6a4f);
  padding: 3rem 1.5rem;
}

.beliefs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 56rem;
  margin: 0 auto;
}

.belief-card {
  padding: 1.5rem;
}

.belief-emoji {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.35rem;
}

.belief-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1.125rem;
  color: var(--m-green-dark, #1b4332);
}

.belief-card p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--muted);
}

.faq-section {
  padding: 3rem 1.5rem;
  background: var(--m-cream, #f7f4ed);
}

.faq-box {
  max-width: 32rem;
  margin: 0 auto;
  padding: 2rem 1.75rem;
  border: 2px dashed var(--m-green-mid, #2d6a4f);
  border-radius: 12px;
  background: var(--surface, #fff);
}

.faq-list {
  margin: 0;
}

.faq-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.faq-item dt {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.35rem;
  color: var(--m-green-dark, #1b4332);
}

.faq-item dd {
  margin: 0;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.55;
}

.about-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem 3rem;
  background: var(--m-cream, #f7f4ed);
}

@media (min-width: 768px) {
  .story-grid {
    grid-template-columns: 1fr 1fr;
  }

  .beliefs-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .about-cta {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
