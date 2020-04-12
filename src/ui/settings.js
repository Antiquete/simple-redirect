/** @format */

// Copyright (C) 2020 Hari Saksena <hari.mail@protonmail.ch>
//
// This file is part of Simple Redirect.
//
// Simple Redirect is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Simple Redirect is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Simple Redirect.  If not, see <http://www.gnu.org/licenses/>.

require("bulma");
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
