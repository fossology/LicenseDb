// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import Card from 'react-bootstrap/Card';
import AppLogo from '../assets/images/logo.png';

export default function NotFound() {
	return (
		<>
			<div className="vh-100 d-flex align-items-center justify-content-center">
				<Card className="w-25">
					<Card.Img variant="top" src={AppLogo} />
					<Card.Body>
						<Card.Title className="text-center fs-4">
							404
						</Card.Title>
						<Card.Text className="text-center">
							Page Not Found
						</Card.Text>
					</Card.Body>
				</Card>
			</div>
		</>
	);
}
