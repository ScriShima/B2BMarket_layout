document.addEventListener("DOMContentLoaded", function () {
  // 1. ГЕНЕРАЦИЯ МОК-ДАННЫХ (50 товаров)
  const categories = ["chocolate", "pastila", "nuts"];
  const categoryNames = {
    chocolate: "Шоколад",
    pastila: "Пастила",
    nuts: "Драже/Орехи",
  };
  const images = [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&q=80",
  ];

  const products = Array.from({ length: 50 }, (_, i) => {
    const cat = categories[i % 3];
    const price = Math.floor(Math.random() * 400) + 50;
    const pack = i % 2 === 0 ? 20 : 12;
    return {
      id: i + 1,
      sku: `ART-${1000 + i}`,
      name: `${categoryNames[cat]} "B2B Premium" ${i + 1}`,
      price: price,
      pack: pack,
      totalPackPrice: price * pack,
      category: cat,
      image: images[i % 3],
    };
  });

  // 2. СОСТОЯНИЕ
  let currentPage = 1;
  const itemsPerPage = 12;
  // По умолчанию ставим grid-view
  let currentView = localStorage.getItem("catalog-view") || "grid";

  const container = document.getElementById("catalog-products");
  const productsList = document.getElementById("products-list");
  const paginationContainer = document.getElementById("pagination-container");
  const tableHeader = document.getElementById("table-header");

  // 3. ОТРИСОВКА
  function createProductRow(product) {
    return `
      <div class="card product-card">
        <div class="img-placeholder" style="background-image: url('${product.image}');"></div>
        <div class="sku">${product.sku}</div>
        <h4>${product.name}</h4>
        <div class="price">${product.price} ₽</div>
        <div class="pack">В кор. ${product.pack} шт. (${product.totalPackPrice} ₽)</div>
        <div class="qty-controls">
          <input type="number" value="1" min="1" title="Количество" />
          <button class="btn btn-small btn-add" data-id="${product.id}">В заявку</button>
        </div>
      </div>
    `;
  }

  function renderCatalog() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    productsList.innerHTML = paginatedProducts.map(createProductRow).join("");

    renderPagination();
    attachBuyEvents();
  }

  function renderPagination() {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="btn btn-outline btn-small page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    paginationContainer.innerHTML = html;

    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentPage = parseInt(this.getAttribute("data-page"));
        renderCatalog();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // 4. ПЕРЕКЛЮЧЕНИЕ ВИДА (Исправлено под grid-view)
  const btnGrid = document.getElementById("btn-grid");
  const btnTable = document.getElementById("btn-table");

  function applyView(view) {
    currentView = view;
    localStorage.setItem("catalog-view", view);

    if (view === "table") {
      container.classList.remove("grid-view");
      container.classList.add("table-view");
      if (tableHeader) tableHeader.style.display = "grid";
      btnTable.classList.add("active");
      btnGrid.classList.remove("active");
    } else {
      container.classList.remove("table-view");
      container.classList.add("grid-view");
      if (tableHeader) tableHeader.style.display = "none";
      btnGrid.classList.add("active");
      btnTable.classList.remove("active");
    }
  }

  if (btnGrid && btnTable) {
    btnGrid.addEventListener("click", () => applyView("grid"));
    btnTable.addEventListener("click", () => applyView("table"));
  }

  // Инициализация вида
  applyView(currentView);
  renderCatalog();

  function attachBuyEvents() {
    document.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", function () {
        const originalText = this.innerText;
        this.innerText = "✓";
        this.classList.add("success");
        setTimeout(() => {
          this.innerText = originalText;
          this.classList.remove("success");
        }, 1500);
      });
    });
  }
});
