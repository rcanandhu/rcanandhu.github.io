// Orbit System Animation (unchanged)
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
            const sizeMap = { '52': 52, '46': 46, '32': 32, '48': 48, '31': 36, '44': 44, '38': 38 };
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

// === Custom SCROLLBAR ===

// Section Names & IDs
const sectionNames = {
    hero: "Hero",
    works: "Works",
    about: "About",
    contact: "Contact"
};
const sectionIds = ['hero', 'works']; // Add more IDs if needed

function getSectionOffsets() {
    // Build the array of vertical scroll offsets for each section
    return sectionIds.map(id => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
    });
}

function buildTickList(innerTicksPerSection = 3) {
    // Returns an array of {type, section, groupIndex} for ticks
    let ticks = [];
    for (let s = 0; s < sectionIds.length; s++) {
        // Section tick
        ticks.push({ type: "section", section: sectionIds[s], groupIndex: s });
        // Inner ticks
        if (s < sectionIds.length - 1) {
            for (let i = 0; i < innerTicksPerSection; i++)
                ticks.push({ type: "content", section: sectionIds[s], groupIndex: s });
        }
    }
    return ticks;
}

function renderScrollbarTicks() {
    const ticksContainer = document.querySelector('.scrollbar-ticks');
    if (!ticksContainer) return;

    const innerTicksPerSection = 3; // or any count
    const ticks = buildTickList(innerTicksPerSection);

    ticksContainer.innerHTML = '';

    let tickGroupDiv = null;
    let lastGroupIndex = -1;

    // Render ticks, wrap group in .tick-group for each section
    ticks.forEach((tick, idx) => {
        if (tick.groupIndex !== lastGroupIndex) {
            // New group
            tickGroupDiv = document.createElement('div');
            tickGroupDiv.className = 'tick-group clickable';
            tickGroupDiv.dataset.section = tick.section;
            tickGroupDiv.dataset.tooltip = sectionNames[tick.section] || tick.section;
            tickGroupDiv.tabIndex = 0;
            ticksContainer.appendChild(tickGroupDiv);
            lastGroupIndex = tick.groupIndex;
        }
        const el = document.createElement('div');
        el.className = (tick.type === "section") ? 'tick section' : 'tick content';
        tickGroupDiv.appendChild(el);
    });
}

function getScrollTickIndex(ticks, sectionOffsets) {
    // Which tick group should the thumb be on?
    const scrollY = window.scrollY;
    for (let i = 0; i < sectionOffsets.length - 1; i++) {
        if (scrollY < sectionOffsets[i + 1]) {
            // Find tick index by group
            const gTicks = buildTickList().filter(t => t.groupIndex === i);
            const groupStart = buildTickList().findIndex(t => t.groupIndex === i);
            // Map scroll position within this section to inner ticks
            const sectionStart = sectionOffsets[i], sectionEnd = sectionOffsets[i + 1];
            const pct = Math.min(1, Math.max(0, (scrollY - sectionStart) / (sectionEnd - sectionStart || 1)));
            const tickIdxInGroup = Math.round(pct * (gTicks.length - 1));
            return groupStart + tickIdxInGroup;
        }
    }
    // Last section
    return buildTickList().length - 1;
}

function setupTickTooltips() {
    let tooltip;
    document.body.addEventListener('mouseover', function (e) {
        const group = e.target.closest('.tick-group');
        if (group && group.dataset.tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tick-tooltip';
            tooltip.textContent = group.dataset.tooltip;
            document.body.appendChild(tooltip);
            const rect = group.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + "px";
            tooltip.style.top = (rect.top - 32) + "px";
            tooltip.style.transform = "translateX(-50%)";
        }
    });
    document.body.addEventListener('mouseout', function (e) {
        if (tooltip) { tooltip.remove(); tooltip = null; }
    });
}

window.addEventListener('scroll', () => {
    const ticks = buildTickList();
    const sectionOffsets = getSectionOffsets().concat(document.body.scrollHeight);
    const track = document.querySelector('.scrollbar-track');
    const thumb = document.querySelector('.scrollbar-thumb');
    const bar = document.querySelector('.custom-scrollbar-float');
    const ticksContainer = document.querySelector('.scrollbar-ticks');
    if (!track || !thumb || !bar || !ticksContainer) return;
    const barHeight = ticksContainer.offsetHeight;
    const totalTicks = ticks.length;

    const tickIndex = getScrollTickIndex(ticks, sectionOffsets);

    const top = (tickIndex / (totalTicks - 1)) * (barHeight - thumb.offsetHeight);
    thumb.style.top = top + 'px';
    bar.classList.add('active');
    clearTimeout(window.scrollbarTimeout);
    if (!bar.matches(':hover')) {
        window.scrollbarTimeout = setTimeout(() => {
            bar.classList.remove('active');
        }, 1000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderScrollbarTicks();
    setupTickTooltips();
});
window.addEventListener('resize', renderScrollbarTicks);

document.addEventListener('click', function (e) {
    const group = e.target.closest('.tick-group.clickable');
    if (group) {
        const id = group.dataset.section;
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('mouseenter', (e) => {
        // Remove existing tooltip if present
        const prev = pill.querySelector('.orbit-tooltip');
        if (prev) prev.remove();

        const text = pill.getAttribute('data-tooltip') || '';
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'orbit-tooltip';
        tooltip.textContent = text;
        pill.appendChild(tooltip);
    });

    pill.addEventListener('mouseleave', () => {
        const tooltip = pill.querySelector('.orbit-tooltip');
        if (tooltip) tooltip.remove();
    });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.skills-pills-scroll').forEach(scroll => {
    const row = scroll.querySelector('.pills-row');
    function setMarquee() {
      const width = row.offsetWidth;
      scroll.style.width = width * 2 + 'px';
      scroll.style.minWidth = width * 2 + 'px';

      // Animate with explicit pixel distance for perfect repeat
      scroll.animate([
        { transform: 'translateX(0)' },
        { transform: `translateX(-${width}px)` }
      ], {
        duration: 18000,
        iterations: Infinity,
        easing: 'linear'
      });
    }
    setMarquee();
    window.addEventListener('resize', setMarquee);
  });
});
