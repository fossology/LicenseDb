// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import Form from 'react-bootstrap/Form';
import { FcSearch } from 'react-icons/fc';
import '../styles/dataTable.css';

function TableSearch() {
	return (
		<div>
			<Form.Group controlId="search" className="search-group">
				<div className="search-container">
					<FcSearch className="search-icon" />
					<Form.Control
						type="text"
						placeholder="Search..."
						className="search-input"
					/>
				</div>
			</Form.Group>
		</div>
	);
}

export default TableSearch;
