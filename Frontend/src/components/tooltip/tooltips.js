// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import { Tooltip } from 'react-bootstrap';
import CustomColorCell from '../CustomColorCell';

const tooltipLicense = (
	<Tooltip id="tooltip">
		<div className="risk-legend-tooltip">
			<div className="legend-item">
				<CustomColorCell color="white" text="0 Minimial Risk" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="aqua" text="1 - Low Risk" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="green" text="2 - Moderate Risk" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="yellow" text="3 - Medium Risk" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="orange" text="4 - High Risk" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="red" text="5 - Very High Risk" />
			</div>
		</div>
	</Tooltip>
);

const tooltipObligation = (
	<Tooltip id="tooltip">
		<div className="risk-legend-tooltip">
			<div className="legend-item">
				<CustomColorCell color="yellow" text="Yellow" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="green" text="Green" />
			</div>
			<div className="legend-item">
				<CustomColorCell color="red" text="Red" />
			</div>
		</div>
	</Tooltip>
);

export { tooltipLicense, tooltipObligation };
