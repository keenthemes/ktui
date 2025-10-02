/**
 * KTUI Sticky Component - Logic Test
 * Tests the positioning logic changes from PR #27
 */

import { KTSticky } from '../../lib/esm/components/sticky/index.js';

class StickyTestSuite {
    constructor() {
        this.testResults = [];
        this.testElement = null;
    }

    // Setup test environment
    setup() {
        // Create a test container
        const container = document.createElement('div');
        container.id = 'sticky-test-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            height: 200vh;
            background: #f0f0f0;
            padding: 20px;
        `;
        document.body.appendChild(container);

        // Create test element
        this.testElement = document.createElement('div');
        this.testElement.id = 'sticky-test-element';
        this.testElement.style.cssText = `
            width: 200px;
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border-radius: 8px;
        `;
        container.appendChild(this.testElement);

        console.log('✅ Test environment setup complete');
    }

    // Cleanup test environment
    cleanup() {
        const container = document.getElementById('sticky-test-container');
        if (container) {
            container.remove();
        }
        this.testResults = [];
        console.log('✅ Test environment cleaned up');
    }

    // Test helper: create sticky instance with config
    createStickyInstance(config) {
        // Remove existing instance
        if (this.testElement.hasAttribute('data-kt-sticky-initialized')) {
            const existingInstance = KTSticky.getInstance(this.testElement);
            if (existingInstance) {
                // Force cleanup
                this.testElement.classList.remove('active');
                this.testElement.style.position = '';
                this.testElement.style.top = '';
                this.testElement.style.bottom = '';
                this.testElement.style.left = '';
                this.testElement.style.right = '';
                this.testElement.style.insetBlockStart = '';
                this.testElement.style.insetInlineStart = '';
                this.testElement.style.insetInlineEnd = '';
            }
        }

        // Clear attributes
        this.testElement.removeAttribute('data-kt-sticky');
        this.testElement.removeAttribute('data-kt-sticky-top');
        this.testElement.removeAttribute('data-kt-sticky-bottom');
        this.testElement.removeAttribute('data-kt-sticky-start');
        this.testElement.removeAttribute('data-kt-sticky-end');
        this.testElement.removeAttribute('data-kt-sticky-middle');
        this.testElement.removeAttribute('data-kt-sticky-center');
        this.testElement.removeAttribute('data-kt-sticky-name');

        // Set new attributes based on config
        this.testElement.setAttribute('data-kt-sticky', 'true');
        this.testElement.setAttribute('data-kt-sticky-name', 'test');

        if (config.top !== undefined) this.testElement.setAttribute('data-kt-sticky-top', config.top);
        if (config.bottom !== undefined) this.testElement.setAttribute('data-kt-sticky-bottom', config.bottom);
        if (config.start !== undefined) this.testElement.setAttribute('data-kt-sticky-start', config.start);
        if (config.end !== undefined) this.testElement.setAttribute('data-kt-sticky-end', config.end);
        if (config.middle !== undefined) this.testElement.setAttribute('data-kt-sticky-middle', config.middle);
        if (config.center !== undefined) this.testElement.setAttribute('data-kt-sticky-center', config.center);

        // Create new instance
        return new KTSticky(this.testElement);
    }

    // Test helper: get computed styles
    getComputedStyles() {
        const computed = window.getComputedStyle(this.testElement);
        return {
            position: computed.position,
            top: computed.top,
            bottom: computed.bottom,
            left: computed.left,
            right: computed.right,
            insetBlockStart: computed.insetBlockStart,
            insetBlockEnd: computed.insetBlockEnd,
            insetInlineStart: computed.insetInlineStart,
            insetInlineEnd: computed.insetInlineEnd,
            transform: computed.transform
        };
    }

    // Test helper: simulate scroll to trigger sticky
    simulateScroll() {
        // Simulate scroll by triggering the scroll event
        window.dispatchEvent(new Event('scroll'));

        // Force a small delay to allow processing
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test 1: Middle positioning
    async testMiddlePositioning() {
        console.log('🧪 Testing Middle (Vertical Center) Positioning...');

        const instance = this.createStickyInstance({ middle: true });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const isMiddle = styles.insetBlockStart === '50%';

        this.testResults.push({
            test: 'Middle Positioning',
            passed: isMiddle,
            expected: 'insetBlockStart: 50%',
            actual: `insetBlockStart: ${styles.insetBlockStart}`,
            styles
        });

        console.log(isMiddle ? '✅ Middle positioning works' : '❌ Middle positioning failed');
        return isMiddle;
    }

    // Test 2: Center positioning
    async testCenterPositioning() {
        console.log('🧪 Testing Center (Horizontal Center) Positioning...');

        const instance = this.createStickyInstance({ center: true });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const isCenter = styles.insetInlineStart === '50%';

        this.testResults.push({
            test: 'Center Positioning',
            passed: isCenter,
            expected: 'insetInlineStart: 50%',
            actual: `insetInlineStart: ${styles.insetInlineStart}`,
            styles
        });

        console.log(isCenter ? '✅ Center positioning works' : '❌ Center positioning failed');
        return isCenter;
    }

    // Test 3: Middle + Center positioning
    async testMiddleCenterPositioning() {
        console.log('🧪 Testing Middle + Center (Fully Centered) Positioning...');

        const instance = this.createStickyInstance({ middle: true, center: true });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const isMiddleCenter = styles.insetBlockStart === '50%' && styles.insetInlineStart === '50%';

        this.testResults.push({
            test: 'Middle + Center Positioning',
            passed: isMiddleCenter,
            expected: 'insetBlockStart: 50%, insetInlineStart: 50%',
            actual: `insetBlockStart: ${styles.insetBlockStart}, insetInlineStart: ${styles.insetInlineStart}`,
            styles
        });

        console.log(isMiddleCenter ? '✅ Middle + Center positioning works' : '❌ Middle + Center positioning failed');
        return isMiddleCenter;
    }

    // Test 4: Bottom positioning
    async testBottomPositioning() {
        console.log('🧪 Testing Bottom Positioning...');

        const instance = this.createStickyInstance({ bottom: '20' });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const isBottom = styles.insetBlockEnd === '20px';

        this.testResults.push({
            test: 'Bottom Positioning',
            passed: isBottom,
            expected: 'insetBlockEnd: 20px',
            actual: `insetBlockEnd: ${styles.insetBlockEnd}`,
            styles
        });

        console.log(isBottom ? '✅ Bottom positioning works' : '❌ Bottom positioning failed');
        return isBottom;
    }

    // Test 5: Auto positioning with offset calculation
    async testAutoPositioning() {
        console.log('🧪 Testing Auto Positioning with Offset Calculation...');

        const instance = this.createStickyInstance({ start: 'auto', top: '50' });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const hasAutoOffset = styles.insetInlineStart !== 'auto' && styles.insetInlineStart !== '';

        this.testResults.push({
            test: 'Auto Positioning with Offset',
            passed: hasAutoOffset,
            expected: 'insetInlineStart: calculated offset value',
            actual: `insetInlineStart: ${styles.insetInlineStart}`,
            styles
        });

        console.log(hasAutoOffset ? '✅ Auto positioning with offset works' : '❌ Auto positioning with offset failed');
        return hasAutoOffset;
    }

    // Test 6: Exclusive positioning logic (top vs bottom)
    async testExclusivePositioning() {
        console.log('🧪 Testing Exclusive Positioning Logic (top vs bottom)...');

        const instance = this.createStickyInstance({ top: '30', bottom: '30' });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const isExclusive = styles.insetBlockStart === '30px' && styles.insetBlockEnd === 'auto';

        this.testResults.push({
            test: 'Exclusive Positioning Logic',
            passed: isExclusive,
            expected: 'insetBlockStart: 30px, insetBlockEnd: auto (top takes precedence)',
            actual: `insetBlockStart: ${styles.insetBlockStart}, insetBlockEnd: ${styles.insetBlockEnd}`,
            styles
        });

        console.log(isExclusive ? '✅ Exclusive positioning logic works' : '❌ Exclusive positioning logic failed');
        return isExclusive;
    }

    // Test 7: Logical properties for RTL support
    async testLogicalProperties() {
        console.log('🧪 Testing Logical Properties for RTL Support...');

        const instance = this.createStickyInstance({ end: '20', top: '40' });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const usesLogicalProps = styles.insetInlineEnd === '20px' && styles.insetBlockStart === '40px';

        this.testResults.push({
            test: 'Logical Properties (RTL Support)',
            passed: usesLogicalProps,
            expected: 'insetInlineEnd: 20px, insetBlockStart: 40px',
            actual: `insetInlineEnd: ${styles.insetInlineEnd}, insetBlockStart: ${styles.insetBlockStart}`,
            styles
        });

        console.log(usesLogicalProps ? '✅ Logical properties work' : '❌ Logical properties failed');
        return usesLogicalProps;
    }

    // Test 8: Auto fallback values
    async testAutoFallbackValues() {
        console.log('🧪 Testing Auto Fallback Values...');

        const instance = this.createStickyInstance({ top: 'auto' });
        await this.simulateScroll();

        const styles = this.getComputedStyles();
        const hasAutoFallback = styles.insetBlockStart === '0px';

        this.testResults.push({
            test: 'Auto Fallback Values',
            passed: hasAutoFallback,
            expected: 'insetBlockStart: 0px (auto defaults to 0px)',
            actual: `insetBlockStart: ${styles.insetBlockStart}`,
            styles
        });

        console.log(hasAutoFallback ? '✅ Auto fallback values work' : '❌ Auto fallback values failed');
        return hasAutoFallback;
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting KTUI Sticky Component Tests...');
        console.log('Testing PR #27 changes: middle, center, bottom positioning with improved offset logic\n');

        this.setup();

        try {
            await this.testMiddlePositioning();
            await this.testCenterPositioning();
            await this.testMiddleCenterPositioning();
            await this.testBottomPositioning();
            await this.testAutoPositioning();
            await this.testExclusivePositioning();
            await this.testLogicalProperties();
            await this.testAutoFallbackValues();

            this.printResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            this.cleanup();
        }
    }

    // Print test results
    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('='.repeat(60));

        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;

        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${status} - ${result.test}`);
            if (!result.passed) {
                console.log(`   Expected: ${result.expected}`);
                console.log(`   Actual: ${result.actual}`);
            }
        });

        console.log('='.repeat(60));
        console.log(`Overall: ${passed}/${total} tests passed`);

        if (passed === total) {
            console.log('🎉 All tests passed! PR #27 changes are working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the implementation.');
        }
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.StickyTestSuite = StickyTestSuite;
}

// Auto-run tests if this file is loaded directly
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const testSuite = new StickyTestSuite();
        testSuite.runAllTests();
    });
}

export default StickyTestSuite;
