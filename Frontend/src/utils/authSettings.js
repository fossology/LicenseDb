// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import PropTypes from 'prop-types';

const isApiAuthenticated = (path, method) => {
	const settings = JSON.parse(
		sessionStorage.getItem('licensedb.authSettings'),
	);
	const api = Object.values(settings.authenticated._links).filter(
		api => api.href === `/api/v1/${path}` && api.request_method === method,
	);
	return api.length !== 0 ? true : false;
};

isApiAuthenticated.propTypes = {
	path: PropTypes.string.isRequired,
	method: PropTypes.string.isRequired,
};

export default isApiAuthenticated;
