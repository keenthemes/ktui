"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckboxHandler = createCheckboxHandler;
var event_handler_1 = require("../../helpers/event-handler");
// Main function to create checkbox logic for a datatable instance
function createCheckboxHandler(element, config, fireEvent) {
    var _a;
    var headerChecked = false;
    var headerCheckElement = null;
    var targetElements = null;
    // Default: preserve selection across all pages
    var preserveSelection = ((_a = config.checkbox) === null || _a === void 0 ? void 0 : _a.preserveSelection) !== false;
    // Helper: get selectedRows from state, always as string[]
    function getSelectedRows() {
        if (!config._state)
            config._state = {};
        if (!Array.isArray(config._state.selectedRows))
            config._state.selectedRows = [];
        return config._state.selectedRows.map(String);
    }
    // Helper: set selectedRows in state
    function setSelectedRows(rows) {
        if (!config._state)
            config._state = {};
        config._state.selectedRows = Array.from(new Set(rows.map(String)));
    }
    // Helper: get all visible row IDs (values)
    function getVisibleRowIds() {
        if (!targetElements)
            return [];
        return Array.from(targetElements)
            .map(function (el) { return el.value; })
            .filter(function (v) { return v != null && v !== ''; });
    }
    // Listener for header checkbox
    var checkboxListener = function (event) {
        checkboxToggle(event);
    };
    function init() {
        headerCheckElement = element.querySelector(config.attributes.check);
        if (!headerCheckElement)
            return;
        headerChecked = headerCheckElement.checked;
        targetElements = element.querySelectorAll(config.attributes.checkbox);
        checkboxHandler();
        reapplyCheckedStates();
        updateHeaderCheckboxState();
    }
    function checkboxHandler() {
        if (!headerCheckElement)
            return;
        headerCheckElement.addEventListener('click', checkboxListener);
        event_handler_1.default.on(document.body, config.attributes.checkbox, 'input', function (event) {
            handleRowCheckboxChange(event);
        });
    }
    // When a row checkbox is changed
    function handleRowCheckboxChange(event) {
        var input = event.target;
        if (!input)
            return;
        var value = input.value;
        var selectedRows = getSelectedRows();
        if (input.checked) {
            if (!selectedRows.includes(value))
                selectedRows.push(value);
        }
        else {
            selectedRows = selectedRows.filter(function (v) { return v !== value; });
        }
        setSelectedRows(selectedRows);
        updateHeaderCheckboxState();
        fireEvent('changed');
    }
    // When the header checkbox is toggled
    function checkboxToggle(event) {
        var checked = !isChecked();
        var eventType = checked ? 'checked' : 'unchecked';
        fireEvent(eventType);
        change(checked);
    }
    // Change all visible checkboxes and update selectedRows
    function change(checked) {
        var payload = { cancel: false };
        fireEvent('change', payload);
        if (payload.cancel === true)
            return;
        headerChecked = checked;
        if (headerCheckElement)
            headerCheckElement.checked = checked;
        if (targetElements) {
            var visibleIds_1 = getVisibleRowIds();
            var selectedRows = getSelectedRows();
            if (checked) {
                // Add all visible IDs to selectedRows
                selectedRows = preserveSelection
                    ? Array.from(new Set(__spreadArray(__spreadArray([], selectedRows, true), visibleIds_1, true)))
                    : visibleIds_1;
            }
            else {
                // Remove all visible IDs from selectedRows
                selectedRows = preserveSelection
                    ? selectedRows.filter(function (v) { return !visibleIds_1.includes(v); })
                    : [];
            }
            setSelectedRows(selectedRows);
            // Update visible checkboxes
            targetElements.forEach(function (element) {
                if (element) {
                    element.checked = checked;
                }
            });
        }
        updateHeaderCheckboxState();
        fireEvent('changed');
    }
    // Reapply checked state to visible checkboxes based on selectedRows
    function reapplyCheckedStates() {
        var selectedRows = getSelectedRows();
        if (!targetElements)
            return;
        targetElements.forEach(function (element) {
            var _a;
            if (!element)
                return;
            var value = element.value;
            element.checked = selectedRows.includes(value);
            // Update row class
            var row = element.closest('tr');
            if (row && ((_a = config.checkbox) === null || _a === void 0 ? void 0 : _a.checkedClass)) {
                if (element.checked) {
                    row.classList.add(config.checkbox.checkedClass);
                }
                else {
                    row.classList.remove(config.checkbox.checkedClass);
                }
            }
        });
    }
    // Update header checkbox state (checked/indeterminate/unchecked)
    function updateHeaderCheckboxState() {
        if (!headerCheckElement || !targetElements)
            return;
        var total = targetElements.length;
        var checked = 0;
        for (var i = 0; i < total; i++) {
            if (targetElements[i].checked)
                checked++;
        }
        if (checked === 0) {
            headerCheckElement.indeterminate = false;
            headerCheckElement.checked = false;
            headerChecked = false;
        }
        else if (checked > 0 && checked < total) {
            headerCheckElement.indeterminate = true;
            headerCheckElement.checked = false;
            headerChecked = false;
        }
        else if (checked === total) {
            headerCheckElement.indeterminate = false;
            headerCheckElement.checked = true;
            headerChecked = true;
        }
    }
    // Fix: isChecked() implementation
    function isChecked() {
        return headerChecked;
    }
    function getChecked() {
        return getSelectedRows();
    }
    function check() {
        change(true);
        reapplyCheckedStates();
        updateHeaderCheckboxState();
    }
    function uncheck() {
        change(false);
        reapplyCheckedStates();
        updateHeaderCheckboxState();
    }
    function toggle() {
        checkboxToggle();
        reapplyCheckedStates();
        updateHeaderCheckboxState();
    }
    function updateState() {
        // Called after redraw/pagination
        targetElements = element.querySelectorAll(config.attributes.checkbox);
        reapplyCheckedStates();
        updateHeaderCheckboxState();
    }
    return {
        init: init,
        check: check,
        uncheck: uncheck,
        toggle: toggle,
        isChecked: isChecked,
        getChecked: getChecked,
        updateState: updateState,
    };
}
//# sourceMappingURL=datatable-checkbox.js.map