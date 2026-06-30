document.addEventListener("DOMContentLoaded", function () {
  // 1. Мок-данные
  const categories = ["chocolate", "pastila", "nuts"];
  const categoryNames = {
    chocolate: "Шоколад",
    pastila: "Пастила",
    nuts: "Драже/Орехи",
  };
  const images = [
    "src/Chocolate.jpg",
    "src/marmalade.jpg",
    "src/nuts.jpg",
    "src/sweet_gift.jpg",
  ];

  const products = Array.from({ length: 50 }, (_, i) => {
    const cat = categories[i % 3];
    const price = Math.floor(Math.random() * 400) + 50;
    const pack = i % 2 === 0 ? 20 : 12;
    return {
      id: i + 1,
      sku: `ART-${1000 + i}`,
      name: `${categoryNames[cat]} "B2B Premium"`,
      price: price,
      pack: pack,
      category: cat,
      image: images[i % 3],
    };
  });

  // 2. Состояние
  let currentPage = 1;
  const itemsPerPage = 12;
  let currentView = localStorage.getItem("catalog-view") || "grid";

  const container = document.getElementById("catalog-products");
  const productsList = document.getElementById("products-list");
  const paginationContainer = document.getElementById("pagination-container");

  // Обновляем счетчик товаров
  document.getElementById("items-count").textContent = products.length;

  // 3. Генерация HTML карточки
  function createProductRow(product) {
    // Рандомные теги для вида
    const isVegan = product.id % 3 === 0;
    const isHighProtein = product.id % 5 === 0;

    let tagsHtml = '<span class="tag">Без сахара</span>';
    if (isVegan) tagsHtml += '<span class="tag dark">Веган</span>';
    if (isHighProtein)
      tagsHtml += '<span class="tag dark">Высокий протеин</span>';

    return `
      <div class="product-card">
        <div class="card-image-box" style="background-image: url('${product.image}');">
          <div class="card-tags">${tagsHtml}</div>
        </div>
        
        <div class="card-sku">Арт: ${product.sku}</div>
        
        <h4 class="card-title">${product.name}, 100 г</h4>
        
        <div class="card-price-row">
          <span class="card-price-val">${product.price} ₽</span>
          <span class="card-price-unit">/ шт</span>
        </div>
        
        <div class="card-pack-info">
          Квант: коробка (${product.pack} шт) = ${product.price * product.pack} ₽
        </div>
        
        <div class="card-actions">
          <div class="counter">
            <button type="button" class="btn-minus">−</button>
            <input type="number" class="qty-input" value="1" min="1" readonly>
            <button type="button" class="btn-plus">+</button>
          </div>
          <button type="button" class="btn-submit" data-id="${product.id}">В заявку</button>
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

  // 4. Пагинация
  function renderPagination() {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
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

  // 5. Переключение вида (Сетка / Таблица)
  const btnGrid = document.getElementById("btn-grid");
  const btnTable = document.getElementById("btn-table");

  function applyView(view) {
    currentView = view;
    localStorage.setItem("catalog-view", view);

    if (view === "table") {
      container.classList.remove("grid-view");
      container.classList.add("table-view");
      btnTable.classList.add("active");
      btnGrid.classList.remove("active");
    } else {
      container.classList.remove("table-view");
      container.classList.add("grid-view");
      btnGrid.classList.add("active");
      btnTable.classList.remove("active");
    }
  }

  if (btnGrid && btnTable) {
    btnGrid.addEventListener("click", () => applyView("grid"));
    btnTable.addEventListener("click", () => applyView("table"));
  }

  applyView(currentView);
  renderCatalog();

  // 6. Логика счетчиков и кнопок
  function attachBuyEvents() {
    // Работа плюса и минуса
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
        }
      });
    });

    // Клик по кнопке "В заявку"
    document.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", function () {
        const qty =
          this.closest(".card-footer").querySelector(".qty-input").value;
        const id = this.getAttribute("data-id");

        // Визуальный эффект при добавлении
        const originalText = this.textContent;
        this.textContent = "Добавлено ✓";
        this.style.background = "#1b5e20"; // Более темный зеленый

        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = ""; // Возвращаем класс по умолчанию
        }, 1500);

        console.log(`Товар ID: ${id}, Количество: ${qty}`);
      });
    });
  }

  document.querySelectorAll(".product-card").forEach((card) => {
    card.style.cursor = "pointer"; // Меняем курсор на "руку"

    card.addEventListener("click", function (e) {
      // Проверяем, не был ли клик внутри блока с кнопками
      if (e.target.closest(".card-actions")) {
        return; // Если кликнули на плюс, минус или "В заявку" — ничего не делаем
      }

      // В реальном проекте тут будет динамический URL, например:
      // window.location.href = `product.html?id=${this.querySelector('.btn-submit').dataset.id}`;

      // Для макета просто переходим на нашу новую страницу
      window.location.href = "product.html";
    });
  });
});
