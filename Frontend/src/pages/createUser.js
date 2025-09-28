// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import { Form, Row, Col, Button } from 'react-bootstrap';
import '../styles/createFormView.css';
import Select from 'react-select';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postUser } from '../api/api';
import { accessLevelOptions } from '../utils/data/dropdownOptions';

function CreateUser() {
	const navigate = useNavigate();
	const [userData, setUserData] = useState({
		user_name: '',
		user_email: '',
		display_name: '',
		user_level: '',
		user_password: '',
	});

	const handleChange = e => {
		const { name, value } = e.target;
		setUserData({
			...userData,
			[name]: value,
		});
	};

	const handleLevelChange = e => {
		setUserData({
			...userData,
			user_level: e.value,
		});
	};

	const mutation = useMutation({
		mutationFn: postUser,
		onError: error => {
			toast.error(`User creation failed: ${error.response.data.error}`, {
				position: 'top-right',
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
		},
		onSuccess: data => {
			toast.success('User created successfully!', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
			navigate('/user');
		},
	});

	const handleSubmit = async e => {
		e.preventDefault();
		mutation.mutate({
			userPayload: userData,
		});
	};

	const handleReset = () => {
		setUserData({
			user_name: '',
			user_email: '',
			display_name: '',
			user_level: '',
			user_password: '',
		});
	};

	return (
		<div className="create-license-div">
			<h5 className="header-title">Create New User</h5>
			<Form className="create-form-parent" onSubmit={handleSubmit}>
				<Row>
					<Col>
						<Row>
							<Col>
								<Row>
									<Form.Group className="form-fields">
										<Form.Label>User Name</Form.Label>
										<Form.Control
											type="text"
											name="user_name"
											value={userData.user_name}
											placeholder="Enter user name"
											onChange={handleChange}
										/>
									</Form.Group>
								</Row>
								<Row>
									<Form.Group className="form-fields">
										<Form.Label>User Email</Form.Label>
										<Form.Control
											type="email"
											name="user_email"
											value={userData.user_email}
											placeholder="Enter user email"
											onChange={handleChange}
										/>
									</Form.Group>
								</Row>
							</Col>
							<Col>
								<Row>
									<Form.Group className="form-fields">
										<Form.Label>Display Name</Form.Label>
										<Form.Control
											type="text"
											name="display_name"
											value={userData.display_name}
											placeholder="Enter display name"
											onChange={handleChange}
										/>
									</Form.Group>
								</Row>
								<Row>
									<Form.Group className="form-fields">
										<Form.Label>Access Level</Form.Label>
										<Select
											defaultValue={accessLevelOptions.filter(
												elem => elem.value === 'User',
											)}
											options={accessLevelOptions}
											onChange={handleLevelChange}
											isSearchable
										/>
									</Form.Group>
								</Row>
							</Col>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label>Password</Form.Label>
									<Form.Control
										type="password"
										name="user_password"
										value={userData.user_password}
										placeholder="Enter password"
										onChange={handleChange}
									/>
								</Form.Group>
							</Col>
						</Row>
					</Col>
				</Row>

				<Button variant="outline-success" type="submit">
					Save User
				</Button>
				<Button
					onClick={handleReset}
					type="button"
					className="ms-2"
					variant="outline-warning"
				>
					Reset
				</Button>
				<Button
					onClick={() => navigate('/user')}
					type="button"
					className="ms-2"
					variant="outline-danger"
				>
					Cancel
				</Button>
			</Form>
		</div>
	);
}

export default CreateUser;
