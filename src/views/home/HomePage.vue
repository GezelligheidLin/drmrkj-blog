<template>
  <div class="home-page">
    <div class="scene" aria-hidden="true">
      <div class="scene-grid"></div>
      <div class="scene-beam scene-beam-left"></div>
      <div class="scene-beam scene-beam-right"></div>
      <div class="scene-horizon"></div>
    </div>

    <header class="home-header">
      <button class="brand-mark" type="button" aria-label="进入故事页" @click="enterStory">
        <span class="brand-dot"></span>
        <span>DRMRKJ</span>
      </button>
      <span class="header-note">Code / Life / Interface</span>
    </header>

    <main class="hero-shell" aria-labelledby="home-title">
      <section class="hero-copy">
        <div class="intro-row">
          <p class="eyebrow">Frontend Developer</p>
          <div class="mobile-profile" aria-hidden="true">
            <img :src="avatarImg" alt="" />
            <span>DRMRKJ</span>
          </div>
        </div>
        <h1 id="home-title">Quiet UI, sharp code, clean stories.</h1>
        <p class="hero-desc">
          I build calm interfaces with precise motion, readable architecture, and a little bit of
          cinematic atmosphere.
        </p>

        <div class="mobile-stack" aria-label="技术关键词">
          <span v-for="item in stack" :key="item">{{ item }}</span>
        </div>

        <div class="action-row">
          <button class="primary-action" type="button" @click="enterStory">
            <span>进入故事</span>
            <span class="action-arrow" aria-hidden="true"></span>
          </button>
          <span class="availability">Available for focused frontend work</span>
        </div>

        <dl class="signal-list" aria-label="主页信息">
          <div v-for="item in signals" :key="item.label" class="signal-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="hero-visual" aria-label="DrmrKJ profile">
        <div class="avatar-stage">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <img class="avatar-image" :src="avatarImg" alt="DrmrKJ avatar" />
        </div>

        <div class="terminal-panel" aria-hidden="true">
          <div class="terminal-top">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>const focus = ['vue', 'motion', 'design'];</p>
          <p>render('minimal but cinematic');</p>
        </div>

        <div class="stack-row" aria-label="技术关键词">
          <span v-for="item in stack" :key="item">{{ item }}</span>
        </div>
      </section>
    </main>

    <footer class="poem-line">廉纤小雨池塘遍。细点看萍面。</footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import avatarImg from '@/assets/images/app/avatar.jpg'

const router = useRouter()

const signals = [
  { label: 'Focus', value: 'Vue / Design Systems' },
  { label: 'Motion', value: 'Measured and useful' },
  { label: 'Writing', value: 'Notes from practice' },
]

const stack = ['Vue', 'TypeScript', 'UnoCSS', 'Vite']

const enterStory = () => {
  sessionStorage.setItem('fromHomePage', 'true')
  void router.push('/story')
}
</script>

<style scoped>
.home-page {
  position: relative;
  height: 100vh;
  height: 100svh;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #eef8f7;
  background:
    linear-gradient(125deg, rgba(10, 12, 14, 0.98), rgba(12, 18, 17, 0.96) 48%, #070808 100%),
    var(--bg-primary);
  isolation: isolate;
}

.home-page::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.035), transparent),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.024) 0,
      rgba(255, 255, 255, 0.024) 1px,
      transparent 1px,
      transparent 7px
    );
  opacity: 0.42;
  mix-blend-mode: screen;
}

.scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.scene-grid {
  position: absolute;
  inset: -28% -10% 0;
  background:
    linear-gradient(rgba(141, 245, 222, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(141, 245, 222, 0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black 0%, black 76%, transparent);
  transform: perspective(760px) rotateX(62deg) translateY(8%);
  transform-origin: 50% 100%;
  opacity: 0.72;
  animation: grid-drift 16s linear infinite;
  transition: none !important;
}

.scene-beam {
  position: absolute;
  top: -8%;
  width: 34vw;
  height: 72vh;
  background: linear-gradient(90deg, transparent, rgba(141, 245, 222, 0.15), transparent);
  opacity: 0.62;
  transform: skewX(-24deg);
  animation: beam-float 9s ease-in-out infinite alternate;
  transition: none !important;
}

.scene-beam-left {
  left: -18vw;
}

.scene-beam-right {
  right: -20vw;
  background: linear-gradient(90deg, transparent, rgba(245, 194, 107, 0.13), transparent);
  transform: skewX(20deg);
  animation-name: beam-float-reverse;
}

.scene-horizon {
  position: absolute;
  right: 0;
  bottom: 22%;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(141, 245, 222, 0.6), transparent);
  box-shadow: 0 0 42px rgba(141, 245, 222, 0.24);
  transform-origin: 50% 50%;
  animation: horizon-breathe 4.8s ease-in-out infinite;
  transition: none !important;
}

.home-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100% - 48px, 1180px);
  margin: 0 auto;
  padding: 28px 0;
  animation: reveal-down 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.brand-mark {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-height: 44px;
  padding: 0;
  color: #effffd;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.brand-mark:focus-visible,
.primary-action:focus-visible {
  outline: 2px solid #8df5de;
  outline-offset: 6px;
}

.brand-dot {
  width: 10px;
  height: 10px;
  background: #8df5de;
  border-radius: 50%;
  box-shadow: 0 0 22px rgba(141, 245, 222, 0.72);
  animation: dot-pulse 2.4s ease-in-out infinite;
}

.header-note {
  color: rgba(238, 248, 247, 0.54);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.75fr);
  gap: clamp(40px, 7vw, 96px);
  align-items: center;
  width: min(100% - 48px, 1180px);
  min-height: calc(100svh - 120px);
  margin: 0 auto;
  padding: 38px 0 84px;
}

.hero-copy {
  max-width: 720px;
}

.intro-row {
  display: block;
}

.mobile-profile,
.mobile-stack {
  display: none;
}

.eyebrow {
  margin: 0 0 18px;
  color: #8df5de;
  font-size: clamp(0.78rem, 1.1vw, 0.92rem);
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: reveal-up 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s both;
}

