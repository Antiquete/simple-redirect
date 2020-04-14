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

import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";
import "bulma";
import $ from "jquery";

browser.runtime.getBackgroundPage().then(function (page) {
  let source = new URLSearchParams(window.location.search).get("source");

  let Redir;
  for (const [i, r] of page.Redirects.entries()) {
    if (r.source === source) {
      Redir = r;
      break;
    }
  }

  $("#input-source").val(Redir.source);
  $("#input-target").val(Redir.target);

  if (Redir.isEnabled) $("#check-enabled").prop("checked", true);
  if (Redir.isRegex) $("#check-regex").prop("checked", true);
  if (Redir.isDeepRecurse) $("#check-deep-recurse").prop("checked", true);

  $("#save-button").click(function () {
    let target = $("#input-target").val();
    let isRegex = $("#check-regex").prop("checked");
    let isDeepRecurse = $("#check-deep-recurse").prop("checked");
    let isEnabled = $("#check-enabled").prop("checked");
    page.updateRedirect(source, target, isRegex, isDeepRecurse, isEnabled);
    window.location = "popup.html";
  });
  $("#del-button").click(function () {
    page.unsetRedirect(source);
    window.location = "popup.html";
  });
  $("#cancel-button").click(function () {
    window.location = "popup.html";
  });
});
