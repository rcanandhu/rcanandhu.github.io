document.addEventListener('DOMContentLoaded', () => {
    const DURATION = 20000;
    const OUTER_RADIUS = 200;
    const INNER_RADIUS = 130;
    const rotators = document.querySelectorAll('.orbit-rotator');

    rotators.forEach(rotator => {
        const isCW = rotator.dataset.orbit === 'cw';
        const pills = Array.from(rotator.querySelectorAll('.pill'));
        let start = null;

        // Set icon sizes
        pills.forEach(pill => {
            const wrapper = pill.querySelector('.icon-wrapper');
            if (!wrapper) return;
            const sizeKey = wrapper.dataset.size;
            const sizeMap = { '52':52, '46':46, '32':32, '48':48, '31':36, '44':44, '38':38 };
            const size = sizeMap[sizeKey] || 40;
            wrapper.style.setProperty('--icon-size', size);
        });

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = (timestamp - start) % DURATION;
            const progress = elapsed / DURATION;
            const orbitAngle = isCW ? progress * 360 : -progress * 360;

            pills.forEach(pill => {
                const baseAngle = Number(pill.dataset.angle);
                const currentAngle = (baseAngle + orbitAngle) % 360;
                const radius = pill.closest('.orbit-ccw') ? OUTER_RADIUS : INNER_RADIUS;

                const rad = (currentAngle * Math.PI) / 180;
                const baseX = radius * Math.cos(rad);
                const baseY = radius * Math.sin(rad);

                // Small outward move on hover
                const liftAmount = pill.matches(':hover') ? 10 : 0;
                const unitX = Math.cos(rad);
                const unitY = Math.sin(rad);
                const x = baseX + liftAmount * unitX;
                const y = baseY + liftAmount * unitY;

                // Move pills around the orbit ring (no rotation for pill container)
                pill.style.transform = `
                    translate(-50%, -50%) 
                    translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)
                `;

                // Always keep icons upright
                const icon = pill.querySelector('.icon-wrapper');
                if (icon) {
                    icon.style.transform = `rotate(0deg)`;
                }
            });

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    });
});

// Config: define sections for major ticks (add IDs to your sections!)
const sectionIds = ['hero', 'works', 'about', 'contact']; // example

function renderScrollbarTicks() {
  const track = document.querySelector('.scrollbar-ticks');
  if (!track) return;
  track.innerHTML = '';
  const totalTicks = 18; // Adjust for minor marks between sections
  let tickIndex = 0;
  for (let i = 0; i < totalTicks; i++) {
    const tick = document.createElement('div');
    // Place major tick at each section, minor for rest
    if (sectionIds.includes(getSectionAt(i, totalTicks))) {
      tick.className = 'tick section';
    } else {
      tick.className = 'tick content';
    }
    track.appendChild(tick);
    tickIndex++;
  }
}

// Optional: custom logic for tick positioning if you want accurate mapping
function getSectionAt(i, totalTicks) {
  // For now, simple even spread:
  const step = Math.floor(totalTicks / sectionIds.length);
  return sectionIds[Math.floor(i / step)] || '';
}

// Show/hide logic
let scrollbarTimeout;
window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPos = window.scrollY;
  const track = document.querySelector('.scrollbar-track');
  const thumb = document.querySelector('.scrollbar-thumb');
  const bar = document.querySelector('.custom-scrollbar-float');
  if (!track || !thumb || !bar) return;
  const barHeight = track.offsetHeight;
  // keep thumb within bar range
  const top = ((scrollPos / docHeight) * (barHeight - thumb.offsetHeight));
  thumb.style.top = top + 'px';
  bar.classList.add('active');
  clearTimeout(scrollbarTimeout);
  scrollbarTimeout = setTimeout(() => {
    bar.classList.remove('active');
  }, 1000); // hide after 1 second idle
});

document.addEventListener('DOMContentLoaded', renderScrollbarTicks);