.hero-copy h1 {
  position: relative;
  max-width: 760px;
  margin: 0;
  color: #f5fffd;
  font-size: clamp(3rem, 7.1vw, 6.7rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: 0;
  animation: reveal-up 0.82s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
}

.hero-desc {
  max-width: 620px;
  margin: 28px 0 0;
  color: rgba(238, 248, 247, 0.68);
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  line-height: 1.72;
  animation: reveal-up 0.74s cubic-bezier(0.2, 0.8, 0.2, 1) 0.34s both;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  margin-top: 38px;
  animation: reveal-up 0.74s cubic-bezier(0.2, 0.8, 0.2, 1) 0.46s both;
}

.primary-action {
  position: relative;
  display: inline-flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  min-width: 154px;
  min-height: 48px;
  padding: 0 22px;
  color: #05110f;
  font-size: 0.96rem;
  font-weight: 850;
  cursor: pointer;
  background: #8df5de;
  border: 1px solid rgba(141, 245, 222, 0.8);
  border-radius: 999px;
  box-shadow: 0 18px 46px rgba(141, 245, 222, 0.18);
  overflow: hidden;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.primary-action::before {
  position: absolute;
  inset: -40% -20%;
  pointer-events: none;
  content: '';
  background: linear-gradient(110deg, transparent 28%, rgba(255, 255, 255, 0.54), transparent 64%);
  transform: translateX(-120%) skewX(-20deg);
  animation: action-shimmer 3.8s ease-in-out 1.5s infinite;
  transition: none !important;
}

.primary-action span {
  position: relative;
  z-index: 1;
}

.primary-action:hover {
  background: #f5c26b;
  border-color: #f5c26b;
  transform: translateY(-2px);
}

.action-arrow {
  width: 18px;
  height: 8px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  transform: skewX(28deg);
}

.availability {
  color: rgba(238, 248, 247, 0.54);
  font-size: 0.94rem;
}

.signal-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  max-width: 720px;
  margin: 58px 0 0;
  animation: reveal-up 0.74s cubic-bezier(0.2, 0.8, 0.2, 1) 0.58s both;
}

.signal-item {
  padding-top: 16px;
  border-top: 1px solid rgba(238, 248, 247, 0.15);
}

.signal-item dt {
  color: rgba(141, 245, 222, 0.86);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.signal-item dd {
  margin: 8px 0 0;
  color: rgba(238, 248, 247, 0.76);
  font-size: 0.95rem;
  line-height: 1.5;
}

.hero-visual {
  position: relative;
  display: grid;
  justify-items: center;
  min-height: 560px;
  animation: reveal-scale 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.36s both;
}

.avatar-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(34vw, 360px);
  min-width: 280px;
  aspect-ratio: 1;
}

.avatar-stage::before {
  position: absolute;
  inset: 11%;
  content: '';
  border: 1px solid rgba(141, 245, 222, 0.3);
  border-radius: 50%;
  animation: ring-breathe 4.2s ease-in-out infinite;
  transition: none !important;
}

.avatar-stage::after {
  position: absolute;
  inset: 28%;
  content: '';
  background: linear-gradient(135deg, rgba(141, 245, 222, 0.18), rgba(245, 194, 107, 0.1));
  border: 1px solid rgba(238, 248, 247, 0.14);
  border-radius: 50%;
  animation: core-float 5s ease-in-out infinite;
  transition: none !important;
}

.avatar-image {
  position: relative;
  z-index: 2;
  width: 112px;
  height: 112px;
  object-fit: cover;
  border: 1px solid rgba(238, 248, 247, 0.28);
  border-radius: 50%;
  box-shadow:
    0 0 0 10px rgba(238, 248, 247, 0.035),
    0 26px 70px rgba(0, 0, 0, 0.36);
}

.orbit {
  position: absolute;
  inset: 0;
  border: 1px solid transparent;
  border-top-color: rgba(141, 245, 222, 0.58);
  border-right-color: rgba(141, 245, 222, 0.16);
  border-radius: 50%;
  animation: orbit-spin 18s linear infinite;
  transition: none !important;
}

.orbit-two {
  inset: 18%;
  border-top-color: rgba(245, 194, 107, 0.62);
  border-left-color: rgba(245, 194, 107, 0.14);
  animation-duration: 12s;
  animation-direction: reverse;
}

.terminal-panel {
  position: absolute;
  right: 0;
  bottom: 80px;
  width: min(100%, 360px);
  padding: 16px 18px 18px;
  color: rgba(238, 248, 247, 0.78);
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.8;
  background: rgba(6, 10, 10, 0.62);
  border: 1px solid rgba(238, 248, 247, 0.12);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  animation: panel-float 5.2s ease-in-out infinite;
  transition: none !important;
}

.terminal-panel::after {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 4px;
  vertical-align: -2px;
  content: '';
  background: #8df5de;
  animation: caret-blink 1.1s steps(2, end) infinite;
}

.terminal-top {
  display: flex;
  gap: 7px;
  margin-bottom: 14px;
}

.terminal-top span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(238, 248, 247, 0.3);
}

.terminal-top span:first-child {
  background: #8df5de;
}

.terminal-top span:last-child {
  background: #f5c26b;
}

.terminal-panel p {
  margin: 0;
}

