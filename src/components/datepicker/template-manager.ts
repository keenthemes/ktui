/*
 * template-manager.ts - Template management for KTDatepicker
 * Handles merging and retrieval of template strings/functions from defaults, config, and user overrides.
 */

import { KTDatepickerTemplateStrings } from './types';
import { defaultTemplates } from './templates';

/**
 * Merges default, config, and user templates (string or function)
 * Precedence: default < config < user
 */
export function getMergedTemplates(
  configTemplates?: Record<string, string | ((data: any) => string)>,
  userTemplates?: Record<string, string | ((data: any) => string)>
): Record<string, string | ((data: any) => string)> {
  return {
    ...(defaultTemplates as Record<string, string | ((data: any) => string)>),
    ...(configTemplates || {}),
    ...(userTemplates || {}),
  };
}