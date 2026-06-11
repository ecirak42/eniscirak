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
      "You are on the list. Check your email to confirm your spot. If you do not see it, check spam or promotions.",
      true
    );
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
