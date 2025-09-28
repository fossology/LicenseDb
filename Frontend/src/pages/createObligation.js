// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: 2025 Chayan Das <01chayandas@gmail.com>

import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import '../styles/createFormView.css';
import Select from 'react-select';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/customStyleSelect';
import { categoryOptions } from '../utils/data/dropdownOptions';
import SimilarityResultList from '../components/SimilarityResultList';

import {
	postObligation,
	fetchObligationTypes,
	fetchObligationClassfications,
	fetchLicensePreviews,
	fetchSimilarObligations,
} from '../api/api';

function CreateObligation() {
	const { data } = useQuery({
		queryKey: ['licenses', 'preview'],
		queryFn: () => fetchLicensePreviews(),
		placeholderData: keepPreviousData,
	});
	const licenseShortNames = (data?.shortnames ?? []).map(x => ({
		label: x,
		value: x,
	}));

	const navigate = useNavigate();

	const { data: obTypes } = useQuery({
		queryKey: ['obligations', 'type'],
		queryFn: () => fetchObligationTypes(),
		placeholderData: keepPreviousData,
	});
	const obligationTypes = (obTypes?.data ?? []).map(item => ({
		value: item.type,
		label: item.type,
	}));

	const { data: obligationClass } = useQuery({
		queryKey: ['obligations', 'classification'],
		queryFn: () => fetchObligationClassfications(),
		placeholderData: keepPreviousData,
	});
	const classOptions = (obligationClass?.data ?? []).map(item => ({
		value: item.classification,
		label: item.classification,
		color: item.color,
	}));

	const initialObligationData = {
		active: true,
		classification: '',
		comment: '',
		modifications: true,
		shortnames: [],
		text: '',
		text_updatable: true,
		topic: '',
		type: '',
		category: 'GENERAL',
	};

	const [obligationData, setObligationData] = useState(initialObligationData);
	const [similarObligations, setSimilarObligations] = useState([]);
	const [selectedValues, setSelectedValues] = useState([]);
	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (obligationData.text) {
				fetchSimilarObligations(obligationData.text)
					.then(res => {
						setSimilarObligations(res.data);
					})
					.catch(err => {
						setSimilarObligations([]);
					});
			} else {
				setSimilarObligations([]);
			}
		}, 500); // debounce time

		return () => clearTimeout(delayDebounce);
	}, [obligationData.text]);

	const handleChange = e => {
		if (e && e.target) {
			const { name, value, type, checked } = e.target;
			const fieldValue = type === 'checkbox' ? checked : value;
			setObligationData({
				...obligationData,
				[name]: fieldValue,
			});
		}
	};
	const handleLicenseChange = selectedOptions => {
		setSelectedValues(selectedOptions || []);
		const values = selectedOptions
			? selectedOptions.map(option => option.value)
			: [];
		setObligationData({
			...obligationData,
			shortnames: values,
		});
	};
	const handleTypeChange = e => {
		setObligationData({
			...obligationData,
			type: e.value,
		});
	};
	const handleCategoryChange = e => {
		setObligationData({
			...obligationData,
			category: e.value,
		});
	};

	const mutation = useMutation({
		mutationFn: postObligation,
		onError: error => {
			toast.error(
				`Obligation creation failed: ${error.response.data.error}`,
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
		onSuccess: data => {
			toast.success('Obligation created successfully!', {
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
			obligationPayload: obligationData,
		});
	};

	const handleReset = () => {
		setSelectedValues([]);
		setObligationData({ ...initialObligationData });
	};

	return (
		<div className="create-license-div">
			<h5 className="header-title">Create New Obligation</h5>
			<Form className="create-form-parent" onSubmit={handleSubmit}>
				<Row>
					<Col>
						<Row>
							<Form.Group className="form-fields">
								<Form.Label className="d-inline-flex">
									Topic
								</Form.Label>
								<span className="ms-1 text-danger">*</span>
								<Form.Control
									type="text"
									name="topic"
									value={obligationData.topic}
									onChange={handleChange}
									placeholder="Enter topic"
									required
								/>
							</Form.Group>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Type
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<Select
										value={
											obligationTypes?.find(
												option =>
													option.value ===
													obligationData['type'],
											) || null
										}
										options={obligationTypes}
										onChange={handleTypeChange}
										isSearchable
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Category
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<Select
										defaultValue={
											categoryOptions.filter(
												elem =>
													elem.value ===
													obligationData.category,
											)[0]
										}
										options={categoryOptions}
										name="category"
										onChange={handleCategoryChange}
										required
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label className="d-inline-flex">
										Classification
									</Form.Label>
									<span className="ms-1 text-danger">*</span>
									<CustomSelect
										name="classification"
										options={classOptions}
										payload={obligationData}
										setPayload={setObligationData}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label>Associated Licenses</Form.Label>
									<Select
										options={licenseShortNames}
										value={selectedValues}
										onChange={handleLicenseChange}
										closeMenuOnSelect={false}
										isSearchable
										isMulti
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Label>Comments</Form.Label>
									<Form.Control
										type="text"
										name="comment"
										value={obligationData.comment}
										onChange={handleChange}
										placeholder="Enter comment"
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-fields">
									<Form.Check
										type="checkbox"
										label="Text Updatable"
										name="text_updatable"
										value={obligationData.text_updatable}
										onChange={handleChange}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="form-fields">
									<Form.Check
										type="checkbox"
										label="Active"
										name="active"
										checked={obligationData.active}
										onChange={handleChange}
									/>
								</Form.Group>
							</Col>
						</Row>
					</Col>
					<Col>
						<Form.Group className="form-fields">
							<Form.Label>Full Text *</Form.Label>
							<Form.Control
								className="text-area"
								as="textarea"
								rows={5}
								placeholder="Enter text"
								name="text"
								value={obligationData.text}
								onChange={handleChange}
								required
							/>
						</Form.Group>
						{obligationData.text && (
							<SimilarityResultList
								list={similarObligations}
								header="Obligation"
								text={obligationData.text}
							/>
						)}
					</Col>
				</Row>

				<Button variant="outline-success" type="submit">
					Save Obligation
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
					onClick={() => navigate('/obligation')}
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

export default CreateObligation;
