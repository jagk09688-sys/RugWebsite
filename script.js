const defaultProducts = [
  {
    id: 'rug-aurora',
    name: 'Aurora Silk Rug',
    category: 'Rug',
    price: 1890,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'A richly textured rug with warm neutrals and a soft plush finish.',
    visible: true
  },
  {
    id: 'rug-velvet',
    name: 'Velvet Garden Runner',
    category: 'Rug',
    price: 960,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    description: 'An elegant runner designed for modern hallways and entry spaces.',
    visible: true
  },
  {
    id: 'rug-sahara',
    name: 'Sahara Weave Rug',
    category: 'Rug',
    price: 1320,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    description: 'Handwoven geometric pattern with earthy tones for luxurious comfort.',
    visible: true
  },
  {
    id: 'persian-heritage',
    name: 'Persian Heritage Rug',
    category: 'Rug',
    price: 1850,
    image: 'Web/assets/erfan-banaei-p00r5JmTMpY-unsplash.jpg',
    description: 'Authentic handwoven Persian rug with intricate traditional patterns.',
    visible: true
  },
  {
    id: 'modern-contemporary',
    name: 'Modern Contemporary Rug',
    category: 'Rug',
    price: 600,
    image: 'Web/assets/minh-pham-OtXADkUh3-I-unsplash.jpg',
    description: 'Sleek contemporary design with vibrant colors.',
    visible: true
  },
  {
    id: 'bohemian-collection',
    name: 'Bohemian Collection',
    category: 'Rug',
    price: 500,
    image: 'Web/assets/spacejoy-YqFz7UMm8qE-unsplash.jpg',
    description: 'Eclectic bohemian patterns with warm earth tones.',
    visible: true
  },
  {
    id: 'budget-classic',
    name: 'Budget-Friendly Classic',
    category: 'Rug',
    price: 275,
    image: 'Web/assets/robert-sciberras-kMN2AAoouuM-unsplash.jpg',
    description: 'Affordable, durable rugs perfect for everyday use.',
    visible: true
  },
  {
    id: 'table-cedar',
    name: 'Cedar Lounge Table',
    category: 'Table',
    price: 1320,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'Hand-finished oak table with a carved base and clean profile.',
    visible: true
  }
];


let products = [...defaultProducts];

const storageKey = 'royal-looms-cart';
let cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
let selectedProductId = null;

const productsStorageKey = 'royal-looms-products';

