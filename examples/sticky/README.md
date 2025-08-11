# KTUI Sticky Component - Testing Suite

This directory contains comprehensive tests for the KTUI Sticky component, specifically designed to verify the changes from [PR #27](https://github.com/keenthemes/ktui/pull/27).

## 🎯 What We're Testing

The tests verify the following new features and improvements:

### New Positioning Features
- ✅ **Middle positioning** - Vertical centering (`inset-block-start: 50%`)
- ✅ **Center positioning** - Horizontal centering (`inset-inline-start: 50%`)
- ✅ **Bottom positioning** - Sticky to bottom with offset
- ✅ **Combined positioning** - Middle + Center for full centering

### Improved Logic
- ✅ **Exclusive positioning** - Only one of `top`/`bottom` and `start`/`end` applied
- ✅ **Auto handling** - Proper fallback values for `'auto'` inputs
- ✅ **Offset calculation** - Dynamic positioning using `KTDom.offset()`

### Modern CSS Support
- ✅ **Logical properties** - `insetBlockStart`, `insetInlineStart`, `insetInlineEnd`
- ✅ **RTL/LTR compatibility** - Better support for right-to-left layouts

## 📁 Test Files

### 1. `test-sticky-positioning.html`
**Visual/Interactive Test**
- Comprehensive visual test with 8 different positioning scenarios
- Real-time position indicator showing computed styles
- RTL toggle functionality
- Scroll indicators and controls

**How to use:**
```bash
# Open in browser
open examples/sticky/test-sticky-positioning.html
```

### 2. `test-sticky-logic.js`
**Programmatic Test Suite**
- Automated tests for all positioning logic
- Validates computed CSS properties
- Tests exclusive positioning rules
- Verifies auto fallback values

### 3. `test-runner.html`
**Test Runner Interface**
- Clean UI for running automated tests
- Detailed test results with pass/fail status
- Console output capture
- Visual test summary

**How to use:**
```bash
# Open in browser
open examples/sticky/test-runner.html
```

## 🧪 Running the Tests

### Option 1: Visual Testing (Recommended)
1. Open `test-sticky-positioning.html` in your browser
2. Scroll through the page to see each sticky element in action
3. Use the position indicator to verify computed styles
4. Test RTL layout by clicking "Toggle RTL Layout"

### Option 2: Automated Testing
1. Open `test-runner.html` in your browser
2. Click "Run All Tests" to execute the automated test suite
3. Review the detailed results and console output

### Option 3: Console Testing
1. Open browser developer tools
2. Import and run the test suite directly:
```javascript
import StickyTestSuite from './examples/sticky/test-sticky-logic.js';
const testSuite = new StickyTestSuite();
await testSuite.runAllTests();
```

## 📋 Test Scenarios

### 1. Basic Positioning
- **Top**: `data-kt-sticky-top="20"` → `inset-block-start: 20px`
- **Bottom**: `data-kt-sticky-bottom="20"` → `inset-block-end: 20px`

### 2. Centering
- **Middle**: `data-kt-sticky-middle="true"` → `inset-block-start: 50%`
- **Center**: `data-kt-sticky-center="true"` → `inset-inline-start: 50%`
- **Both**: `data-kt-sticky-middle="true" data-kt-sticky-center="true"` → Fully centered

### 3. Auto Positioning
- **Auto Top**: `data-kt-sticky-top="auto"` → `inset-block-start: 0px`
- **Auto Start**: `data-kt-sticky-start="auto"` → Calculated offset using `KTDom.offset()`

### 4. Exclusive Logic
- **Top + Bottom**: Only top is applied (top takes precedence)
- **Start + End**: Only start is applied (start takes precedence)

### 5. RTL Support
- **End positioning**: `data-kt-sticky-end="20"` → `inset-inline-end: 20px`
- **Logical properties**: Works correctly in both LTR and RTL layouts

## 🔍 What to Look For

### ✅ Success Indicators
- Elements stick to the correct positions when scrolling
- Computed styles match expected values
- RTL layout works correctly
- Auto positioning calculates proper offsets
- Exclusive positioning rules are followed

### ❌ Failure Indicators
- Elements don't stick or stick to wrong positions
- Computed styles don't match expected values
- RTL layout breaks positioning
- Auto positioning doesn't calculate offsets
- Multiple positioning properties conflict

## 🛠️ Troubleshooting

### Common Issues

1. **Tests not running**
   - Ensure you're serving files from a web server (not file://)
   - Check browser console for import errors
   - Verify KTUI library is built and accessible

2. **Positioning not working**
   - Check if sticky element has proper dimensions
   - Verify scroll container is correct
   - Ensure CSS logical properties are supported

3. **RTL not working**
   - Check if `dir="rtl"` is set on `<html>` element
   - Verify browser supports logical properties
   - Test with different RTL content

### Debug Mode
Enable debug logging by adding this to the console:
```javascript
localStorage.setItem('ktui-debug', 'true');
```

## 📊 Expected Results

When all tests pass, you should see:
- ✅ 8/8 tests passed
- All positioning scenarios working correctly
- Logical properties being used
- RTL layout functioning properly
- Auto positioning calculating offsets

## 🔗 Related Links

- [PR #27](https://github.com/keenthemes/ktui/pull/27) - Original pull request
- [Sticky Component Documentation](../src/components/sticky/) - Component source code
- [KTUI Main Documentation](../../README.md) - Main project documentation
