// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: 2025 Chayan Das <01chayandas@gmail.com>

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import '../styles/createFormView.css';
import CustomSelect from '../components/customStyleSelect';
import { riskOptions } from '../utils/data/dropdownOptions';
import { postLicense, fetchSimilarLicenses } from '../api/api';
import { loadYaml } from '../utils/loadYaml';
import { resolveComponentPath } from '../utils/componentPathMap';
import SimilarityResultList from '../components/SimilarityResultList';

function CreateLicense() {
	const [fields, setFields] = useState([]);
	const initialLicenseData = {
		external_ref: {},
		detector_type: 1,
		flag: 1,
		shortname: '',
		spdx_id: '',
		fullname: '',
		url: '',
		notes: '',
		active: true,
		copyleft: false,
		OSIapproved: false,
		risk: null,
		source: '',
		marydone: true,
		FSFfree: true,
		Fedora: '',
		GPLv2compatible: true,
		GPLv3compatible: true,
		text_updatable: false,
	};
	const [licenseData, setLicenseData] = useState(initialLicenseData);
	const [similarLicenses, setSimilarLicenses] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchConfig = async () => {
			const config = await loadYaml(
				`${process.env.PUBLIC_URL}/externalRef.yaml`,
			);
			setFields(config.fields);
		};

		fetchConfig();
	}, []);

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (licenseData.text) {
				fetchSimilarLicenses(licenseData.text)
					.then(res => {
						setSimilarLicenses(res.data);
					})
					.catch(err => {
						setSimilarLicenses([]);
					});
			} else {
				setSimilarLicenses([]);
			}
		}, 500); // debounce time

		return () => clearTimeout(delayDebounce);
	}, [licenseData.text]);

	const handleChange = e => {
		if (e && e.target) {
			const { name, value, type, checked } = e.target;
			const fieldValue = type === 'checkbox' ? checked : value;
			setLicenseData(prevData => ({
				...prevData,
				[name]: fieldValue,
			}));
		} else {
			const { name, value } = e.target;
			setLicenseData(prevData => ({
				...prevData,
				[name]: value,
			}));
		}
	};

	const handleChangeExt = e => {
		if (e && e.target) {
			const { name, value, type, checked } = e.target;
			const fieldValue = type === 'checkbox' ? checked : value;
			setLicenseData(prevData => ({
				...prevData,
				external_ref: {
					...prevData.external_ref,
					[name]: fieldValue,
				},
			}));
		} else {
			const { name, value } = e.target;
			setLicenseData(prevData => ({
				...prevData,
				external_ref: {
					...prevData.external_ref,
					[name]: value,
				},
			}));
		}
	};

	const mutation = useMutation({
		mutationFn: postLicense,
		onError: error => {
			toast.error(
				`License creation failed: ${error.response.data.error}`,
				{
					position: 'top-right',
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'dark',
				},
			);
		},
		onSuccess: () => {
			toast.success('License created successfully!', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
		},
	});

	const handleSubmit = async e => {
		e.preventDefault();
		mutation.mutate({
			licensePayload: licenseData,
		});
	};

	const handleReset = () => {
		setLicenseData({ ...initialLicenseData });
	};

	const renderFormField = field => {
		const { formComponentPath, name, componentType, label } = field;
		const Component = resolveComponentPath(formComponentPath);

		return (
			<Row key={name}>
				<Col>
					<Form.Group
						className={`form-fields form-group-${componentType}`}
					>
						<React.Suspense fallback={<div>Loading...</div>}>
							<Component
								label={label}
								name={name}
								value={licenseData.external_ref[name] || ''}
								checked={
									componentType === 'checkbox'
										? licenseData.external_ref[name] ||
											false
										: undefined
								}
								onChange={handleChangeExt}
							/>
						</React.Suspense>
					</Form.Group>
				</Col>
			</Row>
		);
	};

	return (
		<div className="create-license-div">
			<h5 className="header-title">Create New License</h5>
			<Form
				className="create-form-parent mb-5 shadow-sm"
				onSubmit={handleSubmit}
			>
				<Row>
					<Col>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Short Name
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<Form.Control
										type="text"
										name="shortname"
										value={licenseData.shortname}
										placeholder="Enter short name"
										onChange={handleChange}
										required
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										SPDX Expression
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<Form.Control
										type="text"
										name="spdx_id"
										value={licenseData.spdx_id}
										placeholder="Enter SPDX Expression"
										onChange={handleChange}
										required
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Full Name
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<Form.Control
										type="text"
										name="fullname"
										value={licenseData.fullname}
										placeholder="Enter full name"
										onChange={handleChange}
										required
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label>URL</Form.Label>
									<Form.Control
										type="url"
										name="url"
										value={licenseData.url}
										placeholder="Enter Source URL"
										onChange={handleChange}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label>Notes</Form.Label>
									<Form.Control
										type="text"
										name="notes"
										value={licenseData.notes}
										placeholder="Enter notes"
										onChange={handleChange}
									/>
								</Form.Group>
							</Col>
						</Row>
						<div className="form-checkboxes">
							<Row>
								<Col>
									<Form.Group className="form-group-checkbox">
										<Form.Check
											type="checkbox"
											label="Active"
											name="active"
											checked={licenseData.active}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group className="form-group-checkbox">
										<Form.Check
											type="checkbox"
											label="Copy Left"
											name="copyleft"
											value={licenseData.copyleft}
											checked={licenseData.copyleft}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group className="form-group-checkbox">
										<Form.Check
											type="checkbox"
											label="OSI Approved"
											name="OSIapproved"
											checked={licenseData.OSIapproved}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group className="form-group-checkbox">
										<Form.Check
											type="checkbox"
											label="Text Updatable"
											name="text_updatable"
											value={licenseData.text_updatable}
											checked={
												licenseData.text_updatable ||
												false
											}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
							</Row>
						</div>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Risk
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<CustomSelect
										options={riskOptions}
										name="risk"
										payload={licenseData}
										setPayload={setLicenseData}
										onChange={handleChange}
										required
									/>
								</Form.Group>
							</Col>
						</Row>

						{/* Dynamically render fields */}
						<div className="ext-fields">
							{fields.map(field => renderFormField(field))}
						</div>
					</Col>
					<Col>
						<Form.Group className="form-fields">
							<Form.Label className="d-inline-flex">
								License Text
							</Form.Label>
							<span className="ms-1 text-danger">*</span>
							<Form.Control
								className="text-area"
								as="textarea"
								rows={10}
								placeholder="Enter text"
								name="text"
								value={licenseData.text}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						{licenseData.text && (
							<SimilarityResultList
								list={similarLicenses}
								header="License"
								text={licenseData.text}
							/>
						)}
					</Col>
				</Row>

				<Button variant="outline-success" type="submit">
					Save License
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
					onClick={() => navigate('/license')}
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

export default CreateLicense;
