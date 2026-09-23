import { products, heroSlides, commitments, categories } from './data/products.js';

// Application State
const state = {
  currentSlide: 0,
  slideInterval: null,
  slideDuration: 6000,
  slideStartTime: null,
  activeFilter: 'all',
  activeCommitment: 0,
  selectedProduct: null
};

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initThemeSelector();
  initHeroSlider();
  initProductsGrid();
  initMegaMenu();
  initCommitments();
  initNfcSimulator();
  initCategoryStrip();
  initProductModal();
});

/* ==========================================================================
   1. INTRO LOADER ANIMATION (FAST & LUXURY)
   ========================================================================== */
function initLoader() {
  const loader = document.getElementById('loader');
  const counterEl = document.getElementById('loader-counter');
  const progressEl = document.getElementById('loader-progress-bar');
  
  if (!loader) return;

  const target = 100;
  const duration = 1200; // ms (ideal luxury timing, perfectly reveals furniture visual)
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth natural curve
    const easeOutProgress = 1 - Math.pow(1 - progress, 1.8);
    const count = Math.min(Math.floor(easeOutProgress * target), target);

    if (counterEl) {
      counterEl.textContent = `${count < 10 ? '0' + count : count}%`;
    }
    if (progressEl) {
      progressEl.style.width = `${count}%`;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (counterEl) counterEl.textContent = '100%';
      if (progressEl) progressEl.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('loaded');
        startHeroAutoplay();
      }, 150);
    }
  }

  requestAnimationFrame(step);
}

/* ==========================================================================
   2. THEME INITIALIZATION
   ========================================================================== */
function initThemeSelector() {
  const savedTheme = localStorage.getItem('deneme_theme') || 'cognac';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

/* ==========================================================================
   3. ARCHITECTURAL HERO SLIDER
   ========================================================================== */
function initHeroSlider() {
  const imagesContainer = document.getElementById('hero-images-container');
  const thumbsContainer = document.querySelector('#hero div[style*="grid-template-columns: repeat(4, 1fr)"]');

  if (!imagesContainer || !thumbsContainer) return;

  // Render Background Images Stack
  imagesContainer.innerHTML = heroSlides.map((slide, idx) => `
    <div class="hero-bg-slide" data-index="${idx}" style="position: absolute; inset: 0; opacity: ${idx === 0 ? '1' : '0'}; transform: scale(${idx === 0 ? '1' : '1.08'}); transition: opacity 0.9s var(--ease-smooth), transform 1.2s var(--ease-smooth); overflow: hidden;">
      <img src="${slide.image}" alt="${slide.title}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
    </div>
  `).join('');

  // Render 4 Bottom Thumbnails with Progress Bars
  thumbsContainer.innerHTML = heroSlides.map((slide, idx) => `
    <div class="hero-thumb-item" data-index="${idx}" style="padding: 1.2rem 1.5rem; border-right: ${idx < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none'}; cursor: pointer; position: relative; transition: background-color 0.3s; color: #fff;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.2); overflow: hidden;">
        <div class="hero-thumb-progress" style="width: 0%; height: 100%; background: var(--accent-color);"></div>
      </div>
      <div class="label-caps" style="color: rgba(255,255,255,0.6); font-size: 0.6rem;">0${idx + 1} • ${slide.category}</div>
      <div class="font-display" style="font-size: 1.05rem; font-weight: 700; margin-top: 0.2rem; text-transform: uppercase;">${slide.title}</div>
    </div>
  `).join('');

  // Attach Click Events to Thumbnails
  thumbsContainer.querySelectorAll('.hero-thumb-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'));
      goToSlide(idx);
    });
  });

  // Discover button click in hero
  const btnDiscover = document.getElementById('btn-hero-discover');
  if (btnDiscover) {
    btnDiscover.addEventListener('click', () => {
      const slide = heroSlides[state.currentSlide];
      const prod = products.find(p => p.id === slide.id) || products[0];
      openProductModal(prod);
    });
  }

  updateSlideContent(0);
}

function goToSlide(idx) {
  state.currentSlide = idx;
  updateSlideContent(idx);
  resetHeroTimer();
}

