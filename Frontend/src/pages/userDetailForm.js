// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form } from 'react-bootstrap';
import '../styles/detailViewForm.css';
import Select from 'react-select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { accessLevelOptions } from '../utils/data/dropdownOptions';
import { updateUser } from '../api/api';
import 'react-toastify/dist/ReactToastify.css';

function UserDetailForm({ userPayload, setUserPayload, page, perPage }) {
	const queryClient = useQueryClient();

	const handleInputChange = e => {
		const { name, value } = e.target;
		setUserPayload({
			...userPayload,
			[name]: value,
		});
	};

	const updateUserMutation = useMutation({
		mutationFn: updateUser,
		onError: error => {
			toast.error(`User update failed: ${error.response.data.error}`, {
				position: 'top-right',
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light',
			});
		},
		onSuccess: data => {
			if (data.status === 200) {
				toast.success('User updated successfully!', {
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'dark',
				});
				queryClient.setQueryData(['users', page, perPage], oldData => {
					const newData = {
						...oldData,
						data: oldData.data.map(user => {
							if (user.user_name === data.data[0].user_name) {
								return data.data[0];
							} else {
								return user;
							}
						}),
					};
					return newData;
				});
				queryClient.invalidateQueries('audits');
			}
		},
	});

	return (
		<div className="detail-form-parent mb-5 shadow-sm obligation-form">
			<Form className="user-form">
				<Row>
					<Col>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>User Name</Form.Label>
								<Form.Control
									type="text"
									placeholder="user name"
									value={userPayload.user_name}
									disabled
								/>
							</Form.Group>
						</Row>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>User Email</Form.Label>
								<Form.Control
									type="email"
									placeholder="user email"
									name="user_email"
									value={userPayload.user_email}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Row>
					</Col>
					<Col>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>Display Name</Form.Label>
								<Form.Control
									type="text"
									placeholder="display name"
									name="display_name"
									value={userPayload.display_name}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Row>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>Access Level</Form.Label>
								<Select
									options={accessLevelOptions}
									name="user_level"
									value={accessLevelOptions.filter(
										elem =>
											elem.value ===
											userPayload.user_level,
									)}
									onChange={user =>
										setUserPayload({
											...userPayload,
											user_level: user.value,
										})
									}
								/>
							</Form.Group>
						</Row>
					</Col>
				</Row>
				<div className="w-100 d-flex justify-content-center">
					<button
						type="button"
						className="btn btn-primary"
						disabled={updateUserMutation.isPending}
						onClick={e => {
							updateUserMutation.mutate({
								userPayload,
								username: userPayload.user_name,
							});
						}}
					>
						{updateUserMutation.isPending && (
							<span
								className="spinner-border spinner-border-sm me-1"
								role="status"
							></span>
						)}
						Update User
					</button>
				</div>
			</Form>
		</div>
	);
}

UserDetailForm.propTypes = {
	userPayload: PropTypes.shape({
		user_name: PropTypes.string.isRequired,
		user_email: PropTypes.string.isRequired,
		display_name: PropTypes.string.isRequired,
		user_level: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
			.isRequired,
	}).isRequired,
	setUserPayload: PropTypes.func.isRequired,
	page: PropTypes.number.isRequired,
	perPage: PropTypes.number.isRequired,
};

export default UserDetailForm;
