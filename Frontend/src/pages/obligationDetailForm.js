// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import '../styles/detailViewForm.css';
import {
	useQuery,
	useMutation,
	useQueryClient,
	keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Select from 'react-select';
import PropTypes from 'prop-types';
import CustomSelect from '../components/customStyleSelect';
import ToolTipLabel from '../components/tooltip/tooltipLabel';
import ToolTipLegend from '../components/tooltip/tooltipLegend';
import { tooltipObligation } from '../components/tooltip/tooltips';
import { categoryOptions } from '../utils/data/dropdownOptions';
import {
	updateObligation,
	fetchLicensePreviews,
	fetchObligationTypes,
	fetchObligationClassfications,
	updateObligationWithLicenses,
	fetchSimilarObligations,
} from '../api/api';
import SimilarityResultList from '../components/SimilarityResultList';

function ObligationDetailForm({
	obligationPayload,
	setObligationPayload,
	page,
	perPage,
	sortOrder,
}) {
	const queryClient = useQueryClient();
	const [similarObligations, setSimilarObligations] = useState([]);
	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (obligationPayload.text) {
				fetchSimilarObligations(obligationPayload.text)
					.then(res => {
						let filtered = res.data || [];
						filtered = filtered.filter(
							item => item.topic !== obligationPayload.topic,
						);
						setSimilarObligations(filtered);
					})
					.catch(err => {
						setSimilarObligations([]);
					});
			} else {
				setSimilarObligations([]);
			}
		}, 500); // debounce time

		return () => clearTimeout(delayDebounce);
	}, [obligationPayload.text, obligationPayload.topic]);

	const { data: obligationTypes } = useQuery({
		queryKey: ['obligations', 'type'],
		queryFn: () => fetchObligationTypes(),
		placeholderData: keepPreviousData,
	});
	const typeOptions = obligationTypes?.data.map(item => ({
		value: item.type,
		label: item.type,
	}));

	const [selectedLicenses, setSelectedLicenses] = useState([]);
	const { data: licenseShortNames } = useQuery({
		queryKey: ['licenses', 'preview'],
		queryFn: () => fetchLicensePreviews(),
		placeholderData: keepPreviousData,
	});
	const licenseOptions = licenseShortNames?.shortnames?.map(shortname => ({
		value: shortname,
		label: shortname,
	}));
	useEffect(() => {
		const defaultLicenses =
			obligationPayload.shortnames?.map(shortname => ({
				value: shortname,
				label: shortname,
			})) || [];
		setSelectedLicenses(defaultLicenses);
	}, [obligationPayload]);

	const { data: obligationClass } = useQuery({
		queryKey: ['obligations', 'classification'],
		queryFn: () => fetchObligationClassfications(),
		placeholderData: keepPreviousData,
	});
	const classOptions = obligationClass?.data.map(item => ({
		value: item.classification,
		label: item.classification,
		color: item.color,
	}));

	const mutation = useMutation({
		mutationFn: updateObligation,
		onError: error => {
			toast.error(
				`Obligation update failed: ${error.response.data.error}`,
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
			toast.success('Obligation updated successfully!', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});

			queryClient.setQueryData(
				['obligations', page, perPage, sortOrder],
				oldData => {
					const newData = {
						...oldData,
						data: oldData?.data.map(lic => {
							if (lic.topic === data.data[0].topic) {
								return {
									...data.data[0], // Updated obligation from mutation response
									shortnames:
										obligationPayload.shortnames ||
										lic.shortnames, // Merge shortnames
								};
							} else {
								return lic;
							}
						}),
					};
					return newData;
				},
			);
			queryClient.invalidateQueries('audits');
		},
	});
	const handleInputChange = e => {
		const { name, value } = e.target;
		setObligationPayload({
			...obligationPayload,
			[name]: value,
		});
	};

	const licenseMutation = useMutation({
		mutationFn: updateObligationWithLicenses,
		onError: error => {
			toast.error(
				`Could not add licenses: ${error.response.data.error}`,
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
			toast.success('Associated licenses added successfully!', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
			queryClient.invalidateQueries('audits');
		},
	});

	const handleLicenseChange = associatedLicenses => {
		setObligationPayload({
			...obligationPayload,
			['shortnames']: associatedLicenses?.map(x => x.value),
		});
	};

	const defaultClass = classOptions?.filter(
		x => x.label === obligationPayload.classification,
	)[0];
	const defaultType = typeOptions?.filter(
		x => x.value === obligationPayload.type,
	)[0];

	const handleTypeChange = type => {
		setObligationPayload({
			...obligationPayload,
			['type']: type.value,
		});
	};

	const handleSubmit = async e => {
		e.preventDefault();
		const updatedMap = obligationPayload.shortnames?.map(x => x);

		licenseMutation.mutate({
			associated_licenses: { shortnames: updatedMap },
			topic: obligationPayload.topic,
		});

		mutation.mutate({
			obligationPayload,
			topic: obligationPayload.topic,
		});
	};

	const handleCategoryChange = e => {
		setObligationPayload({
			...obligationPayload,
			category: e.value,
		});
	};

	return (
		<div className="detail-form-parent mb-5 shadow-sm">
			<Form className="obligation-form" onSubmit={handleSubmit}>
				<Row>
					<Col>
						<Row>
							<Col>
								<Row>
									<Form.Group className="form-group-text">
										<Form.Label>
											<ToolTipLabel
												label={'Obligation/Risk Topic'}
												tooltipText={
													'Obligation or Risk Topic'
												}
											/>
										</Form.Label>
										<Form.Control
											type="text"
											placeholder="Obligation topic"
											name="topic"
											value={obligationPayload.topic}
											onChange={handleInputChange}
											readOnly
											disabled
										/>
									</Form.Group>
								</Row>
								<Row>
									<Form.Group className="form-group-text">
										<Form.Label>
											<ToolTipLabel
												label={'Associated Licenses'}
												tooltipText={
													'Associated Licenses'
												}
											/>
										</Form.Label>
										<Select
											options={licenseOptions}
											value={selectedLicenses}
											isSearchable
											closeMenuOnSelect={false}
											isMulti
											onChange={handleLicenseChange}
										/>
									</Form.Group>
								</Row>
								<Row className="d-flex justify-content-between">
									<Col>
										<Form.Group className="form-group-text">
											<Form.Label>
												<ToolTipLegend
													tooltip={tooltipObligation}
													label={'Classification'}
												/>
											</Form.Label>
											{classOptions && (
												<CustomSelect
													options={classOptions}
													selectedValue={defaultClass}
													name="classification"
													payload={obligationPayload}
													setPayload={
														setObligationPayload
													}
												/>
											)}
										</Form.Group>
									</Col>
									<Col>
										<Form.Group className="form-fields">
											<ToolTipLabel
												label={'Category'}
												tooltipText={'Category'}
											/>
											<Select
												value={
													categoryOptions.filter(
														elem =>
															elem.value ===
															obligationPayload.category,
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
										<Form.Group className="form-group-text">
											<Form.Label>
												<ToolTipLabel
													label={'Type'}
													tooltipText={'Type'}
												/>
											</Form.Label>
											<Select
												options={typeOptions}
												value={defaultType}
												onChange={handleTypeChange}
												isSearchable
											/>
										</Form.Group>
									</Col>
								</Row>
							</Col>
							<Col>
								<Form.Group className="form-group-text">
									<Form.Label>
										<ToolTipLabel
											label={'Full Text'}
											tooltipText={'Full Text'}
										/>
									</Form.Label>
									<Form.Control
										className="text-area"
										as="textarea"
										placeholder="Full text"
										name="text"
										value={obligationPayload.text}
										onChange={handleInputChange}
									/>
								</Form.Group>
								{obligationPayload.text && (
									<SimilarityResultList
										list={similarObligations}
										header="Obligation"
										text={obligationPayload.text}
										label={obligationPayload.topic}
									/>
								)}
							</Col>
						</Row>
					</Col>
				</Row>

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
						Update Obligation
					</button>
				</div>
			</Form>
		</div>
	);
}

ObligationDetailForm.propTypes = {
	obligationPayload: PropTypes.shape({
		topic: PropTypes.string.isRequired,
		text: PropTypes.string,
		shortnames: PropTypes.arrayOf(PropTypes.string),
		classification: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		category: PropTypes.string.isRequired,
	}).isRequired,
	setObligationPayload: PropTypes.func.isRequired,
	page: PropTypes.number.isRequired,
	perPage: PropTypes.number.isRequired,
	sortOrder: PropTypes.string.isRequired,
};

export default ObligationDetailForm;