// Load persisted products (if any)
function loadProducts() {
  try {
    const raw = localStorage.getItem(productsStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        products = parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load persisted products', err);
  }
}

// Simple slug helper for admin uploads
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function saveProducts() {
  try {
    localStorage.setItem(productsStorageKey, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to save products', err);
  }
}

const productsSection = document.getElementById('products');
const rugsGrid = document.getElementById('rugs-grid');
const tablesGrid = document.getElementById('tables-grid');
const productSearchInput = document.getElementById('product-search');
const productFilterButtons = document.querySelectorAll('.filter-btn');
const productsSummary = document.getElementById('products-summary');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const customizeForm = document.getElementById('customize-form');
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modal-form');
const closeModalButton = document.getElementById('close-modal');
const selectedProductInput = document.getElementById('selected-product-id');
const checkoutForm = document.getElementById('checkout-form');
const checkoutMessage = document.getElementById('checkout-message');
const paymentMethodSelect = document.getElementById('payment-method');
const cardNumberGroup = document.getElementById('card-number-group');
const cardExpiryGroup = document.getElementById('card-expiry-group');
const paypalButtonContainer = document.getElementById('paypal-button-container');
const placeOrderButton = document.getElementById('place-order-button');
const adminForm = document.getElementById('admin-form');
const adminImage = document.getElementById('admin-image');
const adminMsg = document.getElementById('admin-message');
const adminReset = document.getElementById('admin-reset');
const adminClean = document.getElementById('admin-clean');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function cartHasPublishedProduct() {
  return cart.some((item) => {
    const product = products.find((p) => p.id === item.id);
    return product && product.visible;
  });
}

function updateCheckoutVisibility() {
  const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : '';
  const cardVisible = paymentMethod === 'Card';
  const paypalVisible = paymentMethod === 'PayPal' && cartHasPublishedProduct();

  if (cardNumberGroup) cardNumberGroup.style.display = cardVisible ? 'block' : 'none';
  if (cardExpiryGroup) cardExpiryGroup.style.display = cardVisible ? 'block' : 'none';
  if (paypalButtonContainer) paypalButtonContainer.style.display = paypalVisible ? 'block' : 'none';
  if (placeOrderButton) placeOrderButton.style.display = paypalVisible ? 'none' : 'block';
  if (paymentMethod === 'PayPal' && !cartHasPublishedProduct() && checkoutMessage) {
    checkoutMessage.textContent = 'PayPal is available only when your cart contains published products.';
  } else if (checkoutMessage && paymentMethod !== 'PayPal') {
    checkoutMessage.textContent = '';
  }
}

function getActiveProductFilter() {
  const activeFilterButton = document.querySelector('.filter-btn.active');
  return activeFilterButton ? activeFilterButton.dataset.filter || 'all' : 'all';
}

function getFilteredProducts() {
  const adminMode = sessionStorage.getItem('adminMode') === 'true';
  const sourceProducts = adminMode ? products : products.filter((p) => p.visible);
  const activeFilter = getActiveProductFilter();
  const searchTerm = (productSearchInput?.value || '').trim().toLowerCase();

  return sourceProducts.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();
  const rugs = filteredProducts.filter((item) => item.category === 'Rug');
  const tables = filteredProducts.filter((item) => item.category === 'Table');

  if (productsSummary) {
    const totalProducts = filteredProducts.length;
    productsSummary.textContent = totalProducts
      ? `Showing ${totalProducts} available piece${totalProducts === 1 ? '' : 's'}`
      : 'No pieces match your current search';
  }

  if (rugsGrid) {
    rugsGrid.innerHTML = rugs.length
      ? rugs.map(renderProductCard).join('')
      : '<p>No rugs are available yet.</p>';
  }

  if (tablesGrid) {
    tablesGrid.innerHTML = tables.length
      ? tables.map(renderProductCard).join('')
      : '<p>No tables are available yet.</p>';
  }
}

function renderProductCard(product) {
  return `
    <article class="card product-card">
      <img class="product-img" loading="lazy" src="${product.image}" alt="${product.name}" />
      <div class="product-body">
        <div class="product-meta">
          <span class="chip">${product.category}</span>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="btn btn-secondary" data-action="customize" data-id="${product.id}">Customize</button>
          <button class="btn btn-primary" data-action="add" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

// Toggle admin/public view UI
const viewToggle = document.getElementById('view-toggle');
const adminSection = document.getElementById('admin');

function updateAdminVisibility() {
  const adminMode = sessionStorage.getItem('adminMode') === 'true';
  if (adminSection) adminSection.style.display = adminMode ? 'block' : 'none';
  if (viewToggle) viewToggle.textContent = adminMode ? 'Public view' : 'Admin view';
}

if (viewToggle) {
  if (sessionStorage.getItem('adminMode') === null) sessionStorage.setItem('adminMode', 'false');
  viewToggle.addEventListener('click', () => {
    const current = sessionStorage.getItem('adminMode') === 'true';
    const next = current ? 'false' : 'true';
    sessionStorage.setItem('adminMode', next);
    updateAdminVisibility();
    renderProducts();
  });
}

productSearchInput?.addEventListener('input', renderProducts);
productFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    productFilterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  });
});


adminForm && adminForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('admin-name').value.trim();
  const category = document.getElementById('admin-category').value;
  const price = Number(document.getElementById('admin-price').value) || 0;
  const description = document.getElementById('admin-desc').value.trim();
  const file = adminImage.files && adminImage.files[0];

  if (!file) {
    adminMsg.textContent = 'Please choose an image file.';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e){
    const dataUrl = e.target.result;
    const id = slugify(name) + '-' + Date.now();
    const newProduct = {
      id,
      name,
      category,
      price,
      image: dataUrl,
        description,
        // New uploads are private by default
        visible: false
    };
    products.unshift(newProduct);
    saveProducts();
    renderProducts();
    adminMsg.textContent = 'Product added to the storefront.';
    adminForm.reset();
  };
  reader.readAsDataURL(file);
});

adminReset && adminReset.addEventListener('click', () => {
  adminForm.reset();
  adminMsg.textContent = '';
});

// Remove sample/default products (external images) and keep only uploaded items (data URLs)
adminClean && adminClean.addEventListener('click', () => {
  const before = products.length;
  products = products.filter(p => typeof p.image === 'string' && p.image.startsWith('data:'));
  saveProducts();
  // purge cart entries that reference removed products
  const validIds = new Set(products.map(p => p.id));
  cart = cart.filter(item => validIds.has(item.id));
  saveCart();
  renderProducts();
  renderCart();
  adminMsg.textContent = `Kept ${products.length} uploaded product(s); removed ${before - products.length} sample product(s).`;
});

// Admin products list and actions
const adminProductsEl = document.getElementById('admin-products');

function renderAdminProducts() {
  if (!adminProductsEl) return;
  if (!products.length) {
    adminProductsEl.innerHTML = '<p>No uploaded products yet.</p>';
    return;
  }

  adminProductsEl.innerHTML = products
    .map(p => `
      <div style="display:flex;align-items:center;gap:.6rem;border:1px solid var(--border);padding:.6rem;border-radius:.6rem;">
        <img src="${p.image}" alt="${p.name}" style="width:72px;height:54px;object-fit:cover;border-radius:.4rem;"/>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${p.name}</strong>
            <span class="price">${formatCurrency(p.price || 0)}</span>
          </div>
          <div style="color:var(--muted);font-size:.9rem">${p.category} • ${p.description || ''}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:.4rem">
          ${p.visible ? `<button class="btn btn-secondary" data-action="unpublish" data-id="${p.id}">Unpublish</button>` : `<button class="btn btn-primary" data-action="publish" data-id="${p.id}">Publish</button>`}
          <button class="btn" style="background:transparent;color:var(--accent);font-weight:700" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join('');
}

adminProductsEl && adminProductsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (!action || !id) return;

  if (action === 'publish') {
    const prod = products.find(x => x.id === id);
    if (prod) prod.visible = true;
  }

  if (action === 'unpublish') {
    const prod = products.find(x => x.id === id);
    if (prod) prod.visible = false;
  }

  if (action === 'delete') {
    products = products.filter(x => x.id !== id);
    // remove from cart as well
    const validIds = new Set(products.map(p => p.id));
    cart = cart.filter(item => validIds.has(item.id));
    saveCart();
  }

  saveProducts();
  renderAdminProducts();
  renderProducts();
  renderCart();
});

