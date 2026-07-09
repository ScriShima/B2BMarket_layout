document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // БЛОК 1: БАЗЫ ДАННЫХ И СОСТОЯНИЕ (Mock Data & State)
  // =========================================================

  // Данные для каталога
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
    return {
      id: i + 1,
      sku: `ART-${1000 + i}`,
      name: `${categoryNames[cat]} "B2B Premium"`,
      price: Math.floor(Math.random() * 400) + 50,
      pack: i % 2 === 0 ? 20 : 12,
      category: cat,
      image: images[i % 3],
    };
  });

  // Данные для промо-баннеров
  const promoData = [
    {
      badge: "Новинка",
      title: "Таежная малина",
      desc: "Специализированный продукт",
      profit: "Маржинальность 60%",
      img: "src/Marmalade_banner.png",
      thumb: "src/Marmalade_banner.png",
    },
    {
      badge: "Хит",
      title: "Горький шоколад 72%",
      desc: "Без сахара, на стевии",
      profit: "Маржинальность 55%",
      img: "src/Chocolate_banner.jpg",
      thumb: "src/Chocolate_banner.jpg",
    },
    {
      badge: "Акция",
      title: "Протеиновые батончики",
      desc: "Идеально для фитнес-клубов",
      profit: "Скидка 15% на объем",
      img: "src/Protein_banner.png",
      thumb: "src/Protein_banner.png",
    },
    {
      badge: "Подарок",
      title: "Набор ассорти",
      desc: "Пастила и мармелад без сахара в эко-упаковке",
      profit: "Высокий спрос в праздники",
      img: "src/sweet_gift.jpg",
      thumb: "src/sweet_gift.jpg",
    },
  ];

  // Глобальное состояние
  let currentPage = 1;
  const itemsPerPage = 12;
  let currentView = localStorage.getItem("catalog-view") || "grid";
  let currentPromoIndex = 0;
  let promoInterval;

  // =========================================================
  // БЛОК 2: КАТАЛОГ И КАРТОЧКИ ТОВАРОВ (Рендер и Пагинация)
  // =========================================================

  const productsList = document.getElementById("products-list");
  const paginationContainer = document.getElementById("pagination-container");
  const itemsCountEl = document.getElementById("items-count");
  if (itemsCountEl) itemsCountEl.textContent = products.length;

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
        <div class="product-card__pack">Квант: коробка (${product.pack} шт) = ${product.price * product.pack} ₽</div>
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
    if (!productsList) return;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    productsList.innerHTML = paginatedProducts.map(createProductRow).join("");
    renderPagination();
    attachBuyEvents();
  }

  function renderPagination() {
    if (!paginationContainer) return;
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

  // Переключение вида (Сетка / Таблица)
  const btnGrid = document.getElementById("btn-grid");
  const btnTable = document.getElementById("btn-table");

  function applyView(view) {
    currentView = view;
    localStorage.setItem("catalog-view", view);
    if (view === "table") {
      productsList.classList.replace("products--grid", "products--list");
      if (btnTable) btnTable.classList.add("view-toggles__btn--active");
      if (btnGrid) btnGrid.classList.remove("view-toggles__btn--active");
    } else {
      productsList.classList.replace("products--list", "products--grid");
      if (btnGrid) btnGrid.classList.add("view-toggles__btn--active");
      if (btnTable) btnTable.classList.remove("view-toggles__btn--active");
    }
  }

  if (btnGrid && btnTable) {
    btnGrid.addEventListener("click", () => applyView("grid"));
    btnTable.addEventListener("click", () => applyView("table"));
  }

  if (productsList) {
    applyView(currentView);
    renderCatalog();
  }

  // =========================================================
  // БЛОК 3: КОРЗИНА И ВЗАИМОДЕЙСТВИЕ С ТОВАРОМ
  // =========================================================

  function attachBuyEvents() {
    document.querySelectorAll(".quantity").forEach((counter) => {
      const input = counter.querySelector(".quantity__input");
      counter
        .querySelector(".quantity__btn--plus")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          input.value = parseInt(input.value) + 1;
        });
      counter
        .querySelector(".quantity__btn--minus")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          if (parseInt(input.value) > 1)
            input.value = parseInt(input.value) - 1;
        });
    });

    document.querySelectorAll(".btn--add").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const originalText = this.textContent;
        this.textContent = "Добавлено ✓";
        this.style.background = "var(--color-primary-hover)";
        setTimeout(() => {
          this.textContent = originalText;
          this.style.background = "";
        }, 1500);
      });
    });

    document.querySelectorAll(".product-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".product-card__actions"))
          window.location.href = "product.html";
      });
    });
  }

  // =========================================================
  // БЛОК 4: ШАПКА И ПОВЕДЕНИЕ МАКЕТА (Scroll & Layout)
  // =========================================================

  const header = document.querySelector(".header");
  let lastScrollY = window.scrollY;

  function updateHeaderOffset() {
    if (header)
      document.documentElement.style.setProperty(
        "--header-offset",
        `${header.offsetHeight}px`,
      );
  }

  updateHeaderOffset();
  window.addEventListener("resize", updateHeaderOffset);

  window.addEventListener("scroll", () => {
    if (window.scrollY === 0) {
      header.classList.remove("header--hidden", "header--scrolled");
      return;
    }
    if (window.scrollY > lastScrollY && window.scrollY > 150) {
      header.classList.add("header--hidden", "header--scrolled");
    } else if (window.scrollY < lastScrollY) {
      header.classList.remove("header--hidden");
      header.classList.add("header--scrolled");
    }
    lastScrollY = window.scrollY;
  });

  // =========================================================
  // БЛОК 5: ЛОГИКА БАННЕРОВ (Слайдер, миниатюры, плавающие)
  // =========================================================

  function renderBanners() {
    const data = promoData[currentPromoIndex];

    // Split
    const splitImg = document.querySelector(".promo-split__img");
    if (splitImg) splitImg.src = data.img;
    const splitBadge = document.querySelector(
      ".promo-split__content .promo-badge",
    );
    if (splitBadge) splitBadge.textContent = data.badge;
    const splitTitle = document.querySelector(".promo-split__content h3");
    if (splitTitle) splitTitle.textContent = data.title;
    const splitDesc = document.querySelector(".promo-split__content p");
    if (splitDesc) splitDesc.textContent = data.desc;

    // Floating
    const floatImg = document.querySelector(".promo-floating__img");
    if (floatImg) floatImg.src = data.thumb;
    const floatBadge = document.querySelector(".promo-floating .promo-badge");
    if (floatBadge) floatBadge.textContent = data.badge;
    const floatTitle = document.querySelector(".promo-floating__info h4");
    if (floatTitle) floatTitle.textContent = data.title;
    const floatProfit = document.querySelector(".promo-floating__info p");
    if (floatProfit) floatProfit.textContent = data.profit;

    // Large
    const largeImg = document.querySelector(".promo-large__img");
    if (largeImg) largeImg.src = data.img;

    // Update active states
    document
      .querySelectorAll(".promo-thumb")
      .forEach((t, i) => t.classList.toggle("active", i === currentPromoIndex));
    document
      .querySelectorAll(".promo-large__dot")
      .forEach((d, i) => d.classList.toggle("active", i === currentPromoIndex));
  }

  const thumbContainer = document.querySelector(".promo-thumbnails");
  const largePagination = document.querySelector(".promo-large__pagination");

  if (thumbContainer) {
    thumbContainer.innerHTML = promoData
      .map(
        (promo, index) => `
      <div class="promo-thumb ${index === 0 ? "active" : ""}" data-index="${index}">
        <img src="${promo.thumb}" alt="Превью ${index + 1}">
      </div>`,
      )
      .join("");
  }

  if (largePagination) {
    largePagination.innerHTML = promoData
      .map(
        (_, index) => `
      <div class="promo-large__dot ${index === 0 ? "active" : ""}" data-index="${index}"></div>
    `,
      )
      .join("");
  }

  document.querySelectorAll(".promo-thumb, .promo-large__dot").forEach((el) => {
    el.addEventListener("click", function () {
      currentPromoIndex = parseInt(this.getAttribute("data-index"));
      renderBanners();
      resetInterval();
    });
  });

  function startPromoInterval() {
    promoInterval = setInterval(() => {
      currentPromoIndex = (currentPromoIndex + 1) % promoData.length;
      renderBanners();
    }, 5000);
  }

  function resetInterval() {
    clearInterval(promoInterval);
    startPromoInterval();
  }

  if (document.querySelector(".promo-container")) {
    renderBanners();
    startPromoInterval();
  }

  // =========================================================
  // БЛОК 6: МОДАЛЬНАЯ ВИТРИНА (Аккордеон)
  // =========================================================

  const modal = document.getElementById("promo-modal");
  const openBtn = document.getElementById("open-promo-modal");
  const closeBtn = document.getElementById("close-promo-modal");
  const accordionContainer = document.getElementById("promo-accordion");

  if (modal && openBtn && closeBtn && accordionContainer) {
    accordionContainer.innerHTML = promoData
      .map(
        (promo, index) => `
      <div class="promo-accordion__item ${index === 0 ? "active" : ""}">
        <div class="promo-accordion__img-wrapper"><img src="${promo.img}" alt="${promo.title}"></div>
        <div class="promo-accordion__content">
          <span class="promo-badge">${promo.badge}</span>
          <h3>${promo.title}</h3>
          <div class="promo-accordion__profit">${promo.profit}</div>
          <p>${promo.desc}</p>
          <button class="btn btn--primary">В каталог &rarr;</button>
        </div>
      </div>
    `,
      )
      .join("");

    openBtn.addEventListener("click", () => {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });

    const accordionItems = document.querySelectorAll(".promo-accordion__item");
    accordionItems.forEach((item) => {
      item.addEventListener("click", function () {
        accordionItems.forEach((el) => el.classList.remove("active"));
        this.classList.add("active");
      });
    });
  }

  // =========================================================
  // БЛОК 7: UI КОНФИГУРАТОР И ТЕМЫ (Настройки)
  // =========================================================

  const htmlElement = document.documentElement;
  const configPanel = document.getElementById("ui-configurator");
  const themeSelect = document.getElementById("theme-select");
  const bannerModeSelect = document.getElementById("banner-mode-select");
  const heroVisual = document.getElementById("hero-visual");
  const catModeSelect = document.getElementById("category-mode-select");
  const categoriesSection = document.getElementById("categories-section");

  // Управление темами
  const savedTheme = localStorage.getItem("b2b-theme") || "default";
  if (savedTheme !== "default")
    htmlElement.setAttribute("data-theme", savedTheme);

  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      if (selectedTheme === "default") {
        htmlElement.removeAttribute("data-theme");
      } else {
        htmlElement.setAttribute("data-theme", selectedTheme);
      }
      localStorage.setItem("b2b-theme", selectedTheme);
    });
  }

  // Хоткей Ctrl + B для конфигуратора
  document.addEventListener("keydown", (e) => {
    if (
      e.ctrlKey &&
      (e.key === "b" || e.key === "B" || e.key === "и" || e.key === "И")
    ) {
      e.preventDefault();
      if (configPanel) configPanel.classList.toggle("is-open");
    }
  });

  // Управление режимами баннеров
  if (bannerModeSelect && heroVisual) {
    bannerModeSelect.addEventListener("change", (e) => {
      heroVisual.setAttribute("data-banner-mode", e.target.value);
    });
  }

  // Управление режимами категорий
  if (catModeSelect && categoriesSection) {
    catModeSelect.addEventListener("change", (e) => {
      categoriesSection.setAttribute("data-category-mode", e.target.value);
    });
  }

  if (catModeSelect && categoriesSection) {
    catModeSelect.addEventListener("change", (e) => {
      categoriesSection.setAttribute("data-category-mode", e.target.value);
    });
  }

  const bestsellerModeSelect = document.getElementById(
    "bestseller-mode-select",
  );
  const bestsellersSection = document.getElementById("bestsellers-section");

  if (bestsellerModeSelect && bestsellersSection) {
    bestsellerModeSelect.addEventListener("change", (e) => {
      bestsellersSection.setAttribute("data-bestseller-mode", e.target.value);
    });
  }
});