.stack-row {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stack-row span {
  padding: 8px 11px;
  color: rgba(238, 248, 247, 0.72);
  font-size: 0.78rem;
  font-weight: 800;
  border: 1px solid rgba(238, 248, 247, 0.12);
  border-radius: 999px;
  background: rgba(238, 248, 247, 0.045);
  animation: chip-rise 0.62s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.stack-row span:nth-child(2) {
  animation-delay: 0.08s;
}

.stack-row span:nth-child(3) {
  animation-delay: 0.16s;
}

.stack-row span:nth-child(4) {
  animation-delay: 0.24s;
}

.poem-line {
  position: absolute;
  right: 32px;
  bottom: 24px;
  z-index: 3;
  max-width: calc(100% - 64px);
  color: rgba(238, 248, 247, 0.42);
  font-size: 0.94rem;
  line-height: 1.6;
  text-align: right;
  animation: reveal-up 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.68s both;
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes reveal-down {
  from {
    opacity: 0;
    transform: translate3d(0, -14px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes reveal-scale {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes grid-drift {
  to {
    background-position:
      0 72px,
      72px 0;
  }
}

@keyframes beam-float {
  from {
    opacity: 0.38;
    transform: translate3d(-4%, 0, 0) skewX(-24deg);
  }

  to {
    opacity: 0.74;
    transform: translate3d(8%, 4%, 0) skewX(-24deg);
  }
}

@keyframes beam-float-reverse {
  from {
    opacity: 0.34;
    transform: translate3d(5%, 2%, 0) skewX(20deg);
  }

  to {
    opacity: 0.68;
    transform: translate3d(-8%, -2%, 0) skewX(20deg);
  }
}

@keyframes horizon-breathe {
  0%,
  100% {
    opacity: 0.46;
    transform: scaleX(0.72);
  }

  50% {
    opacity: 0.92;
    transform: scaleX(1);
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.28);
  }
}

@keyframes action-shimmer {
  0%,
  52% {
    transform: translateX(-120%) skewX(-20deg);
  }

  78%,
  100% {
    transform: translateX(120%) skewX(-20deg);
  }
}

@keyframes ring-breathe {
  0%,
  100% {
    opacity: 0.54;
    transform: scale(0.96);
  }

  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes core-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -8px, 0);
  }
}

@keyframes panel-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

@keyframes chip-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes mobile-badge-in {
  from {
    opacity: 0;
    transform: translate3d(18px, 0, 0) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 920px) {
  .home-page {
    height: auto;
    overflow-y: auto;
  }

  .home-header,
  .hero-shell {
    width: min(100% - 36px, 720px);
  }

  .home-header {
    padding: 22px 0 10px;
  }

  .header-note {
    display: none;
  }

  .hero-shell {
    display: block;
    min-height: auto;
    padding: 34px 0 104px;
  }

  .hero-copy {
    position: relative;
    display: block;
    max-width: none;
    padding-top: 6px;
  }

  .hero-visual {
    display: none;
  }

  .intro-row {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .mobile-profile {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 9px;
    align-items: center;
    min-height: 48px;
    padding: 6px 10px 6px 6px;
    color: rgba(238, 248, 247, 0.74);
    font-size: 0.72rem;
    font-weight: 850;
    letter-spacing: 0.12em;
    border: 1px solid rgba(238, 248, 247, 0.14);
    border-radius: 999px;
    background: rgba(238, 248, 247, 0.05);
    animation: mobile-badge-in 0.74s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
    transition: none !important;
  }

  .mobile-profile::before {
    position: absolute;
    inset: -7px;
    pointer-events: none;
    content: '';
    border: 1px solid rgba(141, 245, 222, 0.18);
    border-radius: inherit;
    animation: ring-breathe 3.8s ease-in-out infinite;
    transition: none !important;
  }

  .mobile-profile img {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border: 1px solid rgba(238, 248, 247, 0.28);
    border-radius: 50%;
  }

  .eyebrow {
    margin: 0;
    font-size: 0.74rem;
  }

  .mobile-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 22px;
    animation: reveal-up 0.72s cubic-bezier(0.2, 0.8, 0.2, 1) 0.42s both;
  }

  .mobile-stack span {
    padding: 7px 10px;
    color: rgba(238, 248, 247, 0.72);
    font-size: 0.72rem;
    font-weight: 800;
    border: 1px solid rgba(238, 248, 247, 0.12);
    border-radius: 999px;
    background: rgba(238, 248, 247, 0.045);
  }

  .hero-copy h1,
  .hero-desc,
  .mobile-stack,
  .action-row,
  .signal-list {
    width: 100%;
  }

  .hero-copy h1 {
    max-width: 680px;
    font-size: clamp(2.82rem, 10.8vw, 5rem);
    line-height: 0.98;
  }

  .hero-desc {
    margin-top: 20px;
    font-size: 1rem;
    line-height: 1.68;
  }

  .action-row {
    gap: 12px;
    margin-top: 28px;
  }

  .signal-list {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 30px;
  }
}

@media (max-height: 680px) and (min-width: 921px) {
  .home-header {
    padding: 18px 0;
  }

  .hero-shell {
    min-height: calc(100svh - 82px);
    padding: 12px 0 42px;
  }

  .hero-copy h1 {
    font-size: clamp(2.8rem, 5.8vw, 5rem);
    line-height: 0.94;
  }

  .hero-desc {
    margin-top: 20px;
  }

  .action-row {
    margin-top: 26px;
  }

  .signal-list,
  .poem-line {
    display: none;
  }

  .hero-visual {
    min-height: 390px;
  }

  .avatar-stage {
    width: min(28vw, 300px);
    min-width: 240px;
  }

  .terminal-panel {
    bottom: 30px;
  }
}

@media (max-width: 560px) {
  .home-header {
    width: min(100% - 32px, 720px);
    padding-top: 20px;
  }

  .brand-mark {
    font-size: 0.8rem;
  }

  .brand-dot {
    width: 8px;
    height: 8px;
  }

  .hero-shell {
    width: min(100% - 32px, 720px);
    padding-top: 28px;
  }

  .scene-grid {
    background-size: 48px 48px;
    opacity: 0.42;
  }

  .scene-beam {
    opacity: 0.4;
  }

  .scene-horizon {
    bottom: 34%;
  }

  .intro-row {
    gap: 10px;
    margin-bottom: 22px;
  }

  .mobile-profile {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    min-height: 48px;
    gap: 0;
    padding: 0;
    border-radius: 50%;
  }

  .mobile-profile::before {
    inset: -6px;
    border-radius: 50%;
  }

  .mobile-profile span {
    display: none;
  }

  .mobile-profile img {
    width: 34px;
    height: 34px;
  }

  .hero-copy h1 {
    font-size: clamp(2.52rem, 11.8vw, 3.5rem);
    line-height: 1.04;
  }

  .hero-desc {
    margin-top: 20px;
    color: rgba(238, 248, 247, 0.64);
  }

  .mobile-stack {
    gap: 7px;
    margin-top: 20px;
  }

  .mobile-stack span {
    padding: 6px 9px;
    font-size: 0.68rem;
  }

  .action-row {
    align-items: flex-start;
    margin-top: 24px;
  }

  .primary-action {
    width: 100%;
    min-height: 50px;
  }

  .availability {
    font-size: 0.86rem;
  }

  .signal-list {
    gap: 12px;
    margin-top: 26px;
  }

  .signal-item {
    padding: 13px 0 0;
  }

  .poem-line {
    right: 18px;
    bottom: 18px;
    left: 18px;
    max-width: none;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-header,
  .eyebrow,
  .hero-copy h1,
  .hero-desc,
  .mobile-stack,
  .mobile-profile,
  .mobile-profile::before,
  .action-row,
  .signal-list,
  .hero-visual,
  .avatar-stage::before,
  .avatar-stage::after,
  .scene-grid,
  .scene-beam,
  .scene-horizon,
  .brand-dot,
  .primary-action::before,
  .terminal-panel,
  .terminal-panel::after,
  .stack-row span,
  .poem-line,
  .orbit {
    animation: none;
  }

  .home-header,
  .eyebrow,
  .hero-copy h1,
  .hero-desc,
  .mobile-stack,
  .mobile-profile,
  .action-row,
  .signal-list,
  .hero-visual,
  .stack-row span,
  .poem-line {
    opacity: 1;
    transform: none;
  }

  .primary-action {
    transition: none;
  }
}
</style>
