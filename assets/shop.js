// 1. Variables globales et état
const state = {
  currentView: "shop", // 'shop', 'login', 'admin', 'add-product', 'edit-product', 'delete-product'
  products: [],
  categories: [],
  shoppingCart: [],
};

// 2. Références DOM
const elements = {
  categorySelect: document.getElementById("categorySelect"),
  productsContainer: document.getElementById("productList"),
  productCount: document.getElementById("numberOfProducts"),
  mainContainer: document.getElementById("mainContainer"),
  categoriesContainer: document.getElementById("categoriesContainer"),
  userProfile: document.getElementById("userProfile"),
  cartElement: document.getElementById("userShoppingCart"),
  trustPilot: document.getElementById("trustPilot"),
  freeShipping: document.getElementById("freeShipping"),
  header: document.getElementById("header"),
  cartBadge: document.getElementById("shoppingCartBadge"),
};

// 3. Fonctions d'initialisation
async function init() {
  await loadAndInitializeData();
  setupEventListeners();
  renderShopView();
}

async function loadAndInitializeData() {
  try {
    const data = await loadData();
    state.products = data.produits;
    state.categories = data.categories;

    // Initialiser le localStorage si nécessaire
    if (localStorage.getItem("shop_products") === null) {
      localStorage.setItem("shop_products", JSON.stringify(data.produits));
      localStorage.setItem("shop_categories", JSON.stringify(data.categories));
    } else {
      state.products = JSON.parse(localStorage.getItem("shop_products"));
      state.categories = JSON.parse(localStorage.getItem("shop_categories"));
    }

    // Mettre à jour le compteur
    updateCounter(state.products.length);
  } catch (error) {
    console.error("Erreur lors du chargement initial:", error);
  }
}

// 4. Fonctions de chargement des données
async function loadData() {
  try {
    const response = await fetch("/assets/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading data:", error);
    return { categories: [], produits: [] };
  }
}

// 5. Gestion des vues
function renderShopView() {
  // Afficher les éléments de la boutique
  elements.categoriesContainer.style.display = "block";
  elements.mainContainer.style.display = "block";
  elements.categorySelect.style.display = "block";
  elements.productsContainer.style.display = "block";
  elements.productCount.style.display = "block";

  // Remplir le sélecteur de catégories
  renderCategorySelect();

  // Afficher tous les produits
  renderProducts(state.products);
}

function renderCategorySelect() {
  // Garder la première option (Tous les produits)
  // Efface les autres lignes et construit à nouveau les options des catégories
  while (elements.categorySelect.options.length > 1) {
    elements.categorySelect.remove(1);
  }

  // Ajouter les catégories
  state.categories.forEach((category, idx) => {
    if (idx === 0) {
      // Ajouter une option "Tous les produits" au début
      const allOption = document.createElement("option");
      allOption.value = 0;
      allOption.textContent = "Tous les produits";
      elements.categorySelect.appendChild(allOption);
    }
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.nom;

    elements.categorySelect.appendChild(option);
  });
}

function renderProducts(products) {
  // Effacer les produits existants
  elements.productsContainer.innerHTML = "";

  // Ajouter les nouveaux produits
  products.forEach((product) => {
    const productCard = createProductCard(product);
    elements.productsContainer.appendChild(productCard);
  });

  // Mettre à jour le compteur
  updateCounter(products.length);
}

