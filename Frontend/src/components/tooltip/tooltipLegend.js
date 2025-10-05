// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import { IoInformationCircle } from 'react-icons/io5';
import '../../styles/component.css';
import PropTypes from 'prop-types';

function ToolTipLegend(props) {
	const { tooltip, label } = props;

	return (
		<div>
			<OverlayTrigger
				placement="right"
				delay={{ show: 250, hide: 400 }}
				overlay={tooltip}
			>
				<span className="tooltip-icon">
					{label}{' '}
					<span>
						<IoInformationCircle />
					</span>
				</span>
			</OverlayTrigger>
		</div>
	);
}

ToolTipLegend.propTypes = {
	tooltip: PropTypes.node.isRequired,
	label: PropTypes.string.isRequired,
};

export default ToolTipLegend;
