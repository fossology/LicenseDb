// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { Link } from 'react-router-dom';
import '../styles/dashboard.css';
import PropTypes from 'prop-types';

function CardWithLogo({ icon, mainText, subText, routeName }) {
	return (
		<Link to={routeName} className="card-link">
			<div className="card widget-card border-light shadow-sm h-100">
				<div className="card-body p-4">
					<div className="row">
						<div className="col-8 d-flex flex-column h-100">
							<h5 className="card-title widget-card-title mb-3 align-items-start fw-bold">
								{mainText}
							</h5>
							<h4 className="card-subtitle text-body-secondary m-0 align-items-end fw-bold">
								{subText}
							</h4>
						</div>
						<div className="col-4">{icon}</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

CardWithLogo.propTypes = {
	mainText: PropTypes.string.isRequired,
	subText: PropTypes.string.isRequired,
	icon: PropTypes.node.isRequired,
	routeName: PropTypes.node.isRequired,
};

export default CardWithLogo;
