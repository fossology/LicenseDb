// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import AppLogo from '../assets/images/logo.png';

function Footer() {
	const version = '1.0.0';
	const currentYear = new Date().getFullYear();

	return (
		<div className="d-flex align-items-center justify-content-center bg-white border-top py-2 w-100">
			<p className="fs-6 mx-2 fw-bold">{version}</p>
			<p className="fs-6 mx-2 fw-bold">© {currentYear}</p>
			<p>
				<img
					src={AppLogo}
					width={80}
					height={26}
					alt="Fossology Logo"
				/>
			</p>
		</div>
	);
}

export default Footer;
