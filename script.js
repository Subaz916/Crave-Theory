// ============================================
// CRAVE THEORY — JavaScript
// ============================================

// ===== Shopping Cart State =====
let cart = [];

function loadCart() {
  try {
    const saved = localStorage.getItem('craveCart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) { cart = []; }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('craveCart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p>Your cart is empty.<br>Add some cravings to get started!</p>
      </div>`;
    document.getElementById('cartTotal').textContent = 'Rs 0';
    document.getElementById('cartDelivery').style.display = 'none';
    return;
  }
  let html = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    html += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          ${item.size ? `<div class="ci-size">${item.size}</div>` : ''}
          <div class="ci-controls">
            <button onclick="changeQty(${idx}, -1)">−</button>
            <span class="ci-qty">${item.qty}</span>
            <button onclick="changeQty(${idx}, 1)">+</button>
            <span class="ci-price">Rs ${subtotal}</span>
          </div>
        </div>
        <button class="ci-remove" onclick="removeItem(${idx})" aria-label="Remove">×</button>
      </div>`;
  });
  container.innerHTML = html;
  const delivery = 100;
  const finalTotal = total + delivery;
  document.getElementById('cartDelivery').style.display = 'flex';
  document.getElementById('cartTotal').textContent = 'Rs ' + finalTotal.toLocaleString();
}

function changeQty(idx, delta) {
  if (idx < 0 || idx >= cart.length) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  saveCart();
}

function removeItem(idx) {
  if (idx < 0 || idx >= cart.length) return;
  cart.splice(idx, 1);
  saveCart();
}

function addToCart(name, price, size, img) {
  const existing = cart.find(i => i.name === name && i.size === (size || ''));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, size: size || '', qty: 1, img });
  }
  saveCart();
  // Flash the cart button
  const btn = document.getElementById('cartBtn');
  btn.style.color = '#F5B800';
  setTimeout(() => btn.style.color = '', 600);
  // Auto-open cart briefly? No — just open it
  openCart();
}

// ===== Cart Open/Close =====
function openCart() {
  document.getElementById('cart').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});

// ===== Place Order =====
document.getElementById('cartPlace').addEventListener('click', () => {
  if (!cart.length) return;
  const orderText = cart.map(i =>
    `${i.name}${i.size ? ' (' + i.size + ')' : ''} x${i.qty} - Rs ${i.price * i.qty}`
  ).join('\n');
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = 100;
  const total = subtotal + delivery;
  const msg = encodeURIComponent(`Hi Crave Theory! I'd like to place an order:\n\n${orderText}\n\nSubtotal: Rs ${subtotal}\nDelivery: Rs ${delivery}\nTotal: Rs ${total}` +
    '\n\nPlease confirm my order. Thank you!');

  const cartEl = document.getElementById('cart');
  let loader = document.getElementById('cartLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'cartLoader';
    loader.className = 'cart-loading-overlay';
    loader.innerHTML = `
      <div class="cart-loading-icon">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </div>
      <h3 class="cart-loading-text">OPENING WHATSAPP</h3>
      <p class="cart-loading-sub">Preparing your delicious order...</p>
    `;
    cartEl.appendChild(loader);
  }
  loader.classList.add('active');

  setTimeout(() => {
    window.open('https://wa.me/923277795050?text=' + msg, '_blank');
    setTimeout(() => {
      loader.classList.remove('active');
    }, 1000);
  }, 1600);
});

// ===== Size Selection =====
document.addEventListener('click', (e) => {
  const sizeBtn = e.target.closest('.size-btn');
  if (!sizeBtn) return;
  const card = sizeBtn.closest('.food-card');
  const price = parseInt(sizeBtn.dataset.s === 'Large' ? (card.dataset.size ? JSON.parse(card.dataset.size).Large : card.dataset.price) : (card.dataset.size ? JSON.parse(card.dataset.size).Regular || JSON.parse(card.dataset.size).Small : card.dataset.price), 10);
  card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  sizeBtn.classList.add('active');
  const addBtn = card.querySelector('.btn-add');
  addBtn.dataset.price = price;
  addBtn.dataset.size = sizeBtn.dataset.s;
  if (card.dataset.size) {
    card.dataset.currentSize = sizeBtn.dataset.s;
  }
});

