/** @format */
import $ from "jquery";

browser.storage.local.get().then(function (value) {
  if (value.disableNotifications === true) {
    $("#input-notifications").removeProp("checked");
  }
  if (value.disableDeepRedirection === true) {
    $("#input-deep-redirection").removeProp("checked");
  }

  $("#input-notifications").change(function () {
    let state = this.checked;
    browser.storage.local.set({ disableNotifications: !state });
    browser.runtime.getBackgroundPage().then(function (page) {
      page.allowNotifications = state;
    });
  });
  $("#input-deep-redirection").change(function () {
    let state = this.checked;
    browser.storage.local.set({ disableDeepRedirection: !state });
    browser.runtime.getBackgroundPage().then(function (page) {
      page.allowDeepRedirects = state;
    });
  });
});
