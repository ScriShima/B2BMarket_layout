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
        
        <div class="price-row">
          <span class="price">${product.price} ₽</span>
          <span class="opt-label d-none-in-table">
            Опт 
           <svg class="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17V11" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
              <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill="#1C274C"></circle>
              <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path>
          </svg>
          </span>
        </div>
        
        <h4 class="product-name">${product.name}</h4>
        
        <div class="pack d-none-in-grid">В кор. ${product.pack} шт.</div>
        
        <div class="card-footer">
          <button class="btn-buy" data-id="${product.id}">В корзину</button>
          
          <div class="qty-counter d-none">
            <button class="btn-minus">−</button>
            <input type="number" class="qty-input" value="1" min="1" readonly />
            <button class="btn-plus">+</button>
          </div>
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
    // 1. Клик по кнопке "В корзину"
    document.querySelectorAll(".btn-buy").forEach((btn) => {
      btn.addEventListener("click", function () {
        const footer = this.closest(".card-footer");
        this.classList.add("d-none");
        footer.querySelector(".qty-counter").classList.remove("d-none");
      });
    });

    // 2. Работа плюса и минуса
    document.querySelectorAll(".qty-counter").forEach((counter) => {
      const btnMinus = counter.querySelector(".btn-minus");
      const btnPlus = counter.querySelector(".btn-plus");
      const input = counter.querySelector(".qty-input");

      btnPlus.addEventListener("click", () => {
        input.value = parseInt(input.value) + 1;
      });

      btnMinus.addEventListener("click", () => {
        let val = parseInt(input.value);
        if (val > 1) {
          input.value = val - 1;
        } else {
          counter.classList.add("d-none");
          counter
            .closest(".card-footer")
            .querySelector(".btn-buy")
            .classList.remove("d-none");
          input.value = 1;
        }
      });
    });

    // 3. Логика МОДАЛЬНОГО ОКНА "Условия опта"
    const modal = document.getElementById("opt-modal");
    if (modal) {
      const closeBtn = document.getElementById("modal-close-btn");
      const overlay = modal.querySelector(".modal-overlay");

      // Открытие: ищем все бейджики "Опт" на странице
      document.querySelectorAll(".opt-label").forEach((label) => {
        label.addEventListener("click", () => {
          modal.classList.remove("d-none");
        });
      });

      // Закрытие по крестику
      closeBtn.addEventListener("click", () => modal.classList.add("d-none"));

      // Закрытие по клику на темный фон вокруг окна
      overlay.addEventListener("click", () => modal.classList.add("d-none"));
    }
  }

  // --- УМНЫЙ ОТСТУП ДЛЯ ФИКСИРОВАННОЙ ШАПКИ ---

  const header = document.querySelector(".b2b-header");

  function updateHeaderHeight() {
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`,
      );
    }
  }

  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);
});