function updateSlideContent(idx) {
  const slide = heroSlides[idx];
  if (!slide) return;

  // Update Background Image Stack
  const bgSlides = document.querySelectorAll('.hero-bg-slide');
  bgSlides.forEach((el, i) => {
    if (i === idx) {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'scale(1.06)';
    }
  });

  // Update Texts
  const catEl = document.getElementById('hero-category');
  const subEl = document.getElementById('hero-subtitle');
  const titleEl = document.getElementById('hero-title');
  const priceEl = document.getElementById('hero-price');

  if (catEl) catEl.textContent = slide.category.toUpperCase();
  if (subEl) subEl.textContent = slide.subtitle;
  if (titleEl) titleEl.textContent = slide.title;
  if (priceEl) priceEl.textContent = slide.price;

  // Update Thumbnails Active Style
  document.querySelectorAll('.hero-thumb-item').forEach((item, i) => {
    if (i === idx) {
      item.style.background = 'rgba(255,255,255,0.1)';
    } else {
      item.style.background = 'transparent';
    }
  });
}

function startHeroAutoplay() {
  state.slideStartTime = performance.now();
  requestAnimationFrame(tickHeroProgress);
}

function resetHeroTimer() {
  state.slideStartTime = performance.now();
}

function tickHeroProgress(now) {
  if (!state.slideStartTime) state.slideStartTime = now;
  const elapsed = now - state.slideStartTime;
  const progress = Math.min((elapsed / state.slideDuration) * 100, 100);

  // Update active progress bar
  document.querySelectorAll('.hero-thumb-item').forEach((item, idx) => {
    const bar = item.querySelector('.hero-thumb-progress');
    if (bar) {
      if (idx === state.currentSlide) {
        bar.style.width = `${progress}%`;
      } else {
        bar.style.width = '0%';
      }
    }
  });

  if (elapsed >= state.slideDuration) {
    state.currentSlide = (state.currentSlide + 1) % heroSlides.length;
    updateSlideContent(state.currentSlide);
    state.slideStartTime = now;
  }

  requestAnimationFrame(tickHeroProgress);
}

/* ==========================================================================
   4. PRODUCTS GRID & HOVER INTERACTIONS
   ========================================================================== */
function initProductsGrid() {
  renderProducts();

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.getAttribute('data-filter');
      renderProducts();
    });
  });
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const filtered = state.activeFilter === 'all'
    ? products
    : products.filter(p => p.category === state.activeFilter);

  container.innerHTML = filtered.map(prod => `
    <div class="card-product" data-id="${prod.id}" style="cursor: pointer; min-height: 480px; display: flex; flex-direction: column;">
      
      <!-- Signature Sliding Top Bar (Header) -->
      <div class="card-hover-header">
        <div>
          <span class="label-caps" style="color: var(--accent-color); font-size: 0.62rem;">${prod.categoryTr}</span>
          <div class="font-display" style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary); text-transform: uppercase;">${prod.name}</div>
        </div>
        <div class="font-display" style="font-weight: 700; font-size: 1.15rem; color: var(--text-primary);">${prod.price}</div>
      </div>

      <!-- Main Image Container -->
      <div style="position: relative; flex: 1; overflow: hidden; background: #e9e5df; min-height: 340px;">
        <img class="card-product-img" src="${prod.images[0]}" alt="${prod.name}" loading="lazy" />
        
        <!-- Provenance Badge (Always visible) -->
        <div style="position: absolute; top: 1rem; right: 1rem; z-index: 5;">
          <span class="label-caps" style="background: var(--bg-card); border: 1px solid var(--border-solid); padding: 0.35rem 0.65rem; color: var(--text-primary); font-size: 0.62rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            ${prod.woodAge} ANADOLU MEŞESİ
          </span>
        </div>
      </div>

      <!-- Default Base Card Footer (Visible before hover) -->
      <div style="padding: 1.2rem 1.4rem; background: var(--bg-card); display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--border-color);">
        <div>
          <span class="label-caps" style="color: var(--text-muted); font-size: 0.62rem;">${prod.category}</span>
          <div class="font-display" style="font-weight: 800; font-size: 1.35rem; color: var(--text-primary); text-transform: uppercase; margin-top: 0.2rem;">
            ${prod.name}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.3rem;">
            ${prod.origin.split(',')[0]}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="font-display" style="font-weight: 800; font-size: 1.25rem; color: var(--text-primary);">${prod.price}</div>
          <span class="label-caps" style="color: var(--accent-color); font-size: 0.6rem;">${prod.status}</span>
        </div>
      </div>

      <!-- Signature Sliding Bottom CTA (Slides up on hover) -->
      <div class="card-hover-footer">
        <span class="label-caps" style="font-size: 0.72rem; letter-spacing: 0.12em;">MODELİ VE DETAYLARI İNCELE</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

    </div>
  `).join('');

  // Attach click to open quick-view modal
  container.querySelectorAll('.card-product').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const prod = products.find(p => p.id === id);
      if (prod) openProductModal(prod);
    });
  });
}

