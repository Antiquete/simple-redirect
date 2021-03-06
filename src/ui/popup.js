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

function createListItem(
  i,
  source,
  target,
  isEnabled,
  isRegex = false,
  isDeepRedirect = false
) {
  let checkState = isEnabled ? "checked" : "";
  let classOverride = isEnabled ? "" : "is-outlined";
  let regexIcon = !isRegex
    ? ""
    : `<span class="icon is-small is-left" title="Regex">
        <i class="fas fa-code has-text-success"></i>
      </span>`;
  let deepRedirectIcon = !isDeepRedirect
    ? ""
    : `<span class="icon is-small is-right title="Deep Redirect">
        <i class="fas fa-code-branch has-text-info"></i>
      </span>`;

  let targetTip = `${source} -> ${target} Redirect`;
  targetTip += isRegex ? "\n[x] RegEx" : "";
  targetTip += isDeepRedirect ? "\n[x] Deep Redirect" : "";

  let list = $("#list");
  let content = $(`<div class="field has-addons has-addons-centered r-field">
                                <p class="control">
                                  <a class="button is-small is-fullwidth is-outlined" title="Enable/Disable">
                                    <input id="is-enabled-${i}" class="action-enable is-small" type="checkbox" data-source="${source}" ${checkState}  title="Enable/Disable">
                                  </a>
                                </p>
                                <p class="control is-expanded">
                                  <a class="button is-small is-static is-fullwidth" title="Source">${source}</a>
                                </p>
                                <p class="control has-icons-left has-icons-right">
                                  <input id="target-${i}" class="input is-small" type="text" value="${target}"  title="${targetTip}">
                                  ${deepRedirectIcon}
                                  ${regexIcon}
                                </p>
                                <p class="control">
                                  <a class="button is-small is-primary ${classOverride} action-save" data-source="${source}" data-target-element-id="target-${i}"  title="Save">
                                    <span class="icon is-small">
                                      <i class="fas fa-save"></i>
                                    </span>
                                  </a>
                                </p>
                                <p class="control">
                                  <a class="button is-small is-danger ${classOverride} action-del" data-source="${source}" title="Remove">
                                    <span class="icon is-small">
                                      <i class="fa fa-times"></i>
                                    </span>
                                  </a>
                                </p>
                                <p class="control">
                                  <a class="button is-small is-info ${classOverride} action-view" data-source="${source}" title="View">
                                    <span class="icon is-small">
                                      <i class="fa fa-arrow-right"></i>
                                    </span>
                                  </a>
                                </p>
                              </div>`);
  list.append(content);
}

$("#add-button").hide();
$("#add-button").click(function () {
  $("#add-fields").toggle();
  $("#add-fields input").val("");
});

function refresh() {
  location.reload();
}

function sendMessageAndReload(message) {
  browser.runtime.sendMessage(message).then(refresh, refresh);
}

browser.runtime.sendMessage({ type: "getRedirects" }).then(
  function (response) {
    if (response.Redirects.length) {
      $("#empty-msg").hide();
      $("#add-fields").hide();
      $("#add-button").show();
      // Populate all redirects
      for (const [i, r] of response.Redirects.entries()) {
        createListItem(
          i,
          r.source,
          r.target,
          r.isEnabled,
          r.isRegex,
          r.isDeepRecurse
        );
      }
    }

    // Set click and enter key handler for add confirm action
    let handleAddConfirm = function () {
      let source = $(`#${$(this).data("source-element-id")}`).val();
      let target = $(`#${$(this).data("target-element-id")}`).val();
      if (source !== "" && target !== "") {
        sendMessageAndReload({
          type: "setRedirect",
          source: source,
          target: target,
        });
      }
    };
    $("#add-fields-confirm").click(handleAddConfirm);
    $("#add-fields input[type='text']").keypress(function (e) {
      if (e.which == 13) handleAddConfirm.call($("#add-fields-confirm"));
    });

    // Set click handlers for save action
    $("a.action-save").click(function () {
      let source = $(this).data("source");
      let target = $(`#${$(this).data("target-element-id")}`).val();
      sendMessageAndReload({
        type: "updateRedirect",
        source: source,
        target: target,
      });
    });

    // Set click handlers for del action
    $("a.action-del").click(function () {
      let source = $(this).data("source");
      sendMessageAndReload({ type: "unsetRedirect", source: source });
    });

    // Set click handlers for enable/disable checkbox
    $("input.action-enable").change(function () {
      let source = $(this).data("source");
      this.checked
        ? sendMessageAndReload({ type: "enableRedirect", source: source })
        : sendMessageAndReload({ type: "disableRedirect", source: source });
    });

    // Set click handlers for view
    $(".action-view").click(function () {
      let source = $(this).data("source");
      window.location = `editor.html?source=${source}`;
    });
  },
  function () {
    console.log("Loading failed.");
  }
);