function renderLoginView() {
  clearPage();
  state.currentView = "login";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75">
      <h2 class="mb-4">Page d'administration</h2>
      <input type="text" id="username" placeholder="Nom d'utilisateur" class="mb-2 form-control" style="width: 300px;"/>
      <input type="password" id="password" placeholder="Mot de passe" class="mb-2 form-control" style="width: 300px;"/>
      <button id="loginButton" type="submit" class="btn btn-dark mt-3">Se connecter</button>
    </div>
  `;
}

function renderAdminView() {
  clearPage();
  state.currentView = "admin";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75 gap-4">
      <h2 class="mb-4">Bienvenue dans l'administration</h2>
      <p>Gérez vos produits et catégories ici.</p>
      <div class="d-flex flex-column gap-3" style="width: 300px;">
        <button id="addProductButton" class="btn btn-dark btn-lg">Ajouter un produit</button>
        <button id="editProductButton" class="btn btn-outline-dark btn-lg">Modifier un produit</button>
        <button id="deleteProductButton" class="btn btn-outline-dark btn-lg">Supprimer un produit</button>
        <button id="backToShopButton" class="btn btn-secondary btn-lg mt-4">Retour à la boutique</button>
      </div>
    </div>
  `;
}

function renderAddProductView() {
  clearPage();
  state.currentView = "add-product";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75" style="width: 100%; max-width: 500px; margin: 0 auto;">
      <h2 class="mb-4">Ajouter un nouveau produit</h2>
      <form id="productForm" class="w-100 px-4">
        <div class="mb-3">
          <input type="text" id="productName" placeholder="Nom du produit" class="form-control" required>
        </div>
        <div class="mb-3">
          <input type="number" id="productPrice" placeholder="Prix du produit" class="form-control" step="0.01" min="0" required>
        </div>
        <div class="mb-3">
          <input type="text" id="productImage" placeholder="URL de l'image" class="form-control" required>
        </div>
        <div class="mb-3">
          <select id="productCategory" class="form-select" required>
            <option value="" disabled selected>Sélectionner une catégorie</option>
          </select>
        </div>
        <div class="d-flex gap-2">
          <button id="saveProductButton" type="submit" class="btn btn-dark flex-grow-1">Enregistrer le produit</button>
          <button id="cancelProductButton" type="button" class="btn btn-outline-secondary flex-grow-1">Annuler</button>
        </div>
      </form>
    </div>
  `;

  // Remplir le sélecteur de catégories
  populateProductCategoryDropdown();
}

function renderEditProductView() {
  clearPage();
  state.currentView = "edit-product";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75" style="width: 100%; max-width: 600px; margin: 0 auto;">
      <h2 class="mb-4">Modifier un produit</h2>
      <div id="productsListForEdit" class="w-100 px-4 mb-4" style="max-height: 300px; overflow-y: auto;">
        <!-- Les produits seront ajoutés ici -->
      </div>
      <button id="cancelEditProductButton" class="btn btn-outline-secondary">Annuler</button>
    </div>
  `;

  // Afficher la liste des produits à modifier
  renderProductsForEdit();
}

function renderDeleteProductView() {
  clearPage();
  state.currentView = "delete-product";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75" style="width: 100%; max-width: 600px; margin: 0 auto;">
      <h2 class="mb-4">Supprimer un produit</h2>
      <div id="productsListForDelete" class="w-100 px-4 mb-4" style="max-height: 300px; overflow-y: auto;">
        <!-- Les produits seront ajoutés ici -->
      </div>
      <button id="cancelDeleteProductButton" class="btn btn-outline-secondary">Annuler</button>
    </div>
  `;

  // Afficher la liste des produits à supprimer
  renderProductsForDelete();
}

// 6. Fonctions utilitaires pour les vues
function populateProductCategoryDropdown() {
  const categorySelect = document.getElementById("productCategory");
  if (categorySelect) {
    state.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.nom;
      categorySelect.appendChild(option);
    });
  }
}

function renderProductsForEdit() {
  const container = document.getElementById("productsListForEdit");
  if (!container) return;

  container.innerHTML = "";

  state.products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className =
      "card mb-2 p-3 d-flex flex-row align-items-center justify-content-between";
    productElement.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.image}" alt="${product.nom}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        <div>
          <h6 class="mb-0">${product.nom}</h6>
          <small class="text-muted">€${product.prix} - ${getCategoryNameById(product.categorie_id)}</small>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-primary edit-product-btn" data-product-id="${product.id}">Modifier</button>
    `;
    container.appendChild(productElement);
  });
}

