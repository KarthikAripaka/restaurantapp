import 'dart:js' as js;

// Web-only implementation using JavaScript Web Audio API.
// This executes inside the Chrome/Edge browser context.

void initAudio() {
  try {
    js.context.callMethod('eval', ["""
      (function() {
        if (window.myAudioContext) return;
        
        function initContext() {
          try {
            if (!window.myAudioContext) {
              window.myAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = window.myAudioContext;
            if (ctx.state === 'suspended') {
              ctx.resume().then(() => {
                console.log('AudioContext resumed successfully via user gesture.');
              }).catch(e => {
                console.warn('Failed to resume AudioContext on gesture:', e);
              });
            }
          } catch (e) {
            console.error('Error initializing AudioContext on user gesture:', e);
          }
        }
        
        // Listen to common interaction events to unlock AudioContext
        document.addEventListener('click', initContext, { once: false });
        document.addEventListener('keydown', initContext, { once: false });
        document.addEventListener('touchstart', initContext, { once: false });
        document.addEventListener('mousedown', initContext, { once: false });
      })()
    """]);
  } catch (e) {
    // Fail silently in unsupported web environments
  }
}

void playBuzzer() {
  try {
    js.context.callMethod('eval', ["""
      (function() {
        try {
          let ctx = window.myAudioContext;
          if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            window.myAudioContext = ctx;
          }
          
          function beep(freq1, freq2, duration, delay) {
            setTimeout(() => {
              try {
                if (ctx.state === 'suspended') {
                  ctx.resume();
                }
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
                
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
                
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                
                osc1.start(ctx.currentTime);
                osc2.start(ctx.currentTime);
                osc1.stop(ctx.currentTime + duration);
                osc2.stop(ctx.currentTime + duration);
              } catch (err) {
                console.error('Error during beep playback:', err);
              }
            }, delay);
          }
          
          // Loud dual-tone delivery buzzer: 3 distinct pulse beeps
          beep(220, 440, 0.25, 0);
          beep(220, 440, 0.25, 350);
          beep(220, 440, 0.40, 700);
        } catch (e) {
          console.error('Audio playback failed:', e);
        }
      })()
    """]);
  } catch (e) {
    // Fail silently in unsupported web environments
  }
}

void playCancel() {
  try {
    js.context.callMethod('eval', ["""
      (function() {
        try {
          let ctx = window.myAudioContext;
          if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            window.myAudioContext = ctx;
          }
          
          function beep(freq, duration, delay) {
            setTimeout(() => {
              try {
                if (ctx.state === 'suspended') {
                  ctx.resume();
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration);
              } catch (err) {
                console.error('Error during cancel beep playback:', err);
              }
            }, delay);
          }
          
          // Three warning alert beeps (alarm pattern)
          beep(520, 0.20, 0);
          beep(420, 0.20, 250);
          beep(320, 0.30, 500);
        } catch (e) {
          console.error('Audio playback failed:', e);
        }
      })()
    """]);
  } catch (e) {
    // Fail silently in unsupported web environments
  }
}
