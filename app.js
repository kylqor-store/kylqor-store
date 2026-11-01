// KYLQOR storefront starter. Replace demo products and connect Supabase before launch.
const PRODUCTS = [
  {id:"tee-001",name:"DROP 001 — GRAPHIC TEE",price:799,tag:"240 GSM · OVERSIZED"},
  {id:"tee-002",name:"DROP 001 — SIGNATURE TEE",price:799,tag:"240 GSM · OVERSIZED"}
];
let cart = [];
const money = n => "₹" + n.toLocaleString("en-IN");
const $ = id => document.getElementById(id);
function renderProducts(){
  $("products").innerHTML = PRODUCTS.map(p=>`<article><div class="product-image"><div class="shirt-shape"></div></div><div class="product-info"><div><h3>${p.name}</h3><p>${p.tag} · ${money(p.price)}</p></div><button class="add-btn" data-add="${p.id}">ADD TO BAG +</button></div></article>`).join("");
}
function renderCart(){
  $("cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);
  $("cartItems").innerHTML=cart.length?cart.map(i=>`<div class="cart-row"><span>${i.name}<br><small class="muted">${i.qty} × ${money(i.price)}</small></span><span>${money(i.qty*i.price)} <button data-remove="${i.id}">✕</button></span></div>`).join(""):'<p class="muted">Your bag is empty.</p>';
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);$("subtotal").textContent=money(total);$("checkoutTotal").textContent=money(total);
}
function openCart(){ $("drawer").classList.add("open");$("backdrop").classList.add("open"); }
function closeCart(){ $("drawer").classList.remove("open");$("backdrop").classList.remove("open"); }
$("products").addEventListener("click",e=>{const id=e.target.dataset.add;if(!id)return;const p=PRODUCTS.find(x=>x.id===id);const found=cart.find(x=>x.id===id);found?found.qty++:cart.push({...p,qty:1});renderCart();openCart();});
$("cartItems").addEventListener("click",e=>{const id=e.target.dataset.remove;if(id){cart=cart.filter(x=>x.id!==id);renderCart();}});
$("cartOpen").onclick=openCart;$("cartClose").onclick=closeCart;$("backdrop").onclick=closeCart;
$("checkoutOpen").onclick=()=>{if(!cart.length)return;closeCart();$("checkoutBackdrop").classList.add("open");};
$("checkoutClose").onclick=()=> $("checkoutBackdrop").classList.remove("open");
$("checkoutForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!cart.length)return;
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  const order={customer:data,items:cart.map(({id,name,price,qty})=>({id,name,price,qty})),total:cart.reduce((s,i)=>s+i.price*i.qty,0),currency:"INR",payment_method:data.payment};
  if(data.payment==="online"){ $("checkoutMessage").textContent="Online payments are not active yet. The secure payment gateway must be configured before accepting payment."; return; }
  // Demo mode only: no order is transmitted or stored until Supabase is connected.
  console.log("DEMO COD ORDER — connect Supabase before launch:",order);
  $("checkoutMessage").textContent="Demo only: order details are not yet saved. Connect Supabase before publishing this store.";
});
renderProducts();renderCart();
