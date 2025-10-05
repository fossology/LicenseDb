// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import { BiSolidUpArrow, BiSolidDownArrow } from 'react-icons/bi';

const SortableColumnHeader = ({
	columnName,
	columnKey,
	handleColumnClick,
	sortField,
	sortOrder,
}) => {
	const isSortedColumn = !sortField || sortField === columnKey;
	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			{columnName}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					marginLeft: '8px',
				}}
			>
				<BiSolidUpArrow
					onClick={() => handleColumnClick(columnKey, 'asc')}
					style={{
						cursor: 'pointer',
						color:
							isSortedColumn && sortOrder === 'asc'
								? 'black'
								: 'gray',
					}}
				/>
				<BiSolidDownArrow
					onClick={() => handleColumnClick(columnKey, 'desc')}
					style={{
						cursor: 'pointer',
						color:
							isSortedColumn && sortOrder === 'desc'
								? 'black'
								: 'gray',
					}}
				/>
			</div>
		</div>
	);
};

SortableColumnHeader.propTypes = {
	columnName: PropTypes.string.isRequired,
	columnKey: PropTypes.string.isRequired,
	handleColumnClick: PropTypes.func.isRequired,
	sortField: PropTypes.string,
	sortOrder: PropTypes.oneOf(['asc', 'desc']),
};

export default SortableColumnHeader;
