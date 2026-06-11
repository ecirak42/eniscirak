(function () {
  var params = new URLSearchParams(window.location.search);

  if (params.get("registered") !== "1" || window.__enisWorkshopConfirmationTracked) return;
  window.__enisWorkshopConfirmationTracked = true;

  function trackConfirmation() {
    if (typeof fbq === "function") {
      fbq("track", "CompleteRegistration");
    }

    if (typeof gtag === "function") {
      gtag("event", "workshop_registration_confirmed", {
        event_category: "lead",
        event_label: params.get("variant") || "workshop"
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackConfirmation);
  } else {
    trackConfirmation();
  }
})();
