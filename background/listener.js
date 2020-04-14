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
  isDeepRecurse = true,
  isEnabled = true
) {
  this.source = source;
  this.target = target;
  this.isRegex = isRegex;
  this.isDeepRecurse = isDeepRecurse;
  this.isEnabled = isEnabled;
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
  isEnabled = null
) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source == source) {
      r.target = target;
      if (isRegex !== null) r.isRegex = isRegex;
      if (isDeepRecurse !== null) r.isDeepRecurse = isDeepRecurse;
      if (isEnabled !== null) r.isEnabled = isEnabled;
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
    // Check if source exists inside url and is rule enabled
    if (e.url.includes(r.source) && r.isEnabled) {
      // Skip if target includes source and target is already in url (Change source to target only one time)
      // Avoid infinite loops in case of target includes source
      if (r.target.includes(r.source)) {
        if (e.url.includes(r.target)) continue;
      }

      // Handle background requests
      if (e.type !== "main_frame") {
        if (!allowDeepRedirects) continue; // Skip if deep redirects turned off gloabally
        if (!r.isDeepRecurse) continue; // Skip if deep redirects turned off for this redirect
      }

      // Set redirectUrl to target
      e.redirectUrl = e.url.replace(new RegExp(r.source, "gi"), r.target);
      if (allowNotifications)
        sendNotification(`"${e.url}" ➜ "${e.redirectUrl}"`);
      console.log(`Changing Request From: ${e.url} To: ${e.redirectUrl}`);
      break;
    }
  }

  // Return modified/non-modified details;
  return e;
}

const filters = { urls: ["<all_urls>"] };

browser.webRequest.onBeforeRequest.addListener(redirect, filters, ["blocking"]);