function renderProductsForDelete() {
  const container = document.getElementById("productsListForDelete");
  if (!container) return;

  container.innerHTML = "";

  state.products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className =
      "card mb-2 p-3 d-flex flex-row align-items-center justify-content-between";
    productElement.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.image}" alt="${product.nom}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        <div>
          <h6 class="mb-0">${product.nom}</h6>
          <small class="text-muted">€${product.prix} - ${getCategoryNameById(product.categorie_id)}</small>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger delete-product-btn" data-product-id="${product.id}">Supprimer</button>
    `;
    container.appendChild(productElement);
  });
}

// 7. Fonctions de création d'éléments
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "card product-card";
  card.style.width = "9rem";
  card.dataset.productId = product.id;

  const img = document.createElement("img");
  img.src = product.image;
  img.className = "card-img-top";
  img.alt = product.nom;
  img.style.height = "120px";
  img.style.objectFit = "cover";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const title = document.createElement("h5");
  title.className = "card-title luckiest-guy-regular fs-6 mb-1";
  title.textContent = product.nom;

  const price = document.createElement("p");
  price.className = "card-text montserrat-regular fs-6 mb-2";
  price.textContent = `€${product.prix}`;

  const addToCartBtn = document.createElement("button");
  addToCartBtn.className = "btn btn-sm btn-outline-dark w-100 add-to-cart-btn";
  addToCartBtn.textContent = "Ajouter";
  addToCartBtn.dataset.productId = product.id;

  cardBody.appendChild(title);
  cardBody.appendChild(price);
  cardBody.appendChild(addToCartBtn);

  card.appendChild(img);
  card.appendChild(cardBody);

  return card;
}

// 8. Fonctions utilitaires
function getCategoryNameById(id) {
  const categories = JSON.parse(localStorage.getItem("shop_categories"));
  const category = categories.find((cat) => cat.id === id);
  return category ? category.nom : "Inconnue";
}

function updateCounter(count) {
  elements.productCount.innerHTML = count;
}

function clearPage() {
  elements.categoriesContainer.style.display = "none";
  elements.mainContainer.style.display = "block"; // On garde le mainContainer visible
  elements.categorySelect.style.display = "none";
  elements.productsContainer.style.display = "none";
  elements.productCount.style.display = "none";

  // Effacer le contenu du mainContainer
  elements.mainContainer.innerHTML = "";
}

// 9. Gestion des événements
function setupEventListeners() {
  // Événement pour le sélecteur de catégories
  elements.categorySelect.addEventListener("change", handleCategoryChange);

  // Événement pour le profil utilisateur
  elements.userProfile.addEventListener("click", handleUserProfileClick);

  // Délégation d'événements pour les boutons dynamiques
  elements.mainContainer.addEventListener("click", (e) => {
    // Boutons de l'admin
    if (e.target.id === "loginButton") handleLogin();
    if (e.target.id === "addProductButton") handleAddProduct();
    if (e.target.id === "editProductButton") handleEditProduct();
    if (e.target.id === "deleteProductButton") handleDeleteProduct();
    if (e.target.id === "saveProductButton") handleSaveProduct(e);
    if (e.target.id === "cancelProductButton") handleCancelAddProduct();
    if (e.target.id === "cancelEditProductButton") handleCancelEditProduct();
    if (e.target.id === "cancelDeleteProductButton")
      handleCancelDeleteProduct();
    if (e.target.id === "backToShopButton") handleBackToShop();

    // Boutons de modification/suppression de produits
    if (e.target.classList.contains("edit-product-btn")) {
      const productId = parseInt(e.target.dataset.productId);
      handleEditSpecificProduct(productId);
    }

    if (e.target.classList.contains("delete-product-btn")) {
      const productId = parseInt(e.target.dataset.productId);
      handleDeleteSpecificProduct(productId);
    }

    // Boutons d'ajout au panier
    if (e.target.classList.contains("add-to-cart-btn")) {
      const productId = parseInt(e.target.dataset.productId);
      handleAddToCart(productId);
    }
  });

  // Événement pour les boutons de suppression du panier
  elements.cartElement.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("remove-from-cart-btn") ||
      e.target.closest(".remove-from-cart-btn")
    ) {
      const button = e.target.closest(".remove-from-cart-btn");
      const productIndex = parseInt(button.dataset.productIndex);
      handleRemoveFromCart(productIndex);
    }

    // Événement pour les boutons d'augmentation de quantité
    if (
      e.target.classList.contains("increase-quantity-btn") ||
      e.target.closest(".increase-quantity-btn")
    ) {
      const button = e.target.closest(".increase-quantity-btn");
      const productIndex = parseInt(button.dataset.productIndex);
      handleIncreaseQuantity(productIndex);
    }

    // Événement pour les boutons de diminution de quantité
    if (
      e.target.classList.contains("decrease-quantity-btn") ||
      e.target.closest(".decrease-quantity-btn")
    ) {
      const button = e.target.closest(".decrease-quantity-btn");
      const productIndex = parseInt(button.dataset.productIndex);
      handleDecreaseQuantity(productIndex);
    }
  });
}

// 10. Handlers d'événements
function handleCategoryChange(event) {
  const selectedCategoryId = parseInt(event.target.value);
  const allProducts = JSON.parse(localStorage.getItem("shop_products"));

  const filteredProducts =
    selectedCategoryId === 0
      ? allProducts
      : allProducts.filter(
          (product) => product.categorie_id === selectedCategoryId,
        );

  renderProducts(filteredProducts);
}

function handleUserProfileClick() {
  if (confirm("Redirection vers la page d'administration ?")) {
    renderLoginView();
  }
}

function handleLogin() {
  // Dans une vraie application, on vérifierait les credentials
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Pour l'exemple, on accepte n'importe quel login
  if (username && password) {
    renderAdminView();
  } else {
    toastMessage("Erreur", "Veuillez remplir tous les champs");
  }
}

function handleAddProduct() {
  renderAddProductView();
}

function handleEditProduct() {
  renderEditProductView();
}

function handleDeleteProduct() {
  renderDeleteProductView();
}

function handleSaveProduct(e) {
  e.preventDefault();

  // Récupérer les valeurs du formulaire
  const productName = document.getElementById("productName").value;
  const productPrice = parseFloat(
    document.getElementById("productPrice").value,
  );
  const productImage = document.getElementById("productImage").value;
  const productCategory = parseInt(
    document.getElementById("productCategory").value,
  );

  // Validation
  if (!productName || !productPrice || !productImage || !productCategory) {
    toastMessage("Erreur", "Veuillez remplir tous les champs");
    return;
  }

  // Créer un nouvel ID (le plus grand ID existant + 1)
  const maxId = state.products.reduce(
    (max, product) => Math.max(max, product.id),
    0,
  );
  const newProductId = maxId + 1;

  // Créer le nouveau produit
  const newProduct = {
    id: newProductId,
    nom: productName,
    prix: productPrice,
    image: productImage,
    categorie_id: productCategory,
  };

  // Ajouter à l'état et au localStorage
  state.products.push(newProduct);
  localStorage.setItem("shop_products", JSON.stringify(state.products));

  // Retour à la vue admin
  toastMessage("Succès", "Produit ajouté avec succès !");
  renderAdminView();
}

function handleCancelAddProduct() {
  renderAdminView();
}

function handleCancelEditProduct() {
  renderAdminView();
}

function handleCancelDeleteProduct() {
  renderAdminView();
}

function handleBackToShop() {
  renderShopView();
}

function handleEditSpecificProduct(productId) {
  // Trouver le produit
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;

  // Afficher le formulaire de modification (similaire à l'ajout mais avec les valeurs pré-remplies)
  clearPage();
  state.currentView = "edit-product-form";

  elements.mainContainer.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center vh-75" style="width: 100%; max-width: 500px; margin: 0 auto;">
      <h2 class="mb-4">Modifier le produit</h2>
      <form id="editProductForm" class="w-100 px-4">
        <input type="hidden" id="editProductId" value="${product.id}">
        <div class="mb-3">
          <input type="text" id="editProductName" placeholder="Nom du produit" class="form-control" value="${product.nom}" required>
        </div>
        <div class="mb-3">
          <input type="number" id="editProductPrice" placeholder="Prix du produit" class="form-control" step="0.01" min="0" value="${product.prix}" required>
        </div>
        <div class="mb-3">
          <input type="text" id="editProductImage" placeholder="URL de l'image" class="form-control" value="${product.image}" required>
        </div>
        <div class="mb-3">
          <select id="editProductCategory" class="form-select" required>
            <option value="" disabled>Sélectionner une catégorie</option>
          </select>
        </div>
        <div class="d-flex gap-2">
          <button id="updateProductButton" type="submit" class="btn btn-dark flex-grow-1">Mettre à jour</button>
          <button id="cancelEditProductFormButton" type="button" class="btn btn-outline-secondary flex-grow-1">Annuler</button>
        </div>
      </form>
    </div>
  `;

  // Remplir le sélecteur de catégories et sélectionner la bonne catégorie
  const categorySelect = document.getElementById("editProductCategory");
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.nom;
    if (category.id === product.categorie_id) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });
}

