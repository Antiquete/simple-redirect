/** @format */
import $ from "jquery";

browser.storage.local.get().then(function (value) {
  if (value.enableNotifications) {
    $("#input-notification").prop("checked", true);
  }
  if (value.enableDeepRedirection) {
    $("#input-deep-redirection").prop("checked", true);
  }

  $("#input-notification").change(function () {
    browser.storage.local.set({ enableNotifications: this.checked });
  });
  $("#input-deep-redirection").change(function () {
    browser.storage.local.set({ enableDeepRedirection: this.checked });
  });
});
