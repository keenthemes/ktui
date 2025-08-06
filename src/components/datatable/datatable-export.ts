/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */

import {
	KTDataTableDataInterface,
	KTDataTableCSVExportConfigInterface,
	KTDataTableConfigInterface,
} from './types';

/**
 * CSV Export utility functions for KTDataTable
 */
export class KTDataTableExport {
	/**
	 * Default CSV export configuration
	 */
	private static readonly DEFAULT_CONFIG: Required<KTDataTableCSVExportConfigInterface> = {
		enabled: false,
		scope: 'current',
		includeHeaders: true,
		delimiter: ',',
		filename: 'datatable-export',
		includeTimestamp: true,
		includeColumns: [],
		excludeColumns: [],
		headerMapping: {},
		transformValue: (value: any) => String(value || ''),
	};

	/**
	 * Escape a value for CSV format
	 * @param value The value to escape
	 * @param delimiter The CSV delimiter being used
	 * @returns Escaped CSV value
	 */
	private static escapeCSVValue(value: string, delimiter: string): string {
		if (value === null || value === undefined) {
			return '';
		}

		const stringValue = String(value);

		// Check if value needs escaping (contains delimiter, quote, or newline)
		const needsEscaping = stringValue.includes(delimiter) ||
							 stringValue.includes('"') ||
							 stringValue.includes('\n') ||
							 stringValue.includes('\r');

		if (needsEscaping) {
			// Escape quotes by doubling them and wrap in quotes
			return `"${stringValue.replace(/"/g, '""')}"`;
		}

		return stringValue;
	}

	/**
	 * Clean HTML content from a value
	 * @param value The value to clean
	 * @returns Cleaned value without HTML tags
	 */
	private static cleanHTMLContent(value: any): string {
		if (value === null || value === undefined) {
			return '';
		}

		const stringValue = String(value);

		// Remove HTML tags and decode HTML entities
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = stringValue;

		// Get text content and normalize whitespace
		let cleaned = tempDiv.textContent || tempDiv.innerText || '';
		cleaned = cleaned.replace(/\s+/g, ' ').trim();

		return cleaned;
	}

	/**
	 * Generate CSV content from data
	 * @param data Array of data objects
	 * @param config Export configuration
	 * @param tableConfig Table configuration for column information
	 * @returns CSV content as string
	 */
	public static generateCSV(
		data: KTDataTableDataInterface[],
		config: KTDataTableCSVExportConfigInterface,
		tableConfig: KTDataTableConfigInterface,
	): string {
		if (!data || data.length === 0) {
			return '';
		}

		const exportConfig = { ...this.DEFAULT_CONFIG, ...config };
		const delimiter = exportConfig.delimiter;
		const lines: string[] = [];

		// Get column information
		const columns = this.getExportColumns(data[0], exportConfig, tableConfig);

		// Add headers if requested
		if (exportConfig.includeHeaders) {
			const headerRow = columns.map(column => {
				const headerText = exportConfig.headerMapping[column] ||
								 this.capitalizeColumnName(column);
				return this.escapeCSVValue(headerText, delimiter);
			});
			lines.push(headerRow.join(delimiter));
		}

		// Add data rows
		data.forEach(row => {
			const rowData = columns.map(column => {
				let value = row[column];

				// Apply custom transformation if provided
				if (exportConfig.transformValue) {
					value = exportConfig.transformValue(value, column, row);
				} else {
					// Default transformation: clean HTML and convert to string
					value = this.cleanHTMLContent(value);
				}

				return this.escapeCSVValue(value, delimiter);
			});
			lines.push(rowData.join(delimiter));
		});

		return lines.join('\n');
	}

	/**
	 * Get the list of columns to export based on configuration
	 * @param sampleRow Sample data row to determine available columns
	 * @param exportConfig Export configuration
	 * @param tableConfig Table configuration
	 * @returns Array of column keys to export
	 */
	private static getExportColumns(
		sampleRow: KTDataTableDataInterface,
		exportConfig: Required<KTDataTableCSVExportConfigInterface>,
		tableConfig: KTDataTableConfigInterface,
	): string[] {
		let columns: string[] = [];

		// If specific columns are included, use those
		if (exportConfig.includeColumns.length > 0) {
			columns = exportConfig.includeColumns.filter(col =>
				Object.prototype.hasOwnProperty.call(sampleRow, col)
			);
		} else {
			// Use all available columns
			columns = Object.keys(sampleRow);
		}

		// Remove excluded columns
		columns = columns.filter(col => !exportConfig.excludeColumns.includes(col));

		return columns;
	}

	/**
	 * Capitalize and format column name for display
	 * @param columnName The column name to format
	 * @returns Formatted column name
	 */
	private static capitalizeColumnName(columnName: string): string {
		return columnName
			.replace(/([A-Z])/g, ' $1') // Add space before capital letters
			.replace(/^./, str => str.toUpperCase()) // Capitalize first letter
			.replace(/_/g, ' ') // Replace underscores with spaces
			.replace(/-/g, ' ') // Replace hyphens with spaces
			.trim();
	}

	/**
	 * Generate filename with optional timestamp
	 * @param baseFilename Base filename
	 * @param includeTimestamp Whether to include timestamp
	 * @returns Generated filename
	 */
	public static generateFilename(
		baseFilename: string,
		includeTimestamp: boolean = true,
	): string {
		let filename = baseFilename.replace(/[^a-zA-Z0-9-_]/g, '_');

		if (includeTimestamp) {
			const timestamp = new Date().toISOString()
				.replace(/[:.]/g, '-')
				.replace('T', '_')
				.slice(0, 19); // Remove milliseconds
			filename = `${filename}_${timestamp}`;
		}

		return `${filename}.csv`;
	}

	/**
	 * Download CSV content as a file
	 * @param csvContent The CSV content to download
	 * @param filename The filename for the download
	 */
	public static downloadCSV(csvContent: string, filename: string): void {
		// Add BOM for Excel compatibility
		const BOM = '\uFEFF';
		const content = BOM + csvContent;

		// Create blob with proper MIME type
		const blob = new Blob([content], {
			type: 'text/csv;charset=utf-8;'
		});

		// Create download link
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);

		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';

		// Trigger download
		document.body.appendChild(link);
		link.click();

		// Cleanup
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	/**
	 * Get data for export based on scope
	 * @param currentData Current page data
	 * @param originalData All data (for client-side mode)
	 * @param selectedRows Selected row IDs
	 * @param scope Export scope
	 * @returns Data array for export
	 */
	public static getExportData(
		currentData: KTDataTableDataInterface[],
		originalData: KTDataTableDataInterface[],
		selectedRows: string[],
		scope: 'current' | 'all' | 'selected',
	): KTDataTableDataInterface[] {
		switch (scope) {
			case 'current':
				return [...currentData];
			case 'all':
				return [...originalData];
			case 'selected':
				if (selectedRows.length === 0) {
					return [...currentData]; // Fallback to current data if no selection
				}
				return originalData.filter(row =>
					selectedRows.includes(String(row.id || row.ID || ''))
				);
			default:
				return [...currentData];
		}
	}
}