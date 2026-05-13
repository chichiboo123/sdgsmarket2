const CART_KEY = 'sdg-cart-v2';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(ids) {
  localStorage.setItem(CART_KEY, JSON.stringify(ids));
}

function addToCart(id) {
  const numId = Number(id);
  const cart = getCart();
  if (!cart.includes(numId)) {
    cart.push(numId);
    saveCart(cart);
  }
}

function removeFromCart(id) {
  const numId = Number(id);
  saveCart(getCart().filter(i => i !== numId));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function isInCart(id) {
  return getCart().includes(Number(id));
}