// ===== Add to Order Buttons & Deals =====
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.btn-add');
  const dealBtn = e.target.closest('.order-deal');
  
  if (addBtn) {
    const card = addBtn.closest('.food-card');
    const name = card.dataset.name;
    let price = parseInt(addBtn.dataset.price, 10);
    let size = addBtn.dataset.size || '';
    const img = card.dataset.img;
    addToCart(name, price, size, img);
  } else if (dealBtn) {
    const card = dealBtn.closest('.deal-card');
    const name = card.dataset.name;
    let price = parseInt(dealBtn.dataset.price, 10);
    let size = '';
    const img = card.dataset.img;
    addToCart(name, price, size, img);
  }
});

// ===== Menu Tab Switching =====
const menuTabs = document.querySelectorAll('.menu-tab');
menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    menuTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    document.querySelectorAll('.menu-cat').forEach(c => c.classList.remove('active'));
    const target = document.getElementById('cat-' + cat);
    if (target) target.classList.add('active');
    // Re-trigger reveal animations
    target.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  });
});

// ===== Featured Category Clicks =====
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const href = card.getAttribute('href');
    if (href && href.startsWith('#') && href !== '#deals') {
      e.preventDefault();
      const cat = href.substring(1);
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        const y = menuSection.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      const tab = document.querySelector(`.menu-tab[data-cat="${cat}"]`);
      if (tab) tab.click();
    }
  });
});

// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ===== Header Scroll Effect + Scroll Spy =====
const header = document.getElementById('siteHeader');
const navLinkEls = document.querySelectorAll('.nav-links a');
const sections = ['home', 'menu', 'deals', 'about', 'contact'];

function updateActiveLink() {
  const pos = window.scrollY + 120;
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= pos) current = id;
  });
  navLinkEls.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  updateActiveLink();
});
updateActiveLink();

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== FAQ Accordion =====
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    
    // Toggle current
    if (!isActive) {
      item.classList.add('active');
    }
  });
});

// ===== Draggable WhatsApp Button =====
const waBtn = document.querySelector('.sticky-wa');
if (waBtn) {
  let isDragging = false;
  let hasDragged = false;
  let startX, startY, initialX, initialY;
  let lastX = 0, lastTime = 0;
  
  waBtn.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
    }
  });

  const onDragStart = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return; // Only left click
    isDragging = true;
    hasDragged = false;
    waBtn.style.transition = 'none';
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    startX = clientX;
    startY = clientY;
    lastX = clientX;
    lastTime = Date.now();
    
    waBtn.style.transform = 'scale(0.9)'; // Motion animation start
    
    const rect = waBtn.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    // Switch to left/top positioning
    waBtn.style.bottom = 'auto';
    waBtn.style.right = 'auto';
    waBtn.style.left = initialX + 'px';
    waBtn.style.top = initialY + 'px';
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDragged = true;
    }
    
    // Calculate velocity for motion tilt
    const now = Date.now();
    const dt = Math.max(1, now - lastTime);
    const vx = (clientX - lastX) / dt;
    lastX = clientX;
    lastTime = now;
    
    let rotation = vx * 15;
    rotation = Math.max(-20, Math.min(20, rotation)); // Clamp tilt
    
    waBtn.style.transform = `scale(0.9) rotate(${rotation}deg)`;
    
    let newX = initialX + dx;
    let newY = initialY + dy;
    
    const maxX = window.innerWidth - waBtn.offsetWidth;
    const maxY = window.innerHeight - waBtn.offsetHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    waBtn.style.left = newX + 'px';
    waBtn.style.top = newY + 'px';
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    waBtn.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Bouncy back animation
    waBtn.style.transform = 'scale(1) rotate(0deg)'; // Reset motion animation
    
    const rect = waBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const padding = window.innerWidth <= 768 ? 20 : 30; // Match CSS bottom/right padding
    
    if (centerX < window.innerWidth / 2) {
      waBtn.style.left = padding + 'px';
    } else {
      waBtn.style.left = (window.innerWidth - rect.width - padding) + 'px';
    }
    
    // Ensure it doesn't get stuck out of bounds vertically
    if (rect.top < padding) waBtn.style.top = padding + 'px';
    if (rect.bottom > window.innerHeight - padding) waBtn.style.top = (window.innerHeight - rect.height - padding) + 'px';
  };

  waBtn.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  waBtn.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) e.preventDefault();
    onDragMove(e);
  }, { passive: false });
  document.addEventListener('touchend', onDragEnd);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});
