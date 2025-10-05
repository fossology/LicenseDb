// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React from 'react';
import { ToastContainer } from 'react-toastify';
import PropTypes from 'prop-types';
import LicenseDBSidebar from './Sidebar';
import LicenseDBNavbar from './Navbar';
import Footer from '../layout/footer';

const MainLayout = ({ children }) => {
	return (
		<div className="d-flex flex-column min-vh-100">
			<div className="row flex-grow-1 m-0">
				<div className="d-none d-lg-block col-lg-2 mh-100 border-end">
					<LicenseDBSidebar />
				</div>
				<div className="col-lg-10 col-12 d-flex flex-column px-0">
					<div className="d-lg-none">
						<LicenseDBNavbar />
					</div>
					<ToastContainer />
					<div className="flex-grow-1 px-4">{children}</div>
					<Footer className="mt-auto" />
				</div>
			</div>
		</div>
	);
};

MainLayout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default MainLayout;
