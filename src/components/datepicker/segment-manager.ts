/*
 * segment-manager.ts - Encapsulates segmented input state and navigation for KTDatepicker
 * Handles segment boundaries, caret navigation, value updating, and formatting/parsing.
 */

export type DateSegmentType = 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'ampm';

export interface Segment {
  type: DateSegmentType;
  start: number;
  end: number;
  value: string;
  min: number;
  max: number;
  editable: boolean;
}

/**
 * SegmentManager - manages segmented input state and navigation for KTDatepicker
 */
export class SegmentManager {
  private _segments: Segment[] = [];
  private _activeIndex: number = 0;
  private _format: string;
  private _rawValue: string;

  /**
   * Construct a SegmentManager for a given format and initial value
   * @param format e.g. 'MM/DD/YYYY', 'DD-MM-YYYY', etc.
   * @param value initial value as string (optional)
   */
  constructor(format: string, value?: string) {
    this._format = format;
    this._rawValue = value || '';
    this._segments = this._parseSegments(format, value || '');
  }

  /**
   * Parse the format and value into segments
   */
  private _parseSegments(format: string, value: string): Segment[] {
    // For MVP: support MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.
    // Later: support time segments, i18n, etc.
    // This is a simplified parser for demonstration.
    const segments: Segment[] = [];
    let pos = 0;
    const formatParts = format.match(/(yyyy|mm|dd|hh|ii|ss|a|[^a-z]+)/gi) || [];
    for (const part of formatParts) {
      let type: DateSegmentType | null = null;
      let min = 0, max = 0, editable = true;
      switch (part.toLowerCase()) {
        case 'yyyy': type = 'year'; min = 1; max = 9999; break;
        case 'mm': type = 'month'; min = 1; max = 12; break;
        case 'dd': type = 'day'; min = 1; max = 31; break;
        case 'hh': type = 'hour'; min = 0; max = 23; break;
        case 'ii': type = 'minute'; min = 0; max = 59; break;
        case 'ss': type = 'second'; min = 0; max = 59; break;
        case 'a': type = 'ampm'; min = 0; max = 1; break;
        default: type = null; editable = false; break;
      }
      const len = part.length;
      const val = value.substr(pos, len);
      segments.push({
        type: type as DateSegmentType,
        start: pos,
        end: pos + len,
        value: val,
        min,
        max,
        editable,
      });
      pos += len;
    }
    return segments;
  }

  /**
   * Get all segments
   */
  public get segments(): Segment[] {
    return this._segments;
  }

  /**
   * Get the active segment
   */
  public get activeSegment(): Segment {
    return this._segments[this._activeIndex];
  }

  /**
   * Move to the next segment (if possible)
   */
  public nextSegment(): void {
    if (this._activeIndex < this._segments.length - 1) {
      this._activeIndex++;
    }
  }

  /**
   * Move to the previous segment (if possible)
   */
  public prevSegment(): void {
    if (this._activeIndex > 0) {
      this._activeIndex--;
    }
  }

  /**
   * Set the active segment by index
   */
  public setActiveSegment(index: number): void {
    if (index >= 0 && index < this._segments.length) {
      this._activeIndex = index;
    }
  }

  /**
   * Update the value of the active segment
   */
  public updateActiveSegmentValue(newValue: string): void {
    const seg = this._segments[this._activeIndex];
    seg.value = newValue;
    // Optionally: clamp to min/max, pad, etc.
  }

  /**
   * Increment/decrement the active segment value
   */
  public incrementActiveSegment(delta: number): void {
    const seg = this._segments[this._activeIndex];
    if (!seg.editable) return;
    let num = parseInt(seg.value.replace(/\D/g, ''), 10) || seg.min;
    num += delta;
    if (num > seg.max) num = seg.min;
    if (num < seg.min) num = seg.max;
    seg.value = num.toString().padStart(seg.end - seg.start, '0');
  }

  /**
   * Format the segments into a string value
   */
  public formatValue(): string {
    return this._segments.map(seg => seg.value).join('');
  }

  /**
   * Set the raw value and re-parse segments
   */
  public setRawValue(value: string): void {
    this._rawValue = value;
    this._segments = this._parseSegments(this._format, value);
  }

  /**
   * Get the raw value
   */
  public get rawValue(): string {
    return this._rawValue;
  }
}