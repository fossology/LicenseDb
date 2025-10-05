// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { IoInformationCircleOutline } from 'react-icons/io5';
import PropTypes from 'prop-types';
import '../../styles/component.css';

function ToolTipLabel(props) {
	const { label, tooltipText } = props;
	const tooltip = <Tooltip>{tooltipText}</Tooltip>;

	return (
		<OverlayTrigger
			placement="right"
			delay={{ show: 250, hide: 400 }}
			overlay={tooltip}
		>
			<span className="tooltip-icon">
				{label}{' '}
				<span>
					<IoInformationCircleOutline />
				</span>
			</span>
		</OverlayTrigger>
	);
}

ToolTipLabel.propTypes = {
	label: PropTypes.string.isRequired,
	tooltipText: PropTypes.string.isRequired,
};

export default ToolTipLabel;
