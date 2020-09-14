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

Rule = function (
  source,
  target,
  isRegex,
  isDeepRecurse = false,
  isEnabled = true,
  shouldNotify = true,
  headerConvert = 0
) {
  this.source = source;
  this.target = target;
  this.isEnabled = isEnabled;
  this.isRegex = isRegex;
  this.isDeepRecurse = isDeepRecurse;
  this.shouldNotify = shouldNotify;
  this.headerConvert = headerConvert;
};

var Redirects = [];

// Keep notifications and deep redirects enabled by default
var allowNotifications = true;
var allowDeepRedirects = true;
browser.storage.local.get().then(function (value) {
  if (Array.isArray(value.redirects)) Redirects = value.redirects;

  // Disable notifications and deep redirects only in case of a false value set
  if (value.disableNotificatons === true) allowNotifications = false;
  if (value.disableDeepRedirection === true) allowDeepRedirects = false;
});

function saveRedirects() {
  browser.storage.local.set({ redirects: Redirects });
}

function updateRedirect(
  source,
  target,
  isRegex = null,
  isDeepRecurse = null,
  isEnabled = null,
  shouldNotify = null,
  headerConvert = null
) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source == source) {
      r.target = target;
      if (isRegex !== null) r.isRegex = isRegex;
      if (isDeepRecurse !== null) r.isDeepRecurse = isDeepRecurse;
      if (isEnabled !== null) r.isEnabled = isEnabled;
      if (shouldNotify !== null) r.shouldNotify = shouldNotify;
      if (headerConvert !== null) r.headerConvert = headerConvert;
    }
  }
  saveRedirects();
}

function enableRedirect(source) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source == source) {
      r.isEnabled = true;
    }
  }
  saveRedirects();
}

function disableRedirect(source) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source == source) {
      r.isEnabled = false;
    }
  }
  saveRedirects();
}

function setRedirect(source, target, isRegex = false) {
  Redirects.push(new Rule(source, target, isRegex));
  saveRedirects();
}

function unsetRedirect(source) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source === source) {
      Redirects.splice(i, 1);
    }
  }
  saveRedirects();
}

function sendNotification(message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: browser.extension.getURL("icons/icon.svg.png"),
    title: "Simple Redirect",
    message: message,
  });
}

function redirect(e) {
  if ((e.originUrl || "").indexOf("moz-extension://") === 0) return e;

  // Loop through all redirect rules
  for (const [i, r] of Redirects.entries()) {
    if (!r.isEnabled) continue; // Skip if not enabled
    if (!r.isRegex && !e.url.includes(r.source)) continue; // Skip if redirect type is simple and url doesn't contain source
    if (r.isRegex && !new RegExp(r.source).test(e.url)) continue; // Skip if redirect type is regex and url doesn't pass regex test

    // Avoid infinite loops in case of target includes source
    if (r.target.includes(r.source) && e.url.includes(r.target)) continue; // Skip if target includes source and target is already in url (Change source to target only one time)

    // Start handling requests

    // Check for request type
    if (e.type !== "main_frame") {
      if (!allowDeepRedirects) continue; // Skip if deep redirects turned off globally
      if (!r.isDeepRecurse) continue; // Skip if deep redirects turned off for this redirect
    }

    // Handle request
    e.redirectUrl = e.url.replace(new RegExp(r.source, "gi"), r.target);

    // Handle header conversion
    if (r.headerConvert == 1) {
      console.log("e.method :>> ", e.method);
      if (e.method == "POST") {
        qi = new URLSearchParams(e.requestBody.formData);
        e.redirectUrl = e.redirectUrl + "?" + qi.toString();
      }
    } else if (r.headerConvert == 2) {
      //- FIXME: No way to currently change requestBody POST or GET method in onBeforeRequest
      //- https://bugzilla.mozilla.org/show_bug.cgi?id=1376155
      console.log(
        "Not immplemented yet: ttps://bugzilla.mozilla.org/show_bug.cgi?id=1376155"
      );
    }

    // Send notification if allowed globally and is allowed for this rule
    if (allowNotifications)
      if (r.shouldNotify) sendNotification(`"${e.url}" ➜ "${e.redirectUrl}"`);

    console.log(`Changing Request From: ${e.url} To: ${e.redirectUrl}`);
    break;
  }

  // Return modified/non-modified details;
  return e;
}

const filters = { urls: ["<all_urls>"] };

browser.webRequest.onBeforeRequest.addListener(redirect, filters, [
  "blocking",
  "requestBody",
]);
// -- Message Handling

function requestHandler(request, sender, sendResponse) {
  switch (request.type) {
    case "getRedirects":
      sendResponse({ Redirects: Redirects });
      break;
    case "setRedirect":
      setRedirect(request.source, request.target);
      break;
    case "unsetRedirect":
      unsetRedirect(request.source);
      break;
    case "enableRedirect":
      enableRedirect(request.source);
      break;
    case "disableRedirect":
      disableRedirect(request.source);
      break;
    case "updateRedirect":
      updateRedirect(
        request.source,
        request.target,
        request.isRegex,
        request.isDeepRecurse,
        request.isEnabled,
        request.shouldNotify,
        request.headerConvert
      );
      break;
    case "setAllowNotifications":
      allowNotifications = request.state;
      break;
    case "setAllowDeepRedirects":
      allowDeepRedirects = request.state;
      break;
  }
}
browser.runtime.onMessage.addListener(requestHandler);
