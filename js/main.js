/* =====================================================
   GLOBAL INIT
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomScrollbar();
  initSkillsMarquee();
  initMobileMenu();
  initActiveNav();
});


/* =====================================================
   ORBIT SYSTEM
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const DURATION_INNER = 14000;
  const DURATION_OUTER = 20000;

  const rotators = document.querySelectorAll('.orbit-rotator');

  rotators.forEach(rotator => {

    const isCW = rotator.dataset.orbit === 'cw';
    const isOuter = rotator.classList.contains('orbit-ccw');
    const DURATION = isOuter ? DURATION_OUTER : DURATION_INNER;

    const pills = Array.from(rotator.querySelectorAll('.pill'));
    let start = null;

    const orbitSystem = rotator.closest('.orbit-system');

    // ✅ Cache sizes ONCE
    let orbitSize = orbitSystem.offsetWidth;
    let innerSize = orbitSize * 0.65;

    // ✅ Update only on resize
    const updateSizes = () => {
      orbitSize = orbitSystem.offsetWidth;
      innerSize = orbitSize * 0.65;
    };

    window.addEventListener('resize', updateSizes);

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

      const radius = isOuter
        ? orbitSize / 2
        : innerSize / 2;

      pills.forEach(pill => {

        const baseAngle = Number(pill.dataset.angle);
        const currentAngle = (baseAngle + orbitAngle) % 360;
        const rad = currentAngle * Math.PI / 180;

        const baseX = radius * Math.cos(rad);
        const baseY = radius * Math.sin(rad);

        const isHovered = pill.matches(':hover');
        const liftAmount = isHovered ? 12 : 0;

        const unitX = Math.cos(rad);
        const unitY = Math.sin(rad);

        const x = baseX + liftAmount * unitX;
        const y = baseY + liftAmount * unitY;

        pill.style.transform =
          `translate3d(-50%, -50%, 0) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  });

});



/* =====================================================
   CUSTOM SCROLLBAR
===================================================== */

