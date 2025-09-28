// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import PropTypes from 'prop-types';

const CustomColorCell = ({ color, text }) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<span
				style={{
					display: 'inline-block',
					width: '17px',
					height: '17px',
					backgroundColor: color,
					marginRight: '8px',
					boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
					borderRadius: '50%',
					border: '1px solid',
				}}
			></span>
			{text}
		</div>
	);
};

CustomColorCell.propTypes = {
	color: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
};

export default CustomColorCell;
