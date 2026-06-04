<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MarketingShell from '@/components/MarketingShell.vue'

const features = [
  {
    icon: '🏠',
    title: 'Household lists',
    description:
      'Create lists for your home. Everyone in the household sees the same groceries — and what’s already in the cart.',
    tags: ['Multi-user', 'Free'],
  },
  {
    icon: '⚡',
    title: 'Live sync',
    description:
      'Check off milk on your phone while someone else adds bread. Changes show up instantly, no refresh needed.',
    tags: ['Real-time', 'No refresh'],
  },
  {
    icon: '🧅',
    title: 'Usual items',
    description:
      'Pin staples you always buy, or let the app learn your regulars. Add them to any list in one tap.',
    tags: ['Smart', 'One tap'],
  },
  {
    icon: '🛒',
    title: 'Smart categories',
    description:
      'Items sort into vegetables, dairy, baking, and more. Edit categories to match how your kitchen actually works.',
    tags: ['Auto-sort', 'Editable'],
  },
]
</script>

<template>
  <MarketingShell>
    <!-- Split hero -->
    <section class="hero">
      <div class="hero-visual">
        <div class="hero-frame m-card">
          <div class="hero-frame-inner">
            <span class="hero-onion" aria-hidden="true">🧅</span>
          </div>
          <span class="sticker sticker-tl" aria-hidden="true">est. 2026</span>
          <span class="sticker sticker-br font-script">household-ready</span>
        </div>
        <!-- whimsical doodles -->
        <svg class="doodle doodle-cart" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="12" cy="38" r="4" stroke="currentColor" stroke-width="2" />
          <circle cx="36" cy="38" r="4" stroke="currentColor" stroke-width="2" />
          <path d="M4 8h6l4 22h24l4-16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <div class="hero-copy">
        <p class="hero-eyebrow">Welcome to the heart of the kitchen</p>
        <h1 class="hero-headline font-serif">
          Shared grocery lists for people who share a fridge
        </h1>
        <p class="hero-body">
          A small, friendly app for the everyday chaos of feeding a home — without the group chat
          spiral or the second bag of onions.
        </p>
        <RouterLink to="/login?register=1" class="m-btn m-btn-primary--green">
          Get started free
        </RouterLink>
      </div>
    </section>

    <!-- Ribbon -->
    <div class="m-ribbon">
      <p class="m-ribbon-inner">
        Built for households · Real-time sync · Free to use
      </p>
    </div>

    <!-- Who we are + mission (green band, two cards) -->
    <section class="about-band">
      <div class="about-cards">
        <article class="about-card m-card">
          <h2 class="font-serif">Who we are</h2>
          <hr class="card-rule" />
          <p>
            The Last Onion is a shared grocery list app for people who live together. Roommates,
            partners, families — anyone who shops from the same fridge and wants to stay on the same
            page.
          </p>
        </article>
        <article class="about-card m-card">
          <h2 class="font-serif">Our mission</h2>
          <hr class="card-rule" />
          <p>
            Grocery shopping should feel like a shared chore chart, not a logistics puzzle. We built
            something calm, obvious, and a little bit whimsical — like a note on the fridge that
            syncs in real time.
          </p>
        </article>
      </div>
    </section>

    <!-- Features 2×2 grid -->
    <section id="features" class="features-section">
      <h2 class="section-title font-serif">What you get</h2>
      <p class="section-sub">Everything your kitchen table needs, nothing it doesn't.</p>

      <div class="feature-grid">
        <article v-for="feat in features" :key="feat.title" class="feature-card m-card-soft">
          <span class="feature-icon" aria-hidden="true">{{ feat.icon }}</span>
          <h3 class="font-serif">{{ feat.title }}</h3>
          <p>{{ feat.description }}</p>
          <div class="tag-row">
            <span v-for="tag in feat.tags" :key="tag" class="tag">✓ {{ tag }}</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Dashed CTA (scrapbook coupon feel) -->
    <section class="cta-section">
      <div class="cta-dashed">
        <span class="cta-sticker font-script">ready when you are</span>
        <h2 class="font-serif">Start your first shared list today</h2>
        <p>
          Create a household, invite the people you live with, and never wonder who’s buying the
          onions again. Setup takes about a minute.
        </p>
        <div class="cta-actions">
          <RouterLink to="/login?register=1" class="m-btn m-btn-primary--green">
            Create free account
          </RouterLink>
          <RouterLink to="/about" class="m-btn m-btn-secondary">Learn more</RouterLink>
        </div>
      </div>
    </section>
  </MarketingShell>
