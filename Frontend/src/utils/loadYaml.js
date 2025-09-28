// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import yaml from 'js-yaml';

export const loadYaml = async filePath => {
	const response = await fetch(filePath);
	const text = await response.text();
	return yaml.load(text);
};
