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

import "./common";

function refresh() {
  location.reload();
}

function goBack() {
  window.location = "popup.html";
}

function sendMessageAndReload(message) {
  browser.runtime.sendMessage(message).then(goBack, refresh);
}

browser.runtime.sendMessage({ type: "getRedirects" }).then(function (response) {
  let source = new URLSearchParams(window.location.search).get("source");

  let Redir;
  for (const [i, r] of response.Redirects.entries()) {
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
  if (Redir.shouldNotify) $("#check-notify").prop("checked", true);
  if (Redir.headerConvert !== 0)
    $("#select-convert-type option[value=" + Redir.headerConvert + "]").attr(
      "selected",
      "selected"
    );

  $("#save-button").click(function () {
    let target = $("#input-target").val();
    let isEnabled = $("#check-enabled").prop("checked");
    let isRegex = $("#check-regex").prop("checked");
    let isDeepRecurse = $("#check-deep-recurse").prop("checked");
    let shouldNotify = $("#check-notify").prop("checked");
    let headerConvert = $("#select-convert-type").find(":selected").val();
    sendMessageAndReload({
      type: "updateRedirect",
      source: source,
      target: target,
      isRegex: isRegex,
      isDeepRecurse: isDeepRecurse,
      isEnabled: isEnabled,
      shouldNotify: shouldNotify,
      headerConvert: headerConvert,
    });
  });
  $("#del-button").click(function () {
    sendMessageAndReload({ type: "unsetRedirect", source: source });
  });
  $("#cancel-button").click(function () {
    goBack();
  });
  $("#check-advanced").click(function () {
    if ($(this).is(":checked")) {
      $("section#advanced-options").removeClass("is-hidden");
    } else {
      $("section#advanced-options").addClass("is-hidden");
    }
  });
});