/* ==========================================================================
   5. MEGA MENU WITH DYNAMIC PHOTO PREVIEW
   ========================================================================== */
function initMegaMenu() {
  const btn = document.getElementById('btn-products-menu');
  const menu = document.getElementById('mega-menu');
  const arrow = document.getElementById('menu-arrow-icon');
  const previewImg = document.getElementById('mega-preview-img');
  const previewCaption = document.getElementById('mega-preview-caption');

  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      menu.classList.remove('open');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
      menu.classList.add('open');
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  });

  // Dynamic Hover on Category Links
  document.querySelectorAll('.mega-cat-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const img = link.getAttribute('data-img');
      const text = link.childNodes[0].textContent.trim();
      if (previewImg && img) {
        previewImg.style.opacity = '0.3';
        setTimeout(() => {
          previewImg.src = img;
          previewImg.style.opacity = '1';
        }, 120);
      }
      if (previewCaption) previewCaption.textContent = text;
      link.style.paddingLeft = '0.75rem';
      link.style.color = 'var(--accent-color)';
    });

    link.addEventListener('mouseleave', () => {
      link.style.paddingLeft = '0';
      link.style.color = 'var(--text-primary)';
    });

    link.addEventListener('click', () => {
      menu.classList.remove('open');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    });
  });
}

/* ==========================================================================
   6. COMMITMENTS / PILLARS ACCORDION
   ========================================================================== */
function initCommitments() {
  const tabs = document.querySelectorAll('.pillar-tab');
  const titleEl = document.getElementById('pillar-title');
  const descEl = document.getElementById('pillar-desc');
  const statEl = document.getElementById('pillar-stat');
  const labelEl = document.getElementById('pillar-label');
  const imgEl = document.getElementById('pillar-img');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-index'));
      setCommitment(idx);
    });
    tab.addEventListener('mouseenter', () => {
      const idx = parseInt(tab.getAttribute('data-index'));
      setCommitment(idx);
    });
  });

  function setCommitment(idx) {
    const data = commitments[idx];
    if (!data) return;

    tabs.forEach((t, i) => {
      if (i === idx) {
        t.style.color = 'var(--text-primary)';
        t.style.transform = 'translateX(10px)';
      } else {
        t.style.color = 'var(--text-muted)';
        t.style.transform = 'translateX(0)';
      }
    });

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.description;
    if (statEl) statEl.textContent = data.stat;
    if (labelEl) labelEl.textContent = data.statLabel;

    if (imgEl) {
      imgEl.style.opacity = '0.4';
      imgEl.style.transform = 'scale(1.05)';
      setTimeout(() => {
        imgEl.src = data.image;
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
      }, 150);
    }
  }
}

/* ==========================================================================
   7. NFC SCANNER SIMULATOR (DENEME KONNEKT)
   ========================================================================== */
