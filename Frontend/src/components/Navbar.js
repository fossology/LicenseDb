// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BiSolidDashboard, BiUserCircle } from 'react-icons/bi';
import { TbLicense } from 'react-icons/tb';
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';
import { IoIosLogIn } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';
import { GetTokenSync, Signout } from '../contexts/AuthContext';
import AppLogo from '../assets/images/logo.png';

export default function LicenseDBNavbar() {
	const location = useLocation();
	const [route, setRoute] = useState('');
	const isLoggedIn = GetTokenSync() !== null;
	useEffect(() => {
		setRoute(
			location.pathname.split('/')?.[1] === ''
				? 'dashboard'
				: location.pathname.split('/')?.[1],
		);
	}, [location]);
	return (
		<Navbar expand={false} className="mb-3 border-bottom px-2">
			<Container fluid>
				<Navbar.Brand className="d-flex justify-content-between mb-3">
					<Link to="/">
						<img
							src={AppLogo}
							width={140}
							height={60}
							alt="Fossology Logo"
							className="mt-3"
						/>
					</Link>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="licensedb-sidebar-toggle" />
				<Navbar.Collapse>
					<Nav
						variant="pills"
						activeKey={route}
						className="flex-column"
					>
						<Nav.Item>
							<Nav.Link
								to="/"
								eventKey="dashboard"
								as={Link}
								className="ps-2"
							>
								<BiSolidDashboard size={20} className="mb-1" />{' '}
								Dashboard
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								to="/user"
								eventKey="user"
								as={Link}
								className="ps-2"
							>
								<BiUserCircle size={20} className="mb-1" />{' '}
								Users
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								to="/license"
								eventKey="license"
								as={Link}
								className="ps-2"
							>
								<TbLicense size={20} className="mb-1" /> License
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								to="/obligation"
								eventKey="obligation"
								as={Link}
								className="ps-2"
							>
								<MdOutlineAssignmentTurnedIn
									size={20}
									className="mb-1"
								/>{' '}
								Obligation
							</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link
								to="/operation"
								eventKey="operation"
								as={Link}
								className="ps-2"
							>
								<PiMathOperationsFill
									size={20}
									className="mb-1"
								/>{' '}
								Operation
							</Nav.Link>
						</Nav.Item>
						<div className="d-flex justify-content-center">
							{!isLoggedIn ? (
								<Link to="/signin">
									<IoIosLogIn
										size={25}
										alt="Sign In"
										className="mt-4"
									/>
								</Link>
							) : (
								<div className="d-flex justify-content-between">
									<FaUserCircle
										size={25}
										alt="User Profile"
										className="mt-4"
									/>
									<NavDropdown className="mt-4 ms-1">
										<NavDropdown.Item href="#">
											Profile
										</NavDropdown.Item>
										<NavDropdown.Divider />
										<NavDropdown.Item onClick={Signout}>
											Logout
										</NavDropdown.Item>
									</NavDropdown>
								</div>
							)}
						</div>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
