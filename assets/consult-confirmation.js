(function () {
  var params = new URLSearchParams(window.location.search);

  if (params.get("scheduled") !== "1" || window.__enisConsultConfirmationTracked) return;
  window.__enisConsultConfirmationTracked = true;

  if (typeof fbq === "function") {
    fbq("track", "Schedule");
  }

  if (typeof gtag === "function") {
    gtag("event", "consult_call_scheduled", {
      event_category: "lead",
      event_label: "free_call"
    });
  }
})();