</template>

<style scoped>
/* ——— Hero split ——— */
.hero {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 28rem;
}

.hero-visual {
  position: relative;
  background: repeating-linear-gradient(
    90deg,
    var(--m-green-100, #d4e8dc) 0,
    var(--m-green-100, #d4e8dc) 10px,
    var(--m-cream, #f7f4ed) 10px,
    var(--m-cream, #f7f4ed) 20px
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
}

.hero-frame {
  position: relative;
  width: min(100%, 16rem);
  aspect-ratio: 4 / 5;
  border-radius: 16px;
  overflow: visible;
  padding: 0;
}

.hero-frame-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--m-green-50, #e8f5ee);
  border-radius: 14px;
}

.hero-onion {
  font-size: 5rem;
  line-height: 1;
  transform: rotate(-6deg);
}

.sticker {
  position: absolute;
  background: var(--m-green-mid, #2d6a4f);
  color: #fff;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}

.sticker-tl {
  top: -0.5rem;
  left: -0.5rem;
  transform: rotate(-8deg);
}

.sticker-br {
  bottom: -0.5rem;
  right: -0.75rem;
  transform: rotate(4deg);
  font-size: 0.875rem;
  letter-spacing: 0;
  text-transform: none;
  background: var(--m-cream, #f7f4ed);
  color: var(--m-green-dark, #1b4332);
  border: 1.5px solid var(--m-green-dark, #1b4332);
}

.doodle {
  position: absolute;
  width: 2.5rem;
  color: var(--m-green-mid, #2d6a4f);
  opacity: 0.5;
}

.doodle-cart {
  bottom: 1.5rem;
  right: 1.5rem;
}

.hero-copy {
  background: var(--m-cream, #f7f4ed);
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.hero-eyebrow {
  margin: 0;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--m-green-mid, #2d6a4f);
}

.hero-headline {
  margin: 0;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  line-height: 1.15;
  color: var(--m-green-dark, #1b4332);
  max-width: 14ch;
}

.hero-body {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--muted);
  max-width: 32ch;
}

/* ——— About band ——— */
.about-band {
  background: var(--m-green-mid, #2d6a4f);
  padding: 2.5rem 1.5rem;
}

.about-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 56rem;
  margin: 0 auto;
}

.about-card {
  padding: 1.75rem;
  background: #f7f4ed;
  color: #1b4332;
}

.about-card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.375rem;
  color: #1b4332;
}

.card-rule {
  border: none;
  border-top: 1.5px solid #1b4332;
  margin: 0 0 1rem;
  opacity: 0.2;
}

.about-card p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #2f3d36;
}

/* ——— Features ——— */
.features-section {
  padding: 3rem 1.5rem;
  background: var(--m-cream, #f7f4ed);
  text-align: center;
}

.features-section .section-title,
.features-section .section-sub {
  text-align: center;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
}

.features-section .section-sub {
  margin-bottom: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 56rem;
  margin: 0 auto;
}

.feature-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  text-align: left;
}

.feature-icon {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  color: var(--m-green-dark, #1b4332);
}

.feature-card p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--muted);
  flex: 1;
}

/* ——— CTA dashed ——— */
.cta-section {
  padding: 3rem 1.5rem 4rem;
  background: var(--m-cream, #f7f4ed);
}

.cta-dashed {
  position: relative;
  max-width: 32rem;
  margin: 0 auto;
  padding: 2.5rem 1.75rem;
  text-align: center;
  border: 2px dashed var(--m-green-mid, #2d6a4f);
  border-radius: 12px;
  background: var(--surface, #fff);
}

.cta-sticker {
  position: absolute;
  top: -0.85rem;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  background: var(--m-green-100, #d4e8dc);
  color: var(--m-green-dark, #1b4332);
  padding: 0.25rem 1rem;
  font-size: 1rem;
  white-space: nowrap;
  border: 1.5px solid var(--m-green-mid, #2d6a4f);
  border-radius: 4px;
}

.cta-dashed h2 {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.5rem;
  color: var(--m-green-dark, #1b4332);
}

.cta-dashed p {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--muted);
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

@media (min-width: 768px) {
  .hero {
    grid-template-columns: 1fr 1fr;
  }

  .about-cards {
    grid-template-columns: 1fr 1fr;
  }

  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cta-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
