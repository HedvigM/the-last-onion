<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MarketingShell from '@/components/MarketingShell.vue'

const beliefs = [
  {
    emoji: '🧅',
    title: 'One onion is enough',
    text: 'Re-add “carrots” and we reuse the same row — no duplicate lines cluttering your list.',
  },
  {
    emoji: '🏡',
    title: 'Built for homes',
    text: 'Households, shared fridges, the people you actually cook with. Simple invites, no corporate nonsense.',
  },
  {
    emoji: '☕',
    title: 'Low-key by design',
    text: 'No gamification, no streaks, no guilt. Just a list that stays in sync.',
  },
]

const faqs = [
  {
    q: 'Is it really free?',
    a: 'Yep. Make lists, invite your household, shop together. No paywall for the basics.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'Nope — it works in your browser. You can add it to your home screen on your phone if you like.',
  },
  {
    q: 'What if someone isn’t in my household?',
    a: 'Invite them to a specific list instead. Handy for dinner parties or shared Costco runs.',
  },
  {
    q: 'Why “The Last Onion”?',
    a: 'Because someone always buys a second bag of onions. We’re trying to fix that.',
  },
]
</script>

<template>
  <MarketingShell>
    <!-- Hero card on stripes -->
    <section class="about-hero">
      <div class="about-hero-card m-card">
        <p class="about-eyebrow font-script">nice to meet you</p>
        <h1 class="about-title font-serif">About The Last Onion</h1>
        <p class="about-lead">
          A tiny app with a big job: keep everyone in your home on the same grocery page — without
          the drama.
        </p>
      </div>
    </section>

    <div class="m-ribbon">
      <p class="m-ribbon-inner">A note on the fridge, but it syncs in real time</p>
    </div>

    <!-- Story: two columns -->
    <section class="story-section">
      <div class="story-grid">
        <div class="story-col">
          <h2 class="font-serif">The short version</h2>
          <hr class="card-rule" />
          <p>
            The Last Onion is a shared grocery list for households. You make lists, add items, check
            things off, and everyone sees the updates right away. Categories keep vegetables
            separate from dairy. “Usual items” remembers the stuff you buy all the time.
          </p>
          <p>That’s pretty much it — on purpose.</p>
        </div>
        <div class="story-col">
          <h2 class="font-serif">Why we made it</h2>
          <hr class="card-rule" />
          <p>
            Shared shopping sounds simple until it isn’t. Texts get buried. Paper lists vanish.
            Someone swears they told you about the milk.
          </p>
          <p>
            We wanted something calm and obvious — a single place where the whole household can see
            what’s needed and what’s already in the cart.
          </p>
        </div>
      </div>
    </section>

    <!-- Beliefs on green band -->
    <section class="beliefs-band">
      <h2 class="section-title font-serif" style="color: #fff">What we believe</h2>
      <div class="beliefs-grid">
        <article v-for="item in beliefs" :key="item.title" class="belief-card m-card">
          <span class="belief-emoji" aria-hidden="true">{{ item.emoji }}</span>
          <h3 class="font-serif">{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <!-- FAQ in dashed box -->
    <section class="faq-section">
      <div class="faq-box">
        <h2 class="section-title font-serif">Questions you might have</h2>
        <dl class="faq-list">
          <div v-for="item in faqs" :key="item.q" class="faq-item">
            <dt>{{ item.q }}</dt>
            <dd>{{ item.a }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta">
      <RouterLink to="/login?register=1" class="m-btn m-btn-primary--green">Create free account</RouterLink>
      <RouterLink to="/" class="m-btn m-btn-secondary">Back to home</RouterLink>
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
