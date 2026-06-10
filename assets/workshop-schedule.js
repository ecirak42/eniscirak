(function () {
  var TIME_ZONE = "America/Chicago";
  var EVENT_HOUR = 11;
  var EVENT_MINUTE = 0;
  var EVENT_DURATION_MINUTES = 90;
  var EASTERN_TIME_LABEL = "12 PM Eastern";
  var CENTRAL_TIME_LABEL = "11 AM Central";

  var WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTH_LONG = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  function getCentralParts(date) {
    var formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    });

    return formatter.formatToParts(date).reduce(function (parts, part) {
      if (part.type !== "literal") parts[part.type] = part.value;
      return parts;
    }, {});
  }

  function addDaysToCentralDate(parts, days) {
    var utcDate = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day) + days
    );
    var next = new Date(utcDate);

    return {
      year: next.getUTCFullYear(),
      month: next.getUTCMonth() + 1,
      day: next.getUTCDate(),
      weekday: next.getUTCDay()
    };
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function localTimeToUtc(year, month, day, hour, minute) {
    var utc = new Date(Date.UTC(year, month - 1, day, hour, minute));

    for (var i = 0; i < 3; i += 1) {
      var local = getCentralParts(utc);
      var localAsUtc = Date.UTC(
        Number(local.year),
        Number(local.month) - 1,
        Number(local.day),
        Number(local.hour),
        Number(local.minute)
      );
      var targetAsUtc = Date.UTC(year, month - 1, day, hour, minute);
      utc = new Date(utc.getTime() - (localAsUtc - targetAsUtc));
    }

    return utc;
  }

  function offsetForCentralDate(date) {
    var parts = getCentralParts(date);
    var localAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute)
    );
    var offsetMinutes = Math.round((localAsUtc - date.getTime()) / 60000);
    var sign = offsetMinutes >= 0 ? "+" : "-";
    var abs = Math.abs(offsetMinutes);

    return sign + pad(Math.floor(abs / 60)) + ":" + pad(abs % 60);
  }

  function getNextWorkshop(now) {
    var current = getCentralParts(now || new Date());
    var weekdayIndex = WEEKDAY_SHORT.indexOf(current.weekday);
    var currentMinutes = Number(current.hour) * 60 + Number(current.minute);
    var eventEndMinutes = (EVENT_HOUR * 60) + EVENT_MINUTE + EVENT_DURATION_MINUTES;
    var daysUntilSaturday = (6 - weekdayIndex + 7) % 7;

    if (weekdayIndex === 6 && currentMinutes >= eventEndMinutes) {
      daysUntilSaturday = 7;
    }

    var eventDate = addDaysToCentralDate(current, daysUntilSaturday);
    var startUtc = localTimeToUtc(
      eventDate.year,
      eventDate.month,
      eventDate.day,
      EVENT_HOUR,
      EVENT_MINUTE
    );
    var endUtc = new Date(startUtc.getTime() + EVENT_DURATION_MINUTES * 60000);
    var offset = offsetForCentralDate(startUtc);
    var datePrefix = eventDate.year + "-" + pad(eventDate.month) + "-" + pad(eventDate.day);

    return {
      year: eventDate.year,
      month: eventDate.month,
      day: eventDate.day,
      weekday: WEEKDAY_LONG[eventDate.weekday],
      longDate: WEEKDAY_LONG[eventDate.weekday] + ", " + MONTH_LONG[eventDate.month - 1] + " " + eventDate.day + ", " + eventDate.year,
      displayDate: WEEKDAY_LONG[eventDate.weekday] + ", " + MONTH_LONG[eventDate.month - 1] + " " + eventDate.day,
      shortDate: WEEKDAY_SHORT[eventDate.weekday] + ", " + MONTH_LONG[eventDate.month - 1] + " " + eventDate.day,
      time: CENTRAL_TIME_LABEL + " / " + EASTERN_TIME_LABEL,
      startDate: datePrefix + "T" + pad(EVENT_HOUR) + ":" + pad(EVENT_MINUTE) + ":00" + offset,
      endDate: datePrefix + "T12:30:00" + offset,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString()
    };
  }

  function applyDates(root, workshop) {
    var scope = root || document;
    var next = workshop || getNextWorkshop();

    scope.querySelectorAll("[data-workshop-date]").forEach(function (el) {
      el.textContent = next.longDate;
    });

    scope.querySelectorAll("[data-workshop-display-date]").forEach(function (el) {
      el.textContent = next.displayDate;
    });

    scope.querySelectorAll("[data-workshop-short-date]").forEach(function (el) {
      el.textContent = next.shortDate;
    });

    scope.querySelectorAll("[data-workshop-time]").forEach(function (el) {
      el.textContent = next.time;
    });

    scope.querySelectorAll("[data-workshop-datetime]").forEach(function (el) {
      el.setAttribute("datetime", next.startDate);
    });

    return next;
  }

  function updateEventSchema(workshop) {
    var schema = document.getElementById("workshop-event-schema");
    if (!schema) return;

    var next = workshop || getNextWorkshop();
    var data;

    try {
      data = JSON.parse(schema.textContent);
    } catch (error) {
      return;
    }

    data.startDate = next.startDate;
    data.endDate = next.endDate;
    data.name = "Panic Loop Workshop - " + next.longDate;
    schema.textContent = JSON.stringify(data);
  }

  function init() {
    var next = applyDates(document);
    updateEventSchema(next);
    window.dispatchEvent(new CustomEvent("workshop-date-updated", { detail: next }));
  }

  window.WorkshopSchedule = {
    applyDates: applyDates,
    getNextWorkshop: getNextWorkshop,
    updateEventSchema: updateEventSchema
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
