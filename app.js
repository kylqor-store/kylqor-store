
const SUPABASE_URL = "https://oevjmjsqfcufdtitovnc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4ftlK6R__1_dkLUuoWu1fQ_mvIF1f-t";

// Public anon key used by your existing Supabase function.
const SUPABASE_ANON_KEY = "PASTE_YOUR_EXISTING_LEGACY_ANON_KEY_HERE";

const PRODUCTS = {
  "tee-001": { name: "DROP 001 — GRAPHIC TEE", price: 799 },
  "tee-002": { name: "DROP 001 — SIGNATURE TEE", price: 799 }
};

let cart = {};

function addToCart(id) {
  if (!PRODUCTS[id]) return;

  const currentTotal = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  if (currentTotal >= 5) {
    alert("Maximum 5 items per order.");
    return;
  }

  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function renderCart() {
  const summary = document.getElementById("cart-summary");
  if (!summary) return;

  const ids = Object.keys(cart);
  if (!ids.length) {
    summary.textContent = "Your cart is empty.";
    return;
  }

  let total = 0;
  const lines = ids.map(id => {
    const item = PRODUCTS[id];
    total += item.price * cart[id];
    return `${item.name} × ${cart[id]} — ₹${item.price * cart[id]}`;
  });

  summary.textContent = `${lines.join(" | ")} | Total: ₹${total}`;
}

const form = document.getElementById("checkout-form");

if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("order-message");
    const button = form.querySelector('button[type="submit"]');

    const turnstileResponse =
      form.querySelector('[name="cf-turnstile-response"]')?.value;

    if (!turnstileResponse) {
      message.textContent = "Please complete the security check.";
      return;
    }

    if (Object.keys(cart).length === 0) {
      message.textContent = "Your cart is empty.";
      return;
    }

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    button.disabled = true;
    message.textContent = "Submitting your order...";

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/dynamic-responder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            customer: {
              name,
              phone,
              address,
              city,
              pincode,
              payment: "COD"
            },
            items: Object.entries(cart).map(([id, qty]) => ({ id, qty })),
            payment_method: "COD",
            turnstileToken: turnstileResponse
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not place order.");
      }

      message.textContent =
        `Order received! Order ID: ${result.order_id} · Total: ₹${result.total_amount}`;

      cart = {};
      renderCart();
      form.reset();

      if (window.turnstile) {
        window.turnstile.reset();
      }
    } catch (error) {
      message.textContent = error.message || "Checkout failed. Please try again.";
      if (window.turnstile) {
        window.turnstile.reset();
      }
    } finally {
      button.disabled = false;
    }
  });
}

renderCart();
