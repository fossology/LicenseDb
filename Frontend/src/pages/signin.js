// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import { useState } from 'react';
import { Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signin.css';
import { useMutation } from '@tanstack/react-query';
import Alert from 'react-bootstrap/Alert';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import AppLogo from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';

function Signin() {
	const navigate = useNavigate();
	const auth = useAuth();
	const [userCredentials, setUserCredentials] = useState({
		username: '',
		password: '',
	});

	const handleChange = e => {
		setUserCredentials({
			...userCredentials,
			[e.target.name]: e.target.value,
		});
	};

	const mutation = useMutation({
		mutationFn: auth.Signin,
		onSuccess: () => {
			return navigate('/');
		},
	});

	const handleSubmit = e => {
		e.preventDefault();
		mutation.mutate(userCredentials);
	};

	return (
		<div className="signin-form p-4 pt-0">
			<div className="row mb-3">
				<IoArrowBackCircleOutline
					size={30}
					id="go-back"
					className="col-auto mt-4 mx-0"
					onClick={() => navigate('/')}
				/>
				<Navbar.Brand className="col text-center">
					<Link to="/">
						<img
							src={AppLogo}
							width={230}
							height={71}
							alt="Fossology Logo"
							className="mt-1"
						/>
					</Link>
				</Navbar.Brand>
				<div className="col-2"></div>
			</div>
			<div className="row">
				{process.env.REACT_APP_PROVIDER !== 'oidc' && (
					<>
						<h4>Login</h4>
						<form onSubmit={handleSubmit}>
							<div className="form-fields mb-3">
								<label
									htmlFor="userCredentials.userName"
									className="form-label"
								>
									User name
								</label>
								<input
									type="text"
									className="form-control"
									id="userCredentials.userName"
									name="username"
									value={userCredentials.username}
									onChange={handleChange}
									placeholder="Enter username"
								/>
							</div>

							<div className="form-fields mb-3">
								<label
									htmlFor="userCredentials.password"
									className="form-label"
								>
									Password
								</label>
								<input
									type="password"
									className="form-control"
									id="userCredentials.password"
									name="password"
									value={userCredentials.password}
									onChange={handleChange}
									placeholder="Enter Password"
								/>
							</div>

							<div className="w-100 d-flex justify-content-center">
								<button
									type="submit"
									className="btn btn-primary"
									disabled={mutation.isPending}
								>
									{mutation.isPending && (
										<span
											className="spinner-border spinner-border-sm me-1"
											role="status"
										></span>
									)}
									Sign In
								</button>
							</div>
						</form>
					</>
				)}
				{process.env.REACT_APP_PROVIDER === 'oidc' && (
					<div className="w-100 d-flex justify-content-center mt-1">
						<button
							className="btn btn-primary"
							onClick={() => auth.OidcSignin()}
						>
							Login with OIDC Provider
						</button>
					</div>
				)}

				{process.env.REACT_APP_PROVIDER !== 'oidc' &&
					mutation.isError && (
						<Alert variant="danger" className="mt-2" dismissible>
							{mutation.error.message}
						</Alert>
					)}
			</div>
		</div>
	);
}

export default Signin;
