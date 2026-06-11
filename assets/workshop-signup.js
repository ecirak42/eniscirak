(function () {
  var FORM_ACTION = "https://assets.mailerlite.com/jsonp/2426159/forms/189992583080969954/subscribe";
  var submitted = false;

  function getNextWorkshopDate() {
    if (window.WorkshopSchedule && typeof window.WorkshopSchedule.getNextWorkshop === "function") {
      return window.WorkshopSchedule.getNextWorkshop().longDate;
    }

    return "";
  }

  function createHidden(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  }

  function setHidden(form, name, value) {
    var input = form.querySelector("input[name='" + name + "']");
    if (!input) {
      input = createHidden(name, "");
      form.appendChild(input);
    }

    input.value = value || "";
  }

  function getParam(params, key) {
    return params.get(key) || "";
  }

  function addAttribution(form) {
    var params = new URLSearchParams(window.location.search);
    var variant = window.location.pathname.indexOf("panic-loop-workshop-b") !== -1 ? "letter" : "primary";

    setHidden(form, "fields[utm_source]", getParam(params, "utm_source"));
    setHidden(form, "fields[utm_medium]", getParam(params, "utm_medium"));
    setHidden(form, "fields[utm_campaign]", getParam(params, "utm_campaign"));
    setHidden(form, "fields[utm_content]", getParam(params, "utm_content"));
    setHidden(form, "fields[utm_term]", getParam(params, "utm_term"));
    setHidden(form, "fields[landing_page]", window.location.href);
    setHidden(form, "fields[page_variant]", variant);
    setHidden(form, "fields[referrer]", document.referrer);
  }

  function setStatus(form, message, isSuccess) {
    var status = form.querySelector("[data-signup-status]");
    if (!status) return;

    status.textContent = message;
    status.hidden = false;
    status.classList.toggle("is-success", Boolean(isSuccess));
  }

  function showSuccess(form) {
    submitted = true;
    form.classList.add("is-submitted");

    var button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = false;
      button.textContent = "Check Your Email";
    }

    setStatus(
      form,
      "You are registered. Check your email for the workshop details. If you do not see it, check spam or promotions.",
      true
    );

    if (form.dataset.metaLeadTracked !== "true" && typeof fbq === "function") {
      fbq("track", "Lead");
      form.dataset.metaLeadTracked = "true";
    }
  }

  function setupForm(form, index) {
    var frameName = "mailerlite-workshop-frame-" + index;
    var iframe = document.createElement("iframe");

    iframe.name = frameName;
    iframe.title = "Workshop signup confirmation";
    iframe.hidden = true;
    iframe.style.display = "none";
    form.after(iframe);

    form.action = FORM_ACTION;
    form.method = "post";
    form.target = frameName;
    addAttribution(form);

    if (!form.querySelector("input[name='ml-submit']")) {
      form.appendChild(createHidden("ml-submit", "1"));
    }

    if (!form.querySelector("input[name='anticsrf']")) {
      form.appendChild(createHidden("anticsrf", "true"));
    }

    form.addEventListener("submit", function () {
      var button = form.querySelector("button[type='submit']");
      if (button) {
        button.disabled = true;
        button.textContent = "Saving your spot...";
      }

      setStatus(form, "Saving your spot...", false);

      if (typeof gtag === "function") {
        gtag("event", "workshop_signup_submit", {
          event_category: "lead",
          event_label: getNextWorkshopDate() || "Panic Workshop"
        });
      }

      window.setTimeout(function () {
        showSuccess(form);
      }, 1400);
    });
  }

  function setupSignupLinks() {
    document.querySelectorAll("[data-signup-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (typeof gtag === "function") {
          gtag("event", "workshop_signup_click", {
            event_category: "engagement",
            event_label: link.textContent.trim()
          });
        }
      });
    });
  }

  function init() {
    document.querySelectorAll("[data-workshop-signup-form]").forEach(setupForm);
    setupSignupLinks();

    if (submitted) {
      document.querySelectorAll("[data-workshop-signup-form]").forEach(showSuccess);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
