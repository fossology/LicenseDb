// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import { lazy } from 'react';

const componentPathMap = {
	'../components/dynamic/inputField': () =>
		import('../components/dynamic/inputField'),
	'../components/dynamic/checkBox': () =>
		import('../components/dynamic/checkBox'),
	'../components/dynamic/textArea': () =>
		import('../components/dynamic/textArea'),
};

const componentCache = {};

export const resolveComponentPath = path => {
	if (componentCache[path]) {
		return componentCache[path];
	}

	if (componentPathMap[path]) {
		const Component = lazy(componentPathMap[path]);
		componentCache[path] = Component;
		return Component;
	} else {
		throw new Error(`Cannot find module for path: ${path}`);
	}
};
