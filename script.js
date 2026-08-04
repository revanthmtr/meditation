/* ==========================================================================
   KUMBHAKA DHYANA ASRAMAM — INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation Header
  const siteNav = document.getElementById('siteNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteNav.classList.add('scrolled');
    } else {
      siteNav.classList.remove('scrolled');
    }
  });

  // 2. Scroll Reveal Observer
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // 3. Hero Background Video Handling & Reduced Motion Support
  const heroVideo = document.getElementById('heroVideo');
  const heroPoster = document.getElementById('heroPoster');

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function handleMotionPreference() {
    if (prefersReducedMotion.matches && heroVideo) {
      heroVideo.pause();
      heroVideo.style.display = 'none';
      if (heroPoster) heroPoster.style.display = 'block';
    } else if (heroVideo) {
      heroVideo.play().catch(err => console.log('Autoplay prevented:', err));
    }
  }

  handleMotionPreference();
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  }

  // 4. Hero Bottom-Right Unobtrusive Soundscape Toggle
  let audioCtx = null;
  let isSoundOn = false;
  let droneOsc1, droneOsc2, masterGain;

  const soundBtn = document.getElementById('heroSoundBtn');
  const soundDot = document.getElementById('soundDot');
  const soundLabel = document.getElementById('soundLabel');

  function initAudioEngine() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }

  function startTempleAmbience() {
    initAudioEngine();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // 108Hz Root Drone + 432Hz Om Harmonics
    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sine';
    droneOsc1.frequency.setValueAtTime(108, audioCtx.currentTime);

    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(432, audioCtx.currentTime);

    const osc2Gain = audioCtx.createGain();
    osc2Gain.gain.setValueAtTime(0.02, audioCtx.currentTime);

    droneOsc1.connect(masterGain);
    droneOsc2.connect(osc2Gain);
    osc2Gain.connect(masterGain);

    droneOsc1.start();
    droneOsc2.start();

    scheduleTempleChime();
  }

  function scheduleTempleChime() {
    if (!isSoundOn || !audioCtx) return;

    const bellOsc = audioCtx.createOscillator();
    const bellGain = audioCtx.createGain();

    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(864, audioCtx.currentTime);

    bellGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.8);

    bellOsc.connect(bellGain);
    bellGain.connect(masterGain);

    bellOsc.start();
    bellOsc.stop(audioCtx.currentTime + 3.8);

    setTimeout(() => {
      if (isSoundOn) scheduleTempleChime();
    }, 9000);
  }

  function stopTempleAmbience() {
    if (droneOsc1) { droneOsc1.stop(); droneOsc1 = null; }
    if (droneOsc2) { droneOsc2.stop(); droneOsc2 = null; }
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      if (isSoundOn) {
        startTempleAmbience();
        if (soundDot) soundDot.classList.add('active');
        if (soundLabel) soundLabel.textContent = 'SOUND: ON (432Hz)';
      } else {
        stopTempleAmbience();
        if (soundDot) soundDot.classList.remove('active');
        if (soundLabel) soundLabel.textContent = 'SOUND: OFF';
      }
    });
  }
});
