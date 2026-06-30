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

  const productsList = document.getElementById("products-list");
  const paginationContainer = document.getElementById("pagination-container");

  // Обновляем счетчик товаров
  document.getElementById("items-count").textContent = products.length;

  // 3. Генерация HTML карточки (Используем новые БЭМ-классы)
  function createProductRow(product) {
    const isVegan = product.id % 3 === 0;
    const isHighProtein = product.id % 5 === 0;

    let tagsHtml = '<span class="product-badge">Без сахара</span>';
    if (isVegan) tagsHtml += '<span class="product-badge">Веган</span>';
    if (isHighProtein)
      tagsHtml += '<span class="product-badge">Высокий протеин</span>';

    return `
      <div class="product-card">
        <div class="product-card__img-wrapper">
          <div class="product-card__badges">${tagsHtml}</div>
          <img src="${product.image}" alt="${product.name}" class="product-card__img">
        </div>
        
        <div class="product-card__sku">Арт: ${product.sku}</div>
        
        <h4 class="product-card__title">${product.name}, 100 г</h4>
        
        <div class="product-card__pack">
          Квант: коробка (${product.pack} шт) = ${product.price * product.pack} ₽
        </div>

        <div class="product-card__price-row">
          <span class="product-card__price-val">${product.price} ₽</span>
          <span class="product-card__price-unit">/ шт</span>
        </div>
        
        <div class="product-card__actions">
          <div class="quantity">
            <button type="button" class="quantity__btn quantity__btn--minus">−</button>
            <input type="number" class="quantity__input" value="1" min="1" readonly>
            <button type="button" class="quantity__btn quantity__btn--plus">+</button>
          </div>
          <button type="button" class="btn btn--primary btn--add" data-id="${product.id}">В заявку</button>
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

  // 4. Пагинация (обновлены классы)
  function renderPagination() {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination__btn ${i === currentPage ? "pagination__btn--active" : ""}" data-page="${i}">${i}</button>`;
    }
    paginationContainer.innerHTML = html;

    document.querySelectorAll(".pagination__btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentPage = parseInt(this.getAttribute("data-page"));
        renderCatalog();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // 5. Переключение вида (Сетка / Таблица) - меняем классы у #products-list напрямую
  const btnGrid = document.getElementById("btn-grid");
  const btnTable = document.getElementById("btn-table");

  function applyView(view) {
    currentView = view;
    localStorage.setItem("catalog-view", view);

    if (view === "table") {
      productsList.classList.remove("products--grid");
      productsList.classList.add("products--list");
      btnTable.classList.add("view-toggles__btn--active");
      btnGrid.classList.remove("view-toggles__btn--active");
    } else {
      productsList.classList.remove("products--list");
      productsList.classList.add("products--grid");
      btnGrid.classList.add("view-toggles__btn--active");
      btnTable.classList.remove("view-toggles__btn--active");
    }
  }

  if (btnGrid && btnTable) {
    btnGrid.addEventListener("click", () => applyView("grid"));
    btnTable.addEventListener("click", () => applyView("table"));
  }

  applyView(currentView);
  renderCatalog();

  // 6. Логика счетчиков и кнопок (исправлены селекторы и добавлены stopPropagation)
  function attachBuyEvents() {
    // Работа плюса и минуса
    document.querySelectorAll(".quantity").forEach((counter) => {
      const btnMinus = counter.querySelector(".quantity__btn--minus");
      const btnPlus = counter.querySelector(".quantity__btn--plus");
      const input = counter.querySelector(".quantity__input");

      btnPlus.addEventListener("click", (e) => {
        e.stopPropagation(); // Чтобы клик не открывал карточку
        input.value = parseInt(input.value) + 1;
      });

      btnMinus.addEventListener("click", (e) => {
        e.stopPropagation();
        let val = parseInt(input.value);
        if (val > 1) {
          input.value = val - 1;
        }
      });
    });

    // Клик по кнопке "В заявку"
    document.querySelectorAll(".btn--add").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation(); // Чтобы клик не открывал карточку

        const qty = this.closest(".product-card__actions").querySelector(
          ".quantity__input",
        ).value;
        const id = this.getAttribute("data-id");

        // Визуальный эффект при добавлении (теперь используем CSS-переменную)
        const originalText = this.textContent;
        this.textContent = "Добавлено ✓";
        this.style.background = "var(--color-primary-hover)";

        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = ""; // Возвращаем класс по умолчанию
        }, 1500);

        console.log(`Товар ID: ${id}, Количество: ${qty}`);
      });
    });

    // Открытие карточки
    document.querySelectorAll(".product-card").forEach((card) => {
      card.style.cursor = "pointer";

      card.addEventListener("click", function (e) {
        // Проверяем, не был ли клик внутри блока с кнопками
        if (e.target.closest(".product-card__actions")) {
          return;
        }

        window.location.href = "product.html";
      });
    });
  }
});
