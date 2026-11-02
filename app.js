
// KYLQOR — Supabase-connected storefront

const SUPABASE_URL = "https://oevjmjsqfcufdtitovnc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_LEGACY_ANON_KEY_HERE";

const PRODUCTS = [
  { id: "tee-001", name: "DROP 001 — GRAPHIC TEE", price: 799, tag: "240 GSM · OVERSIZED" },
  { id: "tee-002", name: "DROP 001 — SIGNATURE TEE", price: 799, tag: "240 GSM · OVERSIZED" }
];

let cart = [];

const money = n => "₹" + Number(n).toLocaleString("en-IN");
const $ = id => document.getElementById(id);

function renderProducts() {
  $("products").innerHTML = PRODUCTS.map(p => `
    <article>
      <div class="product-image"><div class="shirt-shape"></div></div>
      <div class="product-info">
        <div>
          <h3>${p.name}</h3>
          <p>${p.tag} · ${money(p.price)}</p>
        </div>
        <button class="add-btn" data-add="${p.id}">ADD TO BAG +</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);

  $("cartItems").innerHTML = cart.length
    ? cart.map(i => `
      <div class="cart-row">
        <span>${i.name}<br>
          <small class="muted">${i.qty} × ${money(i.price)}</small>
        </span>
        <span>${money(i.qty * i.price)}
          <button data-remove="${i.id}">✕</button>
        </span>
      </div>
    `).join("")
    : '<p class="muted">Your bag is empty.</p>';

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  $("subtotal").textContent = money(total);
  $("checkoutTotal").textContent = money(total);
}

function openCart() {
  $("drawer").classList.add("open");
  $("backdrop").classList.add("open");
}

function closeCart() {
  $("drawer").classList.remove("open");
  $("backdrop").classList.remove("open");
}

$("products").addEventListener("click", e => {
  const id = e.target.dataset.add;
  if (!id) return;

  const product = PRODUCTS.find(p => p.id === id);
  const found = cart.find(p => p.id === id);

  found ? found.qty++ : cart.push({ ...product, qty: 1 });

  renderCart();
  openCart();
});

$("cartItems").addEventListener("click", e => {
  const id = e.target.dataset.remove;
  if (id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }
});

$("cartOpen").onclick = openCart;
$("cartClose").onclick = closeCart;
$("backdrop").onclick = closeCart;

$("checkoutOpen").onclick = () => {
  if (!cart.length) return;
  closeCart();
  $("checkoutBackdrop").classList.add("open");
};

$("checkoutClose").onclick = () => {
  $("checkoutBackdrop").classList.remove("open");
};

// Submit order to Supabase
$("checkoutForm").addEventListener("submit", async e => {
  e.preventDefault();

  if (!cart.length) return;

  const form = e.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  const message = $("checkoutMessage");

  if (submitButton) submitButton.disabled = true;
  message.textContent = "Submitting your order...";

  try {
    const data = Object.fromEntries(new FormData(form).entries());

    // COD only until online payment is configured
    if (String(data.payment).toLowerCase() !== "cod") {
      message.textContent =
        "Online payment is not active yet. Please select COD.";
      return;
    }

    const digits = String(data.phone || "")
      .replace(/\D/g, "")
      .replace(/^91/, "");

    if (digits.length !== 10) {
      message.textContent = "Enter a valid 10-digit phone number.";
      return;
    }

    const order = {
      customer: {
        name: String(data.name || "").trim(),
        phone: "+91" + digits,
        address: String(data.address || "").trim(),
        city: String(data.city || "").trim(),
        pincode: String(data.pincode || "").trim(),
        payment: "COD"
      },
      items: cart.map(item => ({
        id: item.id,
        qty: item.qty
      })),
      payment_method: "COD"
    };

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(order)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Could not submit your order.");
    }

    message.textContent =
      `Order received! Order ID: ${result.order_id} · Total: ${money(result.total_amount)}`;

    cart = [];
    renderCart();
    form.reset();

  } catch (error) {
    console.error("KYLQOR checkout:", error);
    message.textContent =
      error.message || "Something went wrong. Please try again.";
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

renderProducts();
renderCart();
