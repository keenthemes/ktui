#!/usr/bin/env node
/**
 * Script to add copyright headers to JS, TS, and CSS files
 * Usage: node copyright.js
 */
const fs = require('fs');
const path = require('path');

// Read package.json to get the version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const COPYRIGHT_HEADER = `/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 * @version: ${version}
 */
`;

// Extensions to process
const FILE_EXTENSIONS = ['.js', '.ts', '.css'];

// Function to check if a file already has the copyright header with version
function hasHeaderWithVersion(content) {
	return (
		content.trim().startsWith('/**') &&
		content.includes('Copyright by Keenthemes Inc') &&
		content.includes(`@version: ${version}`)
	);
}

// Function to check if a file has any copyright header
function hasAnyHeader(content) {
	return (
		content.trim().startsWith('/**') &&
		content.includes('Copyright by Keenthemes Inc')
	);
}

// Function to add or update header in a file
function addHeaderToFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, 'utf8');

		// Skip if correct header already exists
		if (hasHeaderWithVersion(content)) {
			console.log(`Header with version already exists in ${filePath}`);
			return;
		}

		let newContent;

		// If file has any copyright header, replace it
		if (hasAnyHeader(content)) {
			// Find the end of the existing header
			const headerEndIndex = content.indexOf('*/') + 2;
			// Replace existing header with new one
			newContent =
				COPYRIGHT_HEADER + content.substring(headerEndIndex).trimStart();
			console.log(`Updated header in ${filePath}`);
		} else {
			// Add header to file without existing header
			newContent = COPYRIGHT_HEADER + content;
			console.log(`Added header to ${filePath}`);
		}

		fs.writeFileSync(filePath, newContent, 'utf8');
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
	}
}

// Function to recursively process files in a directory
function processDirectory(dirPath) {
	const items = fs.readdirSync(dirPath);

	for (const item of items) {
		const itemPath = path.join(dirPath, item);
		const stats = fs.statSync(itemPath);

		if (stats.isDirectory()) {
			processDirectory(itemPath);
		} else if (stats.isFile()) {
			const ext = path.extname(itemPath);
			if (FILE_EXTENSIONS.includes(ext)) {
				addHeaderToFile(itemPath);
			}
		}
	}
}

// Main execution
console.log('Starting to add/update copyright headers...');
processDirectory(SRC_DIR);
console.log('Finished adding/updating copyright headers.');