function initNfcSimulator() {
  const scanBtn = document.getElementById('btn-scan-nfc');
  const resetBtn = document.getElementById('btn-reset-nfc');
  const idleScreen = document.getElementById('nfc-screen-idle');
  const activeScreen = document.getElementById('nfc-screen-active');
  const phoneContainer = document.getElementById('nfc-phone-screen');

  if (!scanBtn || !idleScreen || !activeScreen) return;

  scanBtn.addEventListener('click', () => {
    if (phoneContainer) {
      phoneContainer.style.boxShadow = '0 0 35px var(--accent-color)';
    }

    scanBtn.innerHTML = `
      <span class="btn-content" style="gap: 0.6rem;">
        <span style="display: inline-block; animation: spin 1s infinite linear;">⟳</span>
        <span>KİMLİK PLAKASI OKUNUYOR...</span>
      </span>
    `;

    setTimeout(() => {
      idleScreen.style.display = 'none';
      activeScreen.style.display = 'flex';
      if (phoneContainer) {
        phoneContainer.style.boxShadow = 'none';
      }
      scanBtn.innerHTML = `
        <span class="btn-panel" style="background: var(--accent-color);"></span>
        <span class="btn-content" style="gap: 0.8rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>SERİ NUMARASI DOĞRULANDI</span>
        </span>
      `;
    }, 900);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeScreen.style.display = 'none';
      idleScreen.style.display = 'flex';
      scanBtn.innerHTML = `
        <span class="btn-panel" style="background: var(--accent-color);"></span>
        <span class="btn-content" style="gap: 0.8rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span>CANLI NFC TARAMASINI TEST ET</span>
        </span>
      `;
    });
  }
}

/* ==========================================================================
   8. DYNAMIC CATEGORIES STRIP PREVIEW
   ========================================================================== */
function initCategoryStrip() {
  const items = document.querySelectorAll('.cat-strip-item');
  const imgEl = document.getElementById('cat-strip-img');
  const titleEl = document.getElementById('cat-strip-title');

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const img = item.getAttribute('data-img');
      const title = item.querySelector('span:first-child').textContent;

      items.forEach(i => {
        i.style.paddingLeft = '0';
        i.style.color = 'var(--text-primary)';
      });

      item.style.paddingLeft = '1.2rem';
      item.style.color = 'var(--accent-color)';

      if (imgEl && img) {
        imgEl.style.opacity = '0.3';
        imgEl.style.transform = 'scale(1.08)';
        setTimeout(() => {
          imgEl.src = img;
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'scale(1)';
        }, 120);
      }
      if (titleEl) titleEl.textContent = title.replace(/^\d+\.\s*/, '');
    });
  });
}

/* ==========================================================================
   9. PRODUCT QUICK-VIEW MODAL (SHOWCASE PRESENTATION)
   ========================================================================== */
function initProductModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('btn-close-modal');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal());
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function openProductModal(prod) {
  state.selectedProduct = prod;
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  // Set Content
  document.getElementById('modal-img').src = prod.images[0];
  document.getElementById('modal-title').textContent = prod.name;
  document.getElementById('modal-category').textContent = prod.categoryTr.toUpperCase();
  document.getElementById('modal-price').textContent = prod.price;
  document.getElementById('modal-desc').textContent = prod.description;
  document.getElementById('modal-wood-age').textContent = prod.woodAge;
  document.getElementById('modal-origin').textContent = prod.origin;
  document.getElementById('modal-dimensions').textContent = prod.dimensions;
  document.getElementById('modal-weight').textContent = prod.weight;

  // Thumbnails
  const thumbsContainer = document.getElementById('modal-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = prod.images.map((img, i) => `
      <div class="modal-thumb" data-src="${img}" style="width: 50px; height: 50px; border: 1px solid ${i === 0 ? 'var(--border-solid)' : 'var(--border-color)'}; cursor: pointer; overflow: hidden;">
        <img src="${img}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    `).join('');

    thumbsContainer.querySelectorAll('.modal-thumb').forEach(th => {
      th.addEventListener('click', () => {
        const src = th.getAttribute('data-src');
        document.getElementById('modal-img').src = src;
        thumbsContainer.querySelectorAll('.modal-thumb').forEach(t => t.style.borderColor = 'var(--border-color)');
        th.style.borderColor = 'var(--border-solid)';
      });
    });
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

