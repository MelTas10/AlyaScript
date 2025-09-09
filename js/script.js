// Intersection-based reveal animations
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-up, .reveal-fade').forEach(el => observer.observe(el));

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Video autoplay policy handling with user gesture for sound
const video = document.getElementById('bgVideo');
const soundToggle = document.getElementById('soundToggle');
const SOUND_KEY = 'bg-sound-on';
let preferredSoundOn = localStorage.getItem(SOUND_KEY) === 'true';
let hasUserUnmuted = false; // only allow sound after an explicit gesture

// Try to autoplay muted, then allow user to enable sound
async function tryPlayMuted() {
  try {
    video.muted = true;
    await video.play();
  } catch (e) {
    // Fallback: wait for user interaction anywhere
    document.addEventListener('click', oncePlayMuted, { once: true });
  }
}

function oncePlayMuted() {
  video.muted = true;
  video.play().catch(() => {});
}

tryPlayMuted();

function updateSoundUi() {
  if (!soundToggle) return;
  if (preferredSoundOn) {
    soundToggle.setAttribute('aria-pressed', 'true');
    soundToggle.textContent = '🔈 Звук: Включён';
  } else {
    soundToggle.setAttribute('aria-pressed', 'false');
    soundToggle.textContent = '🔊 Звук: Включить';
  }
}
updateSoundUi();

// Enable sound on explicit user click (required by browsers)
soundToggle.addEventListener('click', async () => {
  preferredSoundOn = !preferredSoundOn;
  localStorage.setItem(SOUND_KEY, String(preferredSoundOn));
  hasUserUnmuted = preferredSoundOn; // enable/disable sound only after user action
  updateSoundUi();
  try {
    video.muted = !hasUserUnmuted;
    await video.play();
  } catch (e) {}
});

// Keep sound state across loops and recover after end
video.addEventListener('ended', () => {
  // Should not fire with loop, but safety
  video.currentTime = 0;
  video.play().catch(() => {});
  video.muted = !hasUserUnmuted;
});
video.addEventListener('playing', () => {
  video.muted = !hasUserUnmuted;
});
video.addEventListener('timeupdate', () => {
  if (video.duration && (video.duration - video.currentTime) < 0.25) {
    video.muted = !hasUserUnmuted;
  }
});

// Optional: pause video when tab hidden to save battery; resume with state
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play().then(() => {
      video.muted = !hasUserUnmuted;
    }).catch(() => {});
  }
});

// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Removed sound hint overlay per request

// Accordions
function setupAccordions(){
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;

    const setHeight = (open) => {
      if (open) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0px';
      }
    };

    setHeight(item.classList.contains('open'));

    header.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      // Close other items in the same accordion
      const group = item.closest('.accordion');
      if (group) {
        group.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item){
            openItem.classList.remove('open');
            const c = openItem.querySelector('.accordion-content');
            if (c) c.style.maxHeight = '0px';
          }
        });
      }
      item.classList.toggle('open', willOpen);
      setHeight(willOpen);
    });
  });
}

document.addEventListener('DOMContentLoaded', setupAccordions);

