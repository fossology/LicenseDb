// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

// reusable dropdown options for global use

// risk options to use in "licenses"
export const riskOptions = [
	{ value: 0, label: '0', color: '#E2E2E2' },
	{ value: 1, label: '1', color: '#78B7E2' },
	{ value: 2, label: '2', color: '#00d10d' },
	{ value: 3, label: '3', color: '#D5CA00' },
	{ value: 4, label: '4', color: '#D56E00' },
	{ value: 5, label: '5', color: '#CB4C45' },
];

// access level dropdown array, "users"
export const accessLevelOptions = [
	{ value: 'ADMIN', label: 'Admin' },
	{ value: 'USER', label: 'User' },
];

// import options for license, obligation
export const importOptions = [
	{ value: 'json', label: 'JSON' },
	{ value: 'csv', label: 'CSV', isDisabled: true },
];

export const categoryOptions = [
	{ value: 'GENERAL', label: 'GENERAL' },
	{ value: 'DISTRIBUTION', label: 'DISTRIBUTION' },
	{ value: 'PATENT', label: 'PATENT' },
	{ value: 'INTERNAL', label: 'INTERNAL' },
	{ value: 'CONTRACTUAL', label: 'CONTRACTUAL' },
	{ value: 'EXPORT_CONTROL', label: 'EXPORT CONTROL' },
];
