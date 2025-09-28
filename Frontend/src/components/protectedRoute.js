// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GetTokenSync, GetUser } from '../contexts/AuthContext';

function ProtectedRoute({ children, access }) {
	const isLoggedIn = GetTokenSync() !== null;
	const user = GetUser();
	if (!isLoggedIn) {
		return <Navigate to="/signin" replace />;
	} else if (isLoggedIn) {
		if (access.indexOf(user.user_level) !== -1) {
			return children;
		} else {
			return <Navigate to="/forbidden" replace />;
		}
	}
}

ProtectedRoute.propTypes = {
	children: PropTypes.node.isRequired,
	access: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