function initCustomScrollbar() {

  const sectionNames = {
    hero: "Hero",
    works: "Works",
    about: "About",
    contact: "Contact"
  };

  const sectionIds = ['hero', 'works', 'about', 'contact'];

  const ticksContainer = document.querySelector('.scrollbar-ticks');
  const track = document.querySelector('.scrollbar-track');
  const thumb = document.querySelector('.scrollbar-thumb');
  const bar = document.querySelector('.custom-scrollbar-float');

  if (!ticksContainer || !track || !thumb || !bar) return;

  let ticks = [];

  function getSectionOffsets() {
    return sectionIds.map(id => {
      const el = document.getElementById(id);
      return el ? el.offsetTop : 0;
    });
  }

  function buildTickList(innerTicks = 3) {
    const result = [];
    sectionIds.forEach((id, i) => {
      result.push({ type: 'section', section: id, groupIndex: i });
      if (i < sectionIds.length - 1) {
        for (let j = 0; j < innerTicks; j++)
          result.push({ type: 'content', section: id, groupIndex: i });
      }
    });
    return result;
  }

  function renderTicks() {
    ticks = buildTickList();
    ticksContainer.innerHTML = '';

    let lastGroup = -1;
    let groupDiv = null;

    ticks.forEach(tick => {
      if (tick.groupIndex !== lastGroup) {
        groupDiv = document.createElement('div');
        groupDiv.className = 'tick-group clickable';
        groupDiv.dataset.section = tick.section;
        groupDiv.dataset.tooltip = sectionNames[tick.section] || tick.section;
        ticksContainer.appendChild(groupDiv);
        lastGroup = tick.groupIndex;
      }

      const el = document.createElement('div');
      el.className = tick.type === 'section' ? 'tick section' : 'tick content';
      groupDiv.appendChild(el);
    });
  }

  function updateThumb() {
    const sectionOffsets = getSectionOffsets().concat(document.body.scrollHeight);
    const scrollY = window.scrollY;

    let groupIndex = 0;

    for (let i = 0; i < sectionOffsets.length - 1; i++) {
      if (scrollY < sectionOffsets[i + 1]) {
        groupIndex = i;
        break;
      }
    }

    const groupTicks = ticks.filter(t => t.groupIndex === groupIndex);
    const groupStartIndex = ticks.findIndex(t => t.groupIndex === groupIndex);

    const sectionStart = sectionOffsets[groupIndex];
    const sectionEnd = sectionOffsets[groupIndex + 1];

    const pct = Math.min(1, Math.max(0,
      (scrollY - sectionStart) / (sectionEnd - sectionStart || 1)
    ));

    const tickOffset = Math.round(pct * (groupTicks.length - 1));
    const tickIndex = groupStartIndex + tickOffset;

    const barHeight = ticksContainer.offsetHeight;
    const top = (tickIndex / (ticks.length - 1)) *
      (barHeight - thumb.offsetHeight);

    thumb.style.top = top + 'px';
  }

  function setupTooltip() {
    let tooltip;

    document.body.addEventListener('mouseover', e => {
      const group = e.target.closest('.tick-group');
      if (!group) return;

      tooltip = document.createElement('div');
      tooltip.className = 'tick-tooltip';
      tooltip.textContent = group.dataset.tooltip;
      document.body.appendChild(tooltip);

      const rect = group.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = rect.top - 32 + 'px';
      tooltip.style.transform = 'translateX(-50%)';
    });

    document.body.addEventListener('mouseout', () => {
      if (tooltip) tooltip.remove();
    });
  }

  renderTicks();
  setupTooltip();
  updateThumb();

  window.addEventListener('scroll', updateThumb);
  window.addEventListener('resize', () => {
    renderTicks();
    updateThumb();
  });

  document.addEventListener('click', e => {
    const group = e.target.closest('.tick-group.clickable');
    if (!group) return;

    const section = document.getElementById(group.dataset.section);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
}


/* =====================================================
   SKILLS MARQUEE
===================================================== */

function initSkillsMarquee() {
  document.querySelectorAll('.skills-pills-scroll').forEach(scroll => {

    const row = scroll.querySelector('.pills-row');
    if (!row) return;

    function startMarquee() {
      scroll.getAnimations().forEach(a => a.cancel());

      const width = row.offsetWidth;

      scroll.style.width = width * 2 + 'px';
      scroll.style.minWidth = width * 2 + 'px';

      scroll.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(-${width}px)` }
        ],
        {
          duration: 18000,
          iterations: Infinity,
          easing: 'linear'
        }
      );
    }

    startMarquee();
    window.addEventListener('resize', startMarquee);

  });
}

/* =====================================================
   MOBILE MENU
===================================================== */

function initMobileMenu() {

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const navbar = document.querySelector('.navbar');

  if (!toggle || !menu || !navbar) return;

  function openMenu() {
    toggle.classList.add('active');
    navbar.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    toggle.classList.remove('active');
    navbar.classList.remove('menu-open'); // 🔥 THIS WAS MISSING
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Toggle button
  toggle.addEventListener('click', () => {
    const isOpen = navbar.classList.contains('menu-open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Mobile link click scroll
  menu.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      closeMenu(); // close properly (removes menu-open too)

      setTimeout(() => {
        const headerHeight = navbar.offsetHeight;

        const targetPosition =
          targetSection.getBoundingClientRect().top +
          window.scrollY -
          headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }, 100);
    });
  });

}


/* =====================================================
   AUTO-HIGHLIGHT NAV
===================================================== */

function initActiveNav() {

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-item, .mobile-link");

  function setActiveLink() {
    let currentSection = "";

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Section is considered active when its middle is in viewport
      if (sectionTop <= window.innerHeight / 2 &&
        sectionTop + sectionHeight >= window.innerHeight / 2) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", setActiveLink);
  window.addEventListener("load", setActiveLink);
}