// Ensure renderAdminProducts is called after product changes
// (call at end of file after initial render)

// Initialize products from storage if available
loadProducts();

function renderCart() {
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

  if (!cart.length) {
    cartItems.innerHTML = '<p>Your cart is empty. Select a rug or table to begin.</p>';
    checkoutMessage.textContent = '';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 120 : 0;
  const total = subtotal + shipping;

  cartItems.innerHTML = `
    <div>
      ${cart
        .map(
          (item) => `
            <div class="cart-item">
              <div>
                <h4>${item.name}</h4>
                <p>${item.category}</p>
                ${item.customDetails ? `<p>Custom: ${item.customDetails.size}, ${item.customDetails.color}, ${item.customDetails.material}</p>` : ''}
                <div class="qty-controls">
                  <button data-action="decrease" data-id="${item.id}">−</button>
                  <span>${item.quantity}</span>
                  <button data-action="increase" data-id="${item.id}">+</button>
                </div>
              </div>
              <div>
                <p>${formatCurrency(item.price * item.quantity)}</p>
                <button class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
              </div>
            </div>
          `
        )
        .join('')}
    </div>
    <div class="card" style="padding: 1rem; margin-top: 0.8rem;">
      <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
      <p><strong>Delivery:</strong> ${formatCurrency(shipping)}</p>
      <p><strong>Total:</strong> ${formatCurrency(total)}</p>
    </div>
  `;
}

function addToCart(productId, customDetails = null) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId && JSON.stringify(item.customDetails || {}) === JSON.stringify(customDetails || {}));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1,
      customDetails
    });
  }

  saveCart();
  renderCart();
  updateCheckoutVisibility();
}

