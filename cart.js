(function () {
  "use strict";
  var KEY = "beanBoutiqueCart";
  function getCart() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    updateCounts();
  }
  function money(n) { return "$" + Number(n).toFixed(2); }
  function updateCounts() {
    var cart = getCart();
    var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = count; });
  }
  function addItem(button) {
    var cart = getCart();
    var id = button.getAttribute("data-id");
    var found = cart.find(function (item) { return item.id === id; });
    if (found) found.qty += 1;
    else cart.push({ id: id, name: button.getAttribute("data-name"), price: Number(button.getAttribute("data-price")), qty: 1 });
    saveCart(cart);
    var oldText = button.textContent;
    button.textContent = "Added ✓";
    window.setTimeout(function () { button.textContent = oldText; }, 1000);
  }
  function renderCart() {
    var container = document.getElementById("cartItems");
    if (!container) return;
    var empty = document.getElementById("emptyCart");
    var cart = getCart();
    container.innerHTML = "";
    if (empty) empty.style.display = cart.length ? "none" : "block";
    cart.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = '<div><h3></h3><p class="product-meta"></p></div><div class="quantity-control"><button type="button" data-action="minus" aria-label="Decrease quantity">−</button><strong></strong><button type="button" data-action="plus" aria-label="Increase quantity">+</button></div><button class="remove-item" type="button" data-action="remove">Remove</button>';
      row.querySelector("h3").textContent = item.name;
      row.querySelector("p").textContent = money(item.price) + " each";
      row.querySelector("strong").textContent = item.qty;
      row.querySelector('[data-action="minus"]').addEventListener("click", function () { changeQty(item.id, -1); });
      row.querySelector('[data-action="plus"]').addEventListener("click", function () { changeQty(item.id, 1); });
      row.querySelector('[data-action="remove"]').addEventListener("click", function () { saveCart(getCart().filter(function (x) { return x.id !== item.id; })); renderCart(); });
      container.appendChild(row);
    });
    var subtotal = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    var tax = subtotal * 0.08;
    var subEl = document.getElementById("cartSubtotal");
    var taxEl = document.getElementById("cartTax");
    var totalEl = document.getElementById("cartTotal");
    if (subEl) subEl.textContent = money(subtotal);
    if (taxEl) taxEl.textContent = money(tax);
    if (totalEl) totalEl.textContent = money(subtotal + tax);
  }
  function changeQty(id, delta) {
    var cart = getCart();
    var item = cart.find(function (x) { return x.id === id; });
    if (item) item.qty += delta;
    cart = cart.filter(function (x) { return x.qty > 0; });
    saveCart(cart);
    renderCart();
  }
  document.addEventListener("DOMContentLoaded", function () {
    updateCounts();
    document.querySelectorAll(".add-to-cart").forEach(function (button) {
      button.addEventListener("click", function () { addItem(button); });
    });
    renderCart();
    var checkout = document.getElementById("checkoutBtn");
    if (checkout) checkout.addEventListener("click", function () {
      var status = document.getElementById("cartStatus");
      var cart = getCart();
      if (!cart.length) status.textContent = "Your cart is empty. Add a product before checking out.";
      else status.textContent = "Your order summary is ready. This demonstration site does not process payments.";
    });
    var eventForm = document.getElementById("eventForm");
    if (eventForm) eventForm.addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("eventStatus").textContent = "Thank you — your event interest has been recorded for this demo.";
      eventForm.reset();
    });
    document.querySelectorAll(".subscribe-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var status = document.getElementById("subscriptionStatus");
        if (status) status.textContent = button.getAttribute("data-plan") + " plan selected. This demo does not create a paid subscription.";
      });
    });
  });
})();