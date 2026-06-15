(function () {
  var lookupIds = new WeakMap();

  function digits(value) {
    return (value || "").replace(/\D/g, "").slice(0, 5);
  }

  function mask(value) {
    var onlyDigits = digits(value);
    if (onlyDigits.length <= 3) return onlyDigits;
    return onlyDigits.slice(0, 3) + " " + onlyDigits.slice(3);
  }

  function formatZipForUrl(zip) {
    if (zip.length !== 5) return zip;
    return zip.slice(0, 3) + " " + zip.slice(3);
  }

  function modalFor(form) {
    if (!form) return null;
    var formId = form.id;
    if (formId) {
      var byId = document.getElementById(formId + "-service-modal");
      if (byId) return byId;
      var linked = document.querySelector(
        '[data-service-modal][data-modal-for="' + formId + '"]',
      );
      if (linked) return linked;
    }
    return form.querySelector("[data-service-modal]");
  }

  function formForModal(modal) {
    var formId = modal.getAttribute("data-modal-for");
    if (formId) return document.getElementById(formId);
    var parentForm = modal.closest("[data-booking-form]");
    return parentForm || null;
  }

  function selectionMode(form, modal) {
    if (form && form.dataset.selectionMode) return form.dataset.selectionMode;
    if (modal && modal.dataset.selectionMode) return modal.dataset.selectionMode;
    return "services";
  }

  function selectedService(form, modal) {
    if (selectionMode(form, modal) === "locations") {
      return (
        (form && form.dataset.fixedService) ||
        (modal && modal.dataset.fixedService) ||
        "stad"
      );
    }

    if (form && form.dataset.fixedService) return form.dataset.fixedService;

    var checked = modal.querySelector("[data-service-input]:checked");
    var first = modal.querySelector("[data-service-input]");
    return (checked || first || {}).value || "";
  }

  function selectedLocation(modal) {
    var checked = modal.querySelector("[data-location-input]:checked");
    var first = modal.querySelector("[data-location-input]");
    return (checked || first || {}).value || "";
  }

  function setHint(hint, text, isError) {
    if (!hint) return;
    hint.textContent = text;
    hint.className = isError
      ? "mt-4 text-xs leading-5 text-red-700"
      : "mt-4 text-xs leading-5 text-muted";
  }

  function setModalHint(modal, text) {
    if (!modal) return;
    var hint = modal.querySelector("[data-modal-hint]");
    if (!hint) return;

    if (!text) {
      hint.textContent = "";
      hint.classList.add("hidden");
      return;
    }

    hint.textContent = text;
    hint.classList.remove("hidden");
  }

  function placeFromLabel(label, masked) {
    if (!label || !masked) return "";
    if (label.indexOf(masked) !== 0) return "";
    return label.slice(masked.length).trim();
  }

  function storeResolvedPlace(form, place) {
    if (!form) return;
    if (place) form.dataset.resolvedPlace = place;
    else delete form.dataset.resolvedPlace;
  }

  function storeResolvedZip(form, zip) {
    if (!form) return;
    if (zip) form.dataset.resolvedZip = zip;
    else delete form.dataset.resolvedZip;
  }

  function getResolvedZip(form) {
    if (!form) return "";
    return form.dataset.resolvedZip || "";
  }

  function hasVerifiedPostal(form, zip) {
    return Boolean(zip && getResolvedZip(form) === zip && getResolvedPlace(form));
  }

  function getResolvedPlace(form) {
    if (!form) return "";
    if (form.dataset.resolvedPlace) return form.dataset.resolvedPlace;
    var formPlace = form.querySelector("[data-form-postal-place]");
    return formPlace ? formPlace.textContent.trim() : "";
  }

  function isPlaceLoading(form) {
    var loadingEl = form.querySelector("[data-form-postal-loading]");
    return Boolean(loadingEl && !loadingEl.classList.contains("hidden"));
  }

  function setSubmitState(form, state, masked) {
    var submit = form.querySelector("[data-submit-button]");
    var hint = form.querySelector("[data-postal-hint]");
    var modal = modalFor(form);
    var mode = selectionMode(form, modal);
    var readyLabel =
      mode === "locations"
        ? "Välj plats"
        : mode === "fixed"
          ? "Fortsätt"
          : "Välj tjänst";
    if (!submit) return;

    if (state === "idle") {
      submit.disabled = true;
      submit.textContent = "Fortsätt";
      setHint(hint, "Ange fem siffror - vi formaterar automatiskt till 123 45.", false);
      return;
    }

    if (state === "loading") {
      submit.disabled = true;
      submit.textContent = "Verifierar...";
      setHint(
        hint,
        "Hämtar ort för postnummer " + masked + "...",
        false,
      );
      return;
    }

    if (state === "ready") {
      submit.disabled = false;
      submit.textContent = readyLabel;
      setHint(
        hint,
        "Postnumret är verifierat. Klicka " + readyLabel + " för att fortsätta.",
        false,
      );
      return;
    }

    if (state === "error") {
      submit.disabled = true;
      submit.textContent = "Fortsätt";
      setHint(
        hint,
        "Kunde inte hitta orten för postnumret. Kontrollera och försök igen.",
        true,
      );
    }
  }

  function setModalPlace(modal, place, isLoading) {
    if (!modal) return;
    var placeEl = modal.querySelector("[data-modal-place]");
    var loadingEl = modal.querySelector("[data-modal-place-loading]");

    if (placeEl) placeEl.textContent = place || "";
    if (loadingEl) {
      if (isLoading && !place) loadingEl.classList.remove("hidden");
      else loadingEl.classList.add("hidden");
    }
  }

  function syncModalPlaceFromForm(form) {
    var modal = modalFor(form);
    if (!modal) return;
    var place = getResolvedPlace(form);
    setModalPlace(modal, place, isPlaceLoading(form) && !place);
    setModalHint(modal, "");
  }

  function setPostalPlace(form, masked, place, isLoading) {
    var input = form.querySelector("[data-postal-input]");
    var placeEl = form.querySelector("[data-form-postal-place]");
    var loadingEl = form.querySelector("[data-form-postal-loading]");

    storeResolvedPlace(form, place);

    if (placeEl) {
      if (place) {
        placeEl.textContent = place;
        placeEl.classList.remove("hidden");
      } else {
        placeEl.textContent = "";
        placeEl.classList.add("hidden");
      }
    }

    if (loadingEl) {
      if (isLoading) loadingEl.classList.remove("hidden");
      else loadingEl.classList.add("hidden");
    }

    if (input) {
      input.setAttribute(
        "aria-label",
        place ? "Postnummer " + masked + " " + place : "Postnummer",
      );
    }

    syncModalPlaceFromForm(form);
  }

  function portalModal(modal) {
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
  }

  function openModal(form) {
    var modal = modalFor(form);
    if (!modal) return;
    portalModal(modal);
    if (form.dataset.fixedService) {
      modal.dataset.fixedService = form.dataset.fixedService;
    }
    syncModalPlaceFromForm(form);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(form) {
    var modal = modalFor(form);
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector("[data-service-modal]:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }

  function continueBooking(form) {
    var modal = modalFor(form);
    var input = form.querySelector("[data-postal-input]");
    var hint = form.querySelector("[data-postal-hint]");
    var zip = digits(input ? input.value : "") || getResolvedZip(form);
    var place = getResolvedPlace(form);
    var isLocations = selectionMode(form, modal) === "locations";
    var service = selectedService(form, modal);
    var propertyType = isLocations ? selectedLocation(modal) : "";

    if (zip.length !== 5) {
      setHint(hint, "Ogiltigt postnummer. Ange fem siffror.", true);
      setModalHint(modal, "Ogiltigt postnummer. Ange fem siffror.");
      closeModal(form);
      return;
    }

    if (!place) {
      setHint(hint, "Vänta tills orten har verifierats.", true);
      setModalHint(modal, "Vänta tills orten har verifierats.");
      return;
    }

    if (isLocations) {
      if (!propertyType) {
        setHint(hint, "Välj plats för att fortsätta.", true);
        setModalHint(modal, "Välj plats för att fortsätta.");
        return;
      }
    } else if (!service) {
      setHint(hint, "Välj en tjänst för att fortsätta.", true);
      setModalHint(modal, "Välj en tjänst för att fortsätta.");
      return;
    }

    setModalHint(modal, "");
    var url =
      "/booking?" +
      "tjanst=" +
      encodeURIComponent(service) +
      "&postnummer=" +
      encodeURIComponent(formatZipForUrl(zip)) +
      "&kommun=" +
      encodeURIComponent(place);

    if (propertyType) {
      url += "&plats=" + encodeURIComponent(propertyType);
    }

    window.location.assign(url);
  }

  function resolvePlace(data, masked) {
    return (
      (data && data.place) ||
      placeFromLabel(data && data.label ? data.label : "", masked) ||
      ""
    );
  }

  function updateForm(form) {
    var input = form.querySelector("[data-postal-input]");
    var hint = form.querySelector("[data-postal-hint]");

    if (!input) return;

    function reset() {
      closeModal(form);
      setPostalPlace(form, "", "", false);
      storeResolvedZip(form, "");
      if (input) input.setAttribute("aria-label", "Postnummer");
      setSubmitState(form, "idle");
    }

    var masked = mask(input.value);
    if (input.value !== masked) input.value = masked;

    var zip = digits(masked);

    if (zip.length !== 5) {
      reset();
      return;
    }

    if (hasVerifiedPostal(form, zip)) {
      setPostalPlace(form, masked, getResolvedPlace(form), false);
      setSubmitState(form, "ready", masked);
      return;
    }

    setPostalPlace(form, masked, "", true);
    setSubmitState(form, "loading", masked);

    var currentLookup = (lookupIds.get(form) || 0) + 1;
    lookupIds.set(form, currentLookup);

    fetch("/api/postnummer?zip=" + encodeURIComponent(zip))
      .then(function (response) {
        if (!response.ok) throw new Error("lookup failed");
        return response.json();
      })
      .then(function (data) {
        if (lookupIds.get(form) !== currentLookup) return;

        var place = resolvePlace(data, masked);
        if (!place) throw new Error("place missing");

        storeResolvedZip(form, zip);
        setPostalPlace(form, masked, place, false);
        setSubmitState(form, "ready", masked);
      })
      .catch(function () {
        if (lookupIds.get(form) !== currentLookup) return;
        storeResolvedZip(form, "");
        setPostalPlace(form, masked, "", false);
        setSubmitState(form, "error", masked);
      });
  }

  function handleSubmit(form, event) {
    event.preventDefault();

    var input = form.querySelector("[data-postal-input]");
    var hint = form.querySelector("[data-postal-hint]");
    var zip = digits(input ? input.value : "");

    if (zip.length !== 5) {
      setHint(hint, "Ogiltigt postnummer. Ange fem siffror.", true);
      return;
    }

    if (isPlaceLoading(form) && !hasVerifiedPostal(form, zip)) {
      setHint(hint, "Vänta tills orten har verifierats.", true);
      return;
    }

    if (!getResolvedPlace(form)) {
      setHint(hint, "Kunde inte hitta orten för postnumret. Kontrollera och försök igen.", true);
      return;
    }

    var modal = modalFor(form);
    if (selectionMode(form, modal) === "fixed") {
      continueBooking(form);
      return;
    }

    openModal(form);
  }

  document.addEventListener(
    "input",
    function (event) {
      if (!event.target || !event.target.matches("[data-postal-input]")) return;
      var form = event.target.closest("[data-booking-form]");
      if (form) updateForm(form);
    },
    true,
  );

  document.addEventListener(
    "change",
    function (event) {
      if (!event.target || !event.target.matches("[data-postal-input]")) return;
      var form = event.target.closest("[data-booking-form]");
      if (form) updateForm(form);
    },
    true,
  );

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target && event.target.closest("[data-booking-form]");
      if (form) handleSubmit(form, event);
    },
    true,
  );

  document.addEventListener(
    "click",
    function (event) {
      var closeButton = event.target && event.target.closest("[data-modal-close]");
      if (closeButton) {
        var modal = closeButton.closest("[data-service-modal]");
        var closeForm = modal ? formForModal(modal) : null;
        if (closeForm) closeModal(closeForm);
        return;
      }

      var continueButton = event.target && event.target.closest("[data-modal-continue]");
      if (continueButton) {
        event.preventDefault();

        var continueModal = continueButton.closest("[data-service-modal]");
        var continueForm = continueModal ? formForModal(continueModal) : null;
        if (continueForm) continueBooking(continueForm);
      }
    },
    true,
  );

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-service-modal]:not(.hidden)").forEach(function (modal) {
      var form = formForModal(modal);
      if (form) closeModal(form);
    });
  });
})();
