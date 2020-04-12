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

function createListItem(i, source, target, isEnabled) {
  let checkState = isEnabled ? "checked" : "";
  let classOverride = isEnabled ? "" : "is-outlined";

  $(
    "#list"
  )[0].innerHTML += `<div class="field has-addons has-addons-centered r-field">
                                <p class="control">
                                  <a class="button is-small is-fullwidth is-outlined" title="Enable/Disable">
                                    <input id="is-enabled-${i}" class="action-enable is-small" type="checkbox" data-source="${source}" ${checkState}  title="Enable/Disable">
                                  </a>
                                </p>
                                <p class="control is-expanded">
                                  <a class="button is-small is-static is-fullwidth" title="Source">${source}</a>
                                </p>
                                <p class="control">
                                  <input id="target-${i}" class="input is-small" type="text" value="${target}"  title="Target">
                                </p>
                                <p class="control">
                                  <a class="button is-small is-primary ${classOverride} action-save" data-source="${source}" data-target-element-id="target-${i}"  title="Save">
                                    <span class="icon is-small">
                                      ✔
                                    </span>
                                  </a>
                                </p>
                                <p class="control">
                                  <a class="button is-small is-danger ${classOverride} action-del" data-source="${source}" title="Remove">
                                    <span class="icon is-small">
                                      ✘
                                    </span>
                                  </a>
                                </p>
                              </div>`;
}

$("#add-button").hide();
$("#add-button").click(function () {
  $("#add-fields").toggle();
  $("#add-fields input").val("");
});

browser.runtime.getBackgroundPage().then(
  function (page) {
    if (page.Redirects.length) {
      $("#empty-msg").hide();
      $("#add-fields").hide();
      $("#add-button").show();
      // Populate all redirects
      for (const [i, r] of page.Redirects.entries()) {
        createListItem(i, r.source, r.target, r.isEnabled);
      }
    }

    // Set click and enter key handler for add confirm action
    let handleAddConfirm = function () {
      let source = $(`#${$(this).data("source-element-id")}`).val();
      let target = $(`#${$(this).data("target-element-id")}`).val();
      if (source !== "" && target !== "") {
        page.setRedirect(source, target);
        location.reload();
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
      page.updateRedirect(source, target);
    });

    // Set click handlers for del action
    $("a.action-del").click(function () {
      let source = $(this).data("source");
      page.unsetRedirect(source);
      location.reload();
    });

    // Set click handlers for enable/disable checkbox
    $("input.action-enable").change(function () {
      let source = $(this).data("source");
      this.checked ? page.enableRedirect(source) : page.disableRedirect(source);
      location.reload();
    });
  },
  function () {
    console.log("Loading failed.");
  }
);