function handleDeleteSpecificProduct(productId) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
    // Filtrer le produit à supprimer
    state.products = state.products.filter((p) => p.id !== productId);
    localStorage.setItem("shop_products", JSON.stringify(state.products));

    toastMessage("Succès", "Produit supprimé avec succès !");
    renderDeleteProductView(); // Rafraîchir la vue
  }
}

function handleAddToCart(productId) {
  const product = state.products.find((p) => p.id === productId);
  if (product) {
    // Vérifier si le produit existe déjà dans le panier
    const existingItem = state.shoppingCart.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem) {
      // Si le produit existe, augmenter la quantité
      existingItem.quantity += 1;
      toastMessage("Succès", `Quantité de ${product.nom} augmentée.`);
    } else {
      // Sinon, ajouter le produit avec une quantité de 1
      state.shoppingCart.push({ product: product, quantity: 1 });
      toastMessage("Succès", `${product.nom} a été ajouté au panier.`);
    }

    updateShoppingCart();
  }
}

function handleCartItemElement(product, quantity, index) {
  const item = document.createElement("div");
  item.className = "cart-item d-flex flex-column mb-3 p-3 border rounded";
  item.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h6 class="mb-0">${product.nom}</h6>
        <small class="text-muted">€${product.prix} x ${quantity} = €${(product.prix * quantity).toFixed(2)}</small>
      </div>
      <button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-product-index="${index}">
        <i class="ph ph-trash"></i>
      </button>
    </div>
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary decrease-quantity-btn" data-product-index="${index}">-</button>
      <span class="quantity-display">${quantity}</span>
      <button class="btn btn-sm btn-outline-secondary increase-quantity-btn" data-product-index="${index}">+</button>
    </div>
  `;
  return item;
}

// 10.7 Fonction pour supprimer un élément du panier
function handleRemoveFromCart(productIndex) {
  if (confirm("Êtes-vous sûr de vouloir retirer ce produit du panier ?")) {
    state.shoppingCart.splice(productIndex, 1);
    updateShoppingCart();
    toastMessage("Succès", "Produit retiré du panier.");
  }
}

// 10.8 Fonction pour augmenter la quantité d'un produit
function handleIncreaseQuantity(productIndex) {
  state.shoppingCart[productIndex].quantity += 1;
  updateShoppingCart();
  toastMessage("Succès", "Quantité augmentée.");
}

// 10.9 Fonction pour diminuer la quantité d'un produit
function handleDecreaseQuantity(productIndex) {
  if (state.shoppingCart[productIndex].quantity > 1) {
    state.shoppingCart[productIndex].quantity -= 1;
    updateShoppingCart();
    toastMessage("Succès", "Quantité diminuée.");
  } else {
    // Si la quantité est 1, proposer de supprimer l'article
    if (confirm("Voulez-vous supprimer cet article du panier ?")) {
      handleRemoveFromCart(productIndex);
    }
  }
}

// Fonction pour afficher un message toast Bootstrap
function toastMessage(title, message) {
  const toast = document.getElementById("liveToast");
  const toastTitle = document.getElementById("toastTitle");
  const toastBody = document.getElementById("toastBody");

  toastTitle.textContent = title;
  toastBody.textContent = message;

  // Ajouter la classe correspondante au type de toast
  toast.className = "toast";
  toast.classList.add("align-items-center", "text-bg-dark", "border-0");

  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// 10.5 Fonction pour mettre à jour le panier
function updateShoppingCart() {
  // Effacer le contenu actuel du panier
  elements.cartElement.innerHTML = "";

  // Vérifier si le panier est vide
  if (state.shoppingCart.length === 0) {
    elements.cartElement.innerHTML =
      '<p class="text-center text-muted">Votre panier est vide</p>';
    return;
  }

  // Calculer le total
  let total = 0;

  state.shoppingCart.forEach((cartItem, index) => {
    const product = cartItem.product;
    const quantity = cartItem.quantity;
    const itemElement = handleCartItemElement(product, quantity, index);
    elements.cartElement.appendChild(itemElement);
    total += product.prix * quantity;
  });

  // Ajouter le total
  const totalElement = document.createElement("div");
  totalElement.className =
    "mt-3 pt-2 border-top d-flex justify-content-between align-items-center";
  totalElement.innerHTML = `
    <strong>Total:</strong>
    <strong>€${total.toFixed(2)}</strong>
  `;
  elements.cartElement.appendChild(totalElement);

  // Ajouter un bouton de fake paiement
  const checkoutButton = document.createElement("button");
  checkoutButton.className = "btn btn-dark btn-lg mt-3 w-100";
  checkoutButton.textContent = "Passer à la caisse";
  checkoutButton.addEventListener("click", () => {
    toastMessage("Succès", "Fonction de paiement non implémentée.");
    mainContainer.innerHTML = `
      <div class="position-absolute top-0 start-0 w-100 h-100">
        <img src="/assets/bsod.png" alt="Blue Screen of Death" class="w-100 vh-100 object-fit-cover"/>
      </div>
    `;
    state.shoppingCart = [];
    state.shoppingCart = [];
    updateShoppingCart();
  });
  elements.cartElement.appendChild(checkoutButton);

  // Ajouter un bouton pour vider le panier
  const clearCartButton = document.createElement("button");
  clearCartButton.className = "btn btn-sm btn-outline-secondary mt-3 w-100";
  clearCartButton.textContent = "Vider le panier";
  clearCartButton.addEventListener("click", () => {
    if (confirm("Êtes-vous sûr de vouloir vider le panier ?")) {
      state.shoppingCart = [];
      updateShoppingCart();
      toastMessage("Succès", "Le panier a été vidé.");
    }
  });
  elements.cartElement.appendChild(clearCartButton);

  // Mettre à jour le badge du panier
  updateCartBadge();
}

// 10.6 Fonction pour mettre à jour le badge du panier
function updateCartBadge() {
  const count = state.shoppingCart.length;
  if (count > 0) {
    elements.cartBadge.textContent = count;
    elements.cartBadge.classList.add(
      "bg-dark",
      "text-white",
      "fs-6",
      "luckiest-guy-regular",
    );
    elements.cartBadge.style.display = "inline-block";
  } else {
    elements.cartBadge.style.display = "none";
  }
}

// 11. Démarrage de l'application
init();
