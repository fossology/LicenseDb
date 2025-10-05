// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2024 Siemens AG
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { isAxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import AppLogo from '../assets/images/logo.png';

export default function OAuthRedirect() {
	const navigate = useNavigate();
	const auth = useAuth();
	const hasMutated = useRef(false);
	const [error, setError] = useState(null);

	const createUserMutation = useMutation({
		mutationFn: auth.Exchange,
		onError: e => {
			if (isAxiosError(e)) {
				setError(e.message);
			} else {
				setError(e.response.data.error);
			}
		},
		onSuccess: () => {
			return navigate('/');
		},
	});

	useEffect(() => {
		if (createUserMutation.status !== 'idle') {
			return;
		}
		const hash = window.location.hash.substring(1);
		const params = new URLSearchParams(hash);
		const code = params.get('code');
		if (!code || hasMutated.current) return;
		createUserMutation.mutate(code);
		hasMutated.current = true;
	}, [createUserMutation]);

	return (
		<>
			<div className="vh-100 d-flex align-items-center justify-content-center">
				{error ? (
					<Alert variant="danger" className="mt-2 text-center">
						<p>{error}</p>
						<p>
							Try to <Link to="/signin">Login</Link> again
						</p>
					</Alert>
				) : (
					<Card className="w-25">
						<Card.Img variant="top" src={AppLogo} />
						<Card.Body>
							<Card.Title className="text-center">
								Hang Tight!
							</Card.Title>
							<Card.Text className="text-center">
								Login in progress...
							</Card.Text>
						</Card.Body>
					</Card>
				)}
			</div>
		</>
	);
}
