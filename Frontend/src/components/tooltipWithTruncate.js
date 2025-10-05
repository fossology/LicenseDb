// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import PropTypes from 'prop-types';

function ToolTipTruncate(props) {
	const { text } = props;
	const truncatedText =
		text.length <= 50 ? text : text.substring(0, 50) + '...';

	return (
		<OverlayTrigger
			placement="right"
			delay={{ show: 250, hide: 400 }}
			overlay={<Tooltip id="tooltip">{text}</Tooltip>}
		>
			<span>{truncatedText}</span>
		</OverlayTrigger>
	);
}

ToolTipTruncate.propTypes = {
	text: PropTypes.string.isRequired,
};

export default ToolTipTruncate;
