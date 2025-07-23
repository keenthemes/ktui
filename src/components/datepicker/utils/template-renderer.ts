/*
 * template-renderer.ts - Unified template renderer for KTDatepicker
 * Provides centralized template rendering logic for all UI components.
 * Eliminates scattered rendering logic and ensures consistent template usage.
 */

import { KTDatepickerTemplateStrings } from '../config/types';
import { renderTemplateString, isTemplateFunction, renderTemplateToDOM, mergeClassData } from './template-utils';

/**
 * Options for template rendering
 */
export interface TemplateRenderOptions {
  templateKey: keyof KTDatepickerTemplateStrings;
  data: Record<string, any>;
  configClasses?: Record<string, string>;
  fallbackTemplate?: string | ((data: any) => string);
}

/**
 * Unified template renderer for all datepicker UI components
 * Ensures consistent template usage and eliminates scattered rendering logic
 */
export class TemplateRenderer {
  private _templates: KTDatepickerTemplateStrings;

  constructor(templates: KTDatepickerTemplateStrings) {
    this._templates = templates;
  }

  /**
   * Render a template with data and return HTML string
   */
  renderTemplateString(options: TemplateRenderOptions): string {
    const { templateKey, data, configClasses, fallbackTemplate } = options;

    // Get template from template set
    let template = this._templates[templateKey];

    // Use fallback if template not found
    if (!template && fallbackTemplate) {
      template = fallbackTemplate;
    }

    // Validate template exists
    if (!template) {
      throw new Error(`Template not found for key: ${templateKey}`);
    }

    // Merge class data
    const mergedData = mergeClassData(templateKey, data, configClasses);

    // Render template
    if (isTemplateFunction(template)) {
      return template(mergedData);
    } else {
      return renderTemplateString(template as string, mergedData);
    }
  }

  /**
   * Render a template with data and return HTMLElement
   */
  renderTemplateToElement(options: TemplateRenderOptions): HTMLElement {
    const html = this.renderTemplateString(options);
    const fragment = renderTemplateToDOM(html);
    const element = fragment.firstElementChild as HTMLElement;

    if (!element) {
      throw new Error(`Failed to render template to element for key: ${options.templateKey}`);
    }

    return element;
  }

  /**
   * Render a template with data and return DocumentFragment
   */
  renderTemplateToFragment(options: TemplateRenderOptions): DocumentFragment {
    const html = this.renderTemplateString(options);
    return renderTemplateToDOM(html);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(templateKey: keyof KTDatepickerTemplateStrings): boolean {
    return !!this._templates[templateKey];
  }

  /**
   * Get template by key
   */
  getTemplate(templateKey: keyof KTDatepickerTemplateStrings): string | ((data: any) => string) | undefined {
    return this._templates[templateKey];
  }

  /**
   * Update templates
   */
  updateTemplates(templates: Partial<KTDatepickerTemplateStrings>): void {
    this._templates = { ...this._templates, ...templates };
  }
}

/**
 * Factory function to create template renderer
 */
export function createTemplateRenderer(templates: KTDatepickerTemplateStrings): TemplateRenderer {
  return new TemplateRenderer(templates);
}