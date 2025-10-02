"use strict";
/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSortHandler = createSortHandler;
function createSortHandler(config, theadElement, getState, setState, fireEvent, dispatchEvent, updateData) {
    // Helper to compare values for sorting
    function compareValues(a, b, sortOrder) {
        var aText = String(a).replace(/<[^>]*>|&nbsp;/g, '');
        var bText = String(b).replace(/<[^>]*>|&nbsp;/g, '');
        return aText > bText
            ? sortOrder === 'asc'
                ? 1
                : -1
            : aText < bText
                ? sortOrder === 'asc'
                    ? -1
                    : 1
                : 0;
    }
    function sortData(data, sortField, sortOrder) {
        return data.sort(function (a, b) {
            var aValue = a[sortField];
            var bValue = b[sortField];
            return compareValues(aValue, bValue, sortOrder);
        });
    }
    function toggleSortOrder(currentField, currentOrder, newField) {
        if (currentField === newField) {
            switch (currentOrder) {
                case 'asc':
                    return 'desc';
                case 'desc':
                    return '';
                default:
                    return 'asc';
            }
        }
        return 'asc';
    }
    function setSortIcon(sortField, sortOrder) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var sortClass = sortOrder
            ? sortOrder === 'asc'
                ? ((_b = (_a = config.sort) === null || _a === void 0 ? void 0 : _a.classes) === null || _b === void 0 ? void 0 : _b.asc) || ''
                : ((_d = (_c = config.sort) === null || _c === void 0 ? void 0 : _c.classes) === null || _d === void 0 ? void 0 : _d.desc) || ''
            : '';
        var th = typeof sortField === 'number'
            ? theadElement.querySelectorAll('th')[sortField]
            : theadElement.querySelector("th[data-kt-datatable-column=\"".concat(String(sortField), "\"], th[data-kt-datatable-column-sort=\"").concat(String(sortField), "\"]"));
        if (th) {
            var sortElement = th.querySelector(".".concat((_f = (_e = config.sort) === null || _e === void 0 ? void 0 : _e.classes) === null || _f === void 0 ? void 0 : _f.base));
            if (sortElement) {
                sortElement.className =
                    "".concat((_h = (_g = config.sort) === null || _g === void 0 ? void 0 : _g.classes) === null || _h === void 0 ? void 0 : _h.base, " ").concat(sortClass).trim();
            }
        }
    }
    function initSort() {
        if (!theadElement)
            return;
        // Set the initial sort icon
        setSortIcon(getState().sortField, getState().sortOrder);
        // Get all the table headers
        var headers = Array.from(theadElement.querySelectorAll('th'));
        headers.forEach(function (header) {
            var _a, _b;
            // If the sort class is not found, it's not a sortable column
            if (!header.querySelector(".".concat((_b = (_a = config.sort) === null || _a === void 0 ? void 0 : _a.classes) === null || _b === void 0 ? void 0 : _b.base)))
                return;
            // Check if sorting is disabled for this column
            var sortDisabled = header.getAttribute('data-kt-datatable-column-sort') === 'false';
            if (sortDisabled)
                return;
            var sortAttribute = header.getAttribute('data-kt-datatable-column-sort') ||
                header.getAttribute('data-kt-datatable-column');
            var sortField = sortAttribute
                ? sortAttribute
                : header.cellIndex;
            header.addEventListener('click', function () {
                var state = getState();
                var sortOrder = toggleSortOrder(state.sortField, state.sortOrder, sortField);
                setSortIcon(sortField, sortOrder);
                setState(sortField, sortOrder);
                fireEvent('sort', { field: sortField, order: sortOrder });
                dispatchEvent('sort', { field: sortField, order: sortOrder });
                updateData();
            });
        });
    }
    return { initSort: initSort, sortData: sortData, toggleSortOrder: toggleSortOrder, setSortIcon: setSortIcon };
}
//# sourceMappingURL=datatable-sort.js.map