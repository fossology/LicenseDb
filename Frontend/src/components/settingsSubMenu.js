// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2024 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import { Container, Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { IoSettings } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GetTokenSync, GetUser } from '../contexts/AuthContext';

const SettingsSubMenu = ({ route }) => {
	const isLoggedIn = GetTokenSync() !== null;
	const user = GetUser();
	return (
		<>
			{isLoggedIn &&
				['ADMIN', 'SUPER_ADMIN'].indexOf(user.user_level) !== -1 && (
					<OverlayTrigger
						placement="right"
						overlay={<Tooltip id="tooltip-icon">Settings</Tooltip>}
					>
						<Nav.Link
							to={`/${route}/settings`}
							eventKey={route}
							as={Link}
							className="ps-2"
						>
							<Container style={{ justifyContent: 'flex-end' }}>
								<span>
									<IoSettings />
								</span>
							</Container>
						</Nav.Link>
					</OverlayTrigger>
				)}
		</>
	);
};

SettingsSubMenu.propTypes = {
	route: PropTypes.string.isRequired,
};

export default SettingsSubMenu;
