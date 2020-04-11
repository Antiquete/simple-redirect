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

Rule = function (source, target, isRegex, isEnabled = true) {
  this.source = source;
  this.target = target;
  this.isRegex = isRegex;
  this.isEnabled = isEnabled;
};

var Redirects = [];
browser.storage.local.get().then(function (value) {
  if (Array.isArray(value.redirects)) Redirects = value.redirects;
});

function saveRedirects() {
  browser.storage.local.set({ redirects: Redirects });
}

function updateRedirect(source, target) {
  for (const [i, r] of Redirects.entries()) {
    if (r.source == source) {
      r.target = target;
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
    // Check if source exists inside url
    if (e.url.includes(r.source)) {
      // Set redirectUrl to target
      e.redirectUrl = e.url.replace(new RegExp(r.source, "gi"), r.target);
      sendNotification(`${e.url} -> Redirected to: ${e.redirectUrl}`);
      console.log(`Changing Request From: ${e.url} To: ${e.redirectUrl}`);
      break;
    }
  }

  // Return modified/non-modified details;
  return e;
}

const filters = { urls: ["<all_urls>"] };

browser.webRequest.onBeforeRequest.addListener(redirect, filters, ["blocking"]);
