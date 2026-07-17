document.addEventListener("DOMContentLoaded", () => {
  // === UI УПРАВЛЕНИЕ DRAWER ===
  const authBtn = document.querySelector(".actions__item--profile");
  const overlay = document.getElementById("authOverlay");
  const drawer = document.getElementById("authDrawer");
  const closeBtn = document.getElementById("closeAuthBtn");
  const tabs = document.querySelectorAll(".auth-tabs__btn");
  const forms = document.querySelectorAll(".auth-form");

  // Открыть Drawer
  if (authBtn) {
    authBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (localStorage.getItem("currentUser")) {
        window.location.href = "profile.html";
      } else if (overlay) {
        overlay.classList.add("is-active");
      }
    });
  }

  // Закрыть Drawer (если элементы существуют на странице)
  if (overlay && closeBtn) {
    const closeDrawer = () => overlay.classList.remove("is-active");
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDrawer();
    });
  }

  // Переключение табов
  if (tabs.length > 0 && forms.length > 0) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        forms.forEach((f) => f.classList.remove("active"));

        tab.classList.add("active");
        const targetForm = document.getElementById(tab.dataset.target);
        if (targetForm) targetForm.classList.add("active");
      });
    });
  }

  // === ЛОГИКА МОК-АВТОРИЗАЦИИ ===
  const mockUsers = {
    b2b: { type: "B2B", inn: "7700000000", name: "ООО «ОптТоргСтрой»" },
    b2c: { type: "B2C", email: "test@mail.ru", name: "Алексей Иванов" },
  };

  const b2bForm = document.getElementById("form-b2b");
  const b2cForm = document.getElementById("form-b2c");

  // B2B Сабмит (через ИНН)
  if (b2bForm) {
    b2bForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const innInput = document.getElementById("inn");
      const innVal = innInput ? innInput.value.trim() : "";

      if (innVal === mockUsers.b2b.inn) {
        localStorage.setItem("currentUser", JSON.stringify(mockUsers.b2b));
        alert(`Успешный вход! Добро пожаловать, ${mockUsers.b2b.name}`);
        window.location.href = "profile.html";
      } else {
        alert("ИНН не найден. Введите 7700000000 для теста.");
      }
    });
  }

  // B2C Сабмит (Обычный)
  if (b2cForm) {
    b2cForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("email");
      const emailVal = emailInput ? emailInput.value.trim() : "";

      if (emailVal === mockUsers.b2c.email) {
        localStorage.setItem("currentUser", JSON.stringify(mockUsers.b2c));
        alert(`Успешный вход! Добро пожаловать, ${mockUsers.b2c.name}`);
        window.location.href = "profile.html";
      } else {
        alert("Пользователь не найден. Введите test@mail.ru для теста.");
      }
    });
  }

  // Логика выхода (на странице профиля)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }
});
