// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import Table from 'react-bootstrap/Table';

function CustomTable() {
	return (
		<Table striped bordered hover>
			<thead>
				<tr>
					<th>SPDX ID</th>
					<th>Short Name</th>
					<th>Full Name</th>
					<th>Text</th>
					<th>Risk</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1</td>
					<td>Mark</td>
					<td>Otto</td>
					<td>@mdo</td>
					<td>@mdo</td>
				</tr>
				<tr>
					<td>2</td>
					<td>Jacob</td>
					<td>Thornton</td>
					<td>@fat</td>
					<td>@mdo</td>
				</tr>
			</tbody>
		</Table>
	);
}

export default CustomTable;