function openModal(productId) {
  selectedProductId = productId;
  selectedProductInput.value = productId;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalForm.reset();
  selectedProductId = null;
}

productsSection && productsSection.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === 'add') {
    addToCart(id);
  }

  if (action === 'customize') {
    openModal(id);
  }
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'increase') {
    const item = cart.find((entry) => entry.id === id);
    if (item) item.quantity += 1;
  }

  if (action === 'decrease') {
    const item = cart.find((entry) => entry.id === id);
    if (item && item.quantity > 1) item.quantity -= 1;
  }

  if (action === 'remove') {
    cart = cart.filter((entry) => entry.id !== id);
  }

  saveCart();
  renderCart();
  updateCheckoutVisibility();
});

customizeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(customizeForm);
  const customDetails = {
    size: formData.get('projectType'),
    color: 'Consultation',
    material: formData.get('designNotes')
  };

  addToCart('rug-aurora', customDetails);
  checkoutMessage.textContent = 'Your custom request has been added. Review it in the cart and complete checkout.';
  customizeForm.reset();
});

modalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(modalForm);

  addToCart(selectedProductId, {
    size: formData.get('size'),
    color: formData.get('color'),
    material: formData.get('material'),
    notes: formData.get('notes')
  });

  closeModal();
});

closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!cart.length) {
    checkoutMessage.textContent = 'Add at least one rug or table before checkout.';
    return;
  }

  const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : '';
  const cardNumber = document.getElementById('card-number').value.trim();

  if (paymentMethod === 'Card' && cardNumber.length < 12) {
    checkoutMessage.textContent = 'Please enter a valid card number for card payments.';
    return;
  }

  if (paymentMethod === 'PayPal') {
    if (!cartHasPublishedProduct()) {
      checkoutMessage.textContent = 'PayPal is available only when your cart contains published products.';
      return;
    }
    checkoutMessage.textContent = 'Please complete payment using the PayPal button below.';
    return;
  }

  checkoutMessage.textContent = `Payment confirmed via ${paymentMethod}. Your custom order is being prepared for delivery.`;
  cart = [];
  saveCart();
  renderCart();
  checkoutForm.reset();
  updateCheckoutVisibility();
});

function updateAfterCartChange() {
  renderCart();
  updateCheckoutVisibility();
}

if (paymentMethodSelect) {
  paymentMethodSelect.addEventListener('change', updateCheckoutVisibility);
}

function initPayPalButton() {
  if (!paypalButtonContainer || typeof paypal === 'undefined') return;

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: function(data, actions) {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal > 0 ? 120 : 0;
      const total = subtotal + shipping;
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toString()
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        checkoutMessage.textContent = `Payment completed by ${details.payer.name.given_name}. Thank you!`;
        cart = [];
        saveCart();
        renderCart();
        checkoutForm.reset();
        updateCheckoutVisibility();
      });
    },
    onError: function(err) {
      checkoutMessage.textContent = 'PayPal payment failed. Please try again.';
      console.error(err);
    }
  }).render('#paypal-button-container');
}

renderProducts();
renderCart();
renderAdminProducts();
updateCheckoutVisibility();
initPayPalButton();
