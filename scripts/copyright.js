#!/usr/bin/env node
/**
 * Script to add copyright headers to JS, TS, and CSS files
 * Usage: node copyright.js
 */
const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const COPYRIGHT_HEADER = `/**
 * KTUI - Free & Open-Source Tailwind UI Components by Keenthemes
 * Copyright 2025 by Keenthemes Inc
 */\n\n`;

// Extensions to process
const FILE_EXTENSIONS = ['.js', '.ts', '.css'];

// Function to add or update header in a file
function addHeaderToFile(filePath) {
	try {
		let content = fs.readFileSync(filePath, 'utf8');

		// Regex to match any KTUI copyright header block at the very top
		const headerRegex = /^(\/\*\*[^]*?Copyright[^]*?@version:[^]*?\*\/\s*)+/;
		content = content.replace(headerRegex, '');

		const newContent = COPYRIGHT_HEADER + content.replace(/^\s*/, '');
		fs.writeFileSync(filePath, newContent, 'utf8');
		console.log(`Cleaned and updated header in ${filePath}`);
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
