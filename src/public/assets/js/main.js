(function initializeSite(global, document) {
  "use strict";

  const queryAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const query = (selector, root = document) => root.querySelector(selector);

  const insuranceDetails = Object.freeze({
    auto: {
      title: "Seguro Auto",
      image: "./assets/images/insurance-auto.jpg",
      description: "Proteção para o seu veículo e suporte para seguir em frente quando um imprevisto acontecer.",
      features: ["Colisão, roubo e furto", "Danos causados a terceiros", "Assistência 24 horas, carro reserva e vidros."],
      imageDescription: "Automóvel protegido em uma rua tranquila",
    },
    home: {
      title: "Seguro Residencial",
      image: "./assets/images/insurance-home.jpg",
      description: "Segurança para a estrutura da sua casa, seus bens e situações inesperadas da rotina.",
      features: ["Incêndio, raio e explosão", "Roubo ou furto de bens", "Assistências elétrica, hidráulica e chaveiro"],
      imageDescription: "Residência contemporânea protegida",
    },
    life: {
      title: "Seguro de Vida",
      image: "./assets/images/insurance-life.jpg",
      description: "Cuidado financeiro para você e para as pessoas que fazem parte dos seus planos.",
      features: ["Proteção financeira para beneficiários", "Coberturas por invalidez ou doenças graves", "Assistências que podem ser usadas em vida"],
      imageDescription: "Família reunida em um momento de tranquilidade",
    },
    business: {
      title: "Seguro Empresarial",
      image: "./assets/images/insurance-business.jpg",
      description: "Coberturas para preservar a operação, o patrimônio e a continuidade do seu negócio.",
      features: ["Incêndio, danos elétricos e eventos naturais", "Proteção de equipamentos e mercadorias", "Responsabilidade civil e assistência empresarial"],
      imageDescription: "Empreendedora em seu ambiente de trabalho",
    },
  });

  function configureWhatsAppLink(link, messageKey) {
    const config = global.MacSegurosConfig;
    const message = config?.whatsappMessages[messageKey];
    const phone = document.body.dataset.whatsappPhone;

    if (!link || !message || !phone) return;

    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function initializeWhatsAppLinks() {
    queryAll("[data-whatsapp]").forEach((link) => {
      configureWhatsAppLink(link, link.dataset.whatsapp);
    });
  }

  function initializeInsuranceModal() {
    const modal = query("#insurance-modal");
    const closeButton = query(".insurance-modal-close", modal);
    const image = query("[data-modal-image]", modal);
    const title = query("[data-modal-title]", modal);
    const description = query("[data-modal-description]", modal);
    const features = query("[data-modal-features]", modal);
    const whatsappLink = query("[data-modal-whatsapp]", modal);
    const cursorDot = query(".cursor-dot");
    let lastTrigger = null;

    if (!modal || !closeButton || !image || !title || !description || !features || !whatsappLink) return;

    queryAll("[data-insurance]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const insuranceKey = trigger.dataset.insurance;
        const details = insuranceDetails[insuranceKey];

        if (!details) return;

        lastTrigger = trigger;
        title.textContent = details.title;
        description.textContent = details.description;
        image.src = details.image;
        image.alt = details.imageDescription;
        features.replaceChildren(...details.features.map((feature) => {
          const item = document.createElement("li");
          item.textContent = feature;
          return item;
        }));
        configureWhatsAppLink(whatsappLink, insuranceKey);

        if (cursorDot) modal.append(cursorDot);
        modal.showModal();
        document.body.classList.add("modal-open");
      });
    });

    closeButton.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      if (cursorDot) document.body.append(cursorDot);
      lastTrigger?.focus();
    });
  }

  function initializeFooter() {
    const year = query("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function initializeNavigation() {
    const toggle = query(".nav-toggle");
    const navigation = query("nav");

    if (!toggle || !navigation) return;

    const closeMenu = () => {
      navigation.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    };

    toggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });

    queryAll("a", navigation).forEach((link) => link.addEventListener("click", closeMenu));
  }

  function initializeFaq() {
    const items = queryAll(".faq-item");

    items.forEach((item) => {
      const button = query("button", item);
      if (!button) return;

      button.addEventListener("click", () => {
        const shouldOpen = !item.classList.contains("open");

        items.forEach((currentItem) => {
          currentItem.classList.remove("open");
          query("button", currentItem)?.setAttribute("aria-expanded", "false");
        });

        if (shouldOpen) {
          item.classList.add("open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initializeRevealAnimations() {
    const elements = queryAll(".reveal");

    if (!("IntersectionObserver" in global)) {
      elements.forEach((element) => element.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
  }

  function initializePartnersCarousel() {
    const track = query(".partners-track");
    const partnerSet = query(".partners-set", track);

    if (!track || !partnerSet || track.children.length > 1) return;

    const duplicateSet = partnerSet.cloneNode(true);
    duplicateSet.setAttribute("aria-hidden", "true");
    queryAll("img", duplicateSet).forEach((logo) => logo.alt = "");
    track.append(duplicateSet);
  }

  function initializeCustomCursor() {
    const hasFinePointer = global.matchMedia("(pointer:fine)").matches;
    const prefersReducedMotion = global.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const dot = query(".cursor-dot");

    if (!hasFinePointer || prefersReducedMotion || !dot) return;

    let currentX = -30;
    let currentY = -30;
    let targetX = -30;
    let targetY = -30;

    document.body.classList.add("custom-cursor");
    global.addEventListener("mousemove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.classList.add("visible");
    });
    document.addEventListener("mouseleave", () => dot.classList.remove("visible"));

    queryAll("a,button").forEach((element) => {
      element.addEventListener("mouseenter", () => dot.classList.add("active"));
      element.addEventListener("mouseleave", () => dot.classList.remove("active"));
    });

    const followPointer = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      dot.style.transform = `translate3d(${currentX - dot.offsetWidth / 2}px,${currentY - dot.offsetHeight / 2}px,0)`;
      global.requestAnimationFrame(followPointer);
    };

    followPointer();
  }

  initializeWhatsAppLinks();
  initializeInsuranceModal();
  initializeFooter();
  initializeNavigation();
  initializeFaq();
  initializeRevealAnimations();
  initializePartnersCarousel();
  initializeCustomCursor();
})(window, document);
