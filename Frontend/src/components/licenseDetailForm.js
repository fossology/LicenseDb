// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import '../styles/detailViewForm.css';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Select from 'react-select';
import { TbListDetails } from 'react-icons/tb';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import CustomSelect from '../components/customStyleSelect';
import { riskOptions } from '../utils/data/dropdownOptions';
import ToolTipLegend from './tooltip/tooltipLegend';
import ToolTipLabel from './tooltip/tooltipLabel';
import { tooltipLicense } from './tooltip/tooltips';
import SimilarityResultList from '../components/SimilarityResultList';
import {
	fetchObligationPreviews,
	updateLicense,
	fetchObligationsOfLicense,
	updateObligationsOfLicense,
	fetchSimilarLicenses,
} from '../api/api';
import 'react-toastify/dist/ReactToastify.css';
import { loadYaml } from '../utils/loadYaml';
import { resolveComponentPath } from '../utils/componentPathMap';

function LicenseDetailForm({
	licensePayload,
	setLicensePayload,
	page,
	perPage,
	sortField,
	sortOrder,
}) {
	const [showModal, setShowModal] = useState(false);
	const [finalObligations, setFinalObligations] = useState([]);
	const queryClient = useQueryClient();
	const [fields, setFields] = useState([]);
	const [similarLicenses, setSimilarLicenses] = useState([]);

	useEffect(() => {
		const fetchConfig = async () => {
			const config = await loadYaml(
				`${process.env.PUBLIC_URL}/externalRef.yaml`,
			);
			setFields(config.fields);
		};

		fetchConfig();
	}, []);

	const {
		isPending: isObligationsPreviewQueryPending,
		isError: isObligationListFetchError,
		error: obligationListFetchError,
		data: allObligationData,
	} = useQuery({
		queryKey: ['obligations', 'preview'],
		queryFn: () => fetchObligationPreviews(),
	});

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (licensePayload.text) {
				fetchSimilarLicenses(licensePayload.text)
					.then(res => {
						let filtered = res.data || [];
						filtered = filtered.filter(
							item => item.shortname !== licensePayload.shortname,
						);
						setSimilarLicenses(filtered);
					})
					.catch(err => {
						setSimilarLicenses([]);
					});
			} else {
				setSimilarLicenses([]);
			}
		}, 500); // debounce time

		return () => clearTimeout(delayDebounce);
	}, [licensePayload.text, licensePayload.shortname]);

	if (isObligationListFetchError) {
		toast.error(
			`Unable to fetch list of obligations: ${obligationListFetchError.message}`,
			{
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light',
			},
		);
	}

	const {
		isPending: isLicenseObligationsQueryPending,
		isError: isLicenseObligationsFetchError,
		error: licenseObligationsFetchError,
		data: licenseObligationsData,
	} = useQuery({
		queryKey: ['license', 'obligations', licensePayload.shortname],
		queryFn: () =>
			fetchObligationsOfLicense({ shortname: licensePayload.shortname }),
	});

	if (isLicenseObligationsFetchError) {
		toast.error(
			`Unable to fetch attached obligations: ${licenseObligationsFetchError.message}`,
			{
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light',
			},
		);
	}

	const updateLicenseMutation = useMutation({
		mutationFn: updateLicense,
		onError: error => {
			toast.error(`License update failed: ${error.response.data.error}`, {
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
				toast.success('License updated successfully!', {
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
					['licenses', page, perPage, sortField, sortOrder],
					oldData => {
						const newData = {
							...oldData,
							data: oldData.data.map(lic => {
								if (lic.shortname === data.data[0].shortname) {
									return data.data[0];
								} else {
									return lic;
								}
							}),
						};
						return newData;
					},
				);
				queryClient.invalidateQueries('audits');
			}
		},
	});

	const updateLicenseObligationsMutation = useMutation({
		mutationFn: updateObligationsOfLicense,
		onError: error => {
			toast.error(
				`License obligations update failed: ${error.response.data.error}`,
				{
					position: 'top-right',
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'light',
				},
			);
		},
		onSuccess: () => {
			toast.success('License obligations updated successfully!', {
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

	const handleInputChange = e => {
		const { name, value } = e.target;
		setLicensePayload({
			...licensePayload,
			[name]: value,
		});
	};

	const handleChangeExt = e => {
		if (e && e.target) {
			const { name, value, type, checked } = e.target;
			const fieldValue = type === 'checkbox' ? checked : value;
			setLicensePayload(prevData => ({
				...prevData,
				external_ref: {
					...prevData.external_ref,
					[name]: fieldValue,
				},
			}));
		} else {
			const { name, value } = e.target;
			setLicensePayload(prevData => ({
				...prevData,
				external_ref: {
					...prevData.external_ref,
					[name]: value,
				},
			}));
		}
	};

	const handleCheckboxChange = e => {
		const { name, checked } = e.target;
		setLicensePayload({
			...licensePayload,
			[name]: checked,
		});
	};

	const renderFormField = field => {
		const { formComponentPath, name, componentType, label } = field;
		const Component = resolveComponentPath(formComponentPath);

		// Determine the props to pass to the component based on its type
		const componentProps = {
			label,
			name,
			value: licensePayload.external_ref[name],
			onChange: handleChangeExt,
		};
		// Add the "checked" prop conditionally for checkboxes
		if (componentType === 'checkbox') {
			componentProps.checked = !!licensePayload.external_ref[name];
		} else {
			// Ensure value is not undefined, fallback to empty string for normal inputs
			componentProps.value =
				licensePayload.external_ref[name] !== undefined
					? licensePayload.external_ref[name]
					: '';
		}
		return (
			<Row key={name}>
				<Col>
					<Form.Group
						className={`form-fields form-group-${componentType}`}
					>
						<React.Suspense fallback={<div>Loading...</div>}>
							{componentType === 'checkbox' ? (
								<div className="form-check">
									<input
										type="checkbox"
										id={name}
										{...componentProps} // Add props explicitly
										className="form-check-input" // Bootstrap class for checkboxes
									/>
									<label
										htmlFor={name}
										className="form-check-label"
									>
										{label}
									</label>
								</div>
							) : (
								<Component {...componentProps} />
							)}
						</React.Suspense>
					</Form.Group>
				</Col>
			</Row>
		);
	};

	return (
		<div className="detail-form-parent mb-5 shadow-sm">
			<Form className="license-form">
				<Row>
					<Col>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>
									<ToolTipLabel
										label={'Short Name'}
										tooltipText={'Short Name'}
									/>
								</Form.Label>
								<Form.Control
									type="text"
									placeholder="Short Name"
									name="shortname"
									value={licensePayload.shortname}
									readOnly
									disabled
								/>
							</Form.Group>
						</Row>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label>
									<ToolTipLabel
										label={'Full Name'}
										tooltipText={'Full Name'}
									/>
								</Form.Label>
								<Form.Control
									type="text"
									placeholder="Full Name"
									name="fullname"
									value={licensePayload.fullname}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Row>
						<Row>
							<Col>
								<Form.Group className="form-group-text">
									<Form.Label>
										<ToolTipLabel
											label={'SPDX Expression'}
											tooltipText={'SPDX Expression'}
										/>
									</Form.Label>
									<Form.Control
										type="text"
										placeholder="SPDX Expression"
										name="spdx_id"
										value={licensePayload.spdx_id}
										onChange={handleInputChange}
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="form-group-text">
									<Form.Label>
										<ToolTipLegend
											tooltip={tooltipLicense}
											label={'Risk'}
										/>
									</Form.Label>
									<CustomSelect
										selectedValue={
											riskOptions.filter(
												x =>
													x.value ===
													licensePayload.risk,
											)[0]
										}
										name={'risk'}
										options={riskOptions}
										payload={licensePayload}
										setPayload={setLicensePayload}
									/>
								</Form.Group>
							</Col>
						</Row>
						<Row>
							<Col>
								<div className="form-check-inline my-1">
									<input
										className="form-check-input me-1 mt-2"
										type="checkbox"
										name="active"
										checked={licensePayload.active}
										onChange={handleCheckboxChange}
										id="licenseUpdate.active"
									/>
									<label
										className="form-check-label"
										htmlFor="licenseUpdate.active"
									>
										<ToolTipLabel
											tooltipText={
												'This should be checked to make the license active'
											}
											label={'Active'}
										/>
									</label>
								</div>
							</Col>
							<Col>
								<div className="form-check-inline my-1">
									<input
										className="form-check-input me-1 mt-2"
										type="checkbox"
										name="copyleft"
										checked={licensePayload.copyleft}
										onChange={handleCheckboxChange}
										id="licenseUpdate.copyLeft"
									/>
									<label
										className="form-check-label"
										htmlFor="licenseUpdate.copyLeft"
									>
										<ToolTipLabel
											tooltipText={
												'This should be checked to enable copy left'
											}
											label={'Copy Left'}
										/>
									</label>
								</div>
							</Col>
							<Col>
								<div className="form-check-inline my-1">
									<input
										className="form-check-input me-1 mt-2"
										type="checkbox"
										name="OSIapproved"
										checked={licensePayload.OSIapproved}
										onChange={handleCheckboxChange}
										id="licenseUpdate.osiApproved"
									/>
									<label
										className="form-check-label"
										htmlFor="licenseUpdate.osiApproved"
									>
										<ToolTipLabel
											tooltipText={
												'This should be checked to make the license OSI approved'
											}
											label={'OSI Aprroved'}
										/>
									</label>
								</div>
							</Col>
							<Col>
								<div className="form-check-inline my-1">
									<input
										className="form-check-input me-1 mt-2"
										type="checkbox"
										name="text_updatable"
										checked={licensePayload.text_updatable}
										onChange={handleCheckboxChange}
										id="licenseUpdate.textUpdatable"
									/>
									<label
										className="form-check-label"
										htmlFor="licenseUpdate.textUpdatable"
									>
										<ToolTipLabel
											tooltipText={
												'This should be checked to make the license text updatable'
											}
											label={'Text Updatable'}
										/>
									</label>
								</div>
							</Col>
						</Row>
						<Row>
							<Form.Group className="form-group-text">
								<Form.Label className="obligation-overviews">
									<ToolTipLabel
										label={'Obligations'}
										tooltipText={'Obligations Type'}
									/>
									<a
										className="obli-overview"
										onClick={e => {
											e.preventDefault();
											setShowModal(!showModal);
										}}
									>
										{' '}
										<span>
											<TbListDetails />
										</span>{' '}
										Overviews
									</a>
								</Form.Label>
								{!isObligationsPreviewQueryPending &&
									!isLicenseObligationsQueryPending && (
										<Select
											key={JSON.stringify({
												shortname:
													licensePayload.shortname,
												licenseObligationsData,
											})}
											options={(
												allObligationData?.data ?? []
											).map(d => ({
												value: d.topic,
												label: `${d.type}: ${d.topic}`,
											}))}
											defaultValue={(
												licenseObligationsData?.data ??
												[]
											).map(ob => ({
												value: ob.topic,
												label: `${ob.type}: ${ob.topic}`,
											}))}
											onChange={selectedObligations => {
												setFinalObligations(
													selectedObligations.map(
														ob => ob.value,
													),
												);
											}}
											isSearchable
											closeMenuOnSelect={false}
											isMulti
											cacheOptions={false}
										/>
									)}
							</Form.Group>
						</Row>

						{/* Dynamically render fields */}
						<div className="ext-fields">
							{fields.map(field => renderFormField(field))}
						</div>
					</Col>
					<Col>
						<Form.Group className="form-group-text">
							<Form.Label>
								<ToolTipLabel
									label={'License Text'}
									tooltipText={'License Text'}
								/>
							</Form.Label>
							<Form.Control
								className="text-area"
								as="textarea"
								rows={5}
								placeholder="Enter text"
								name="text"
								value={licensePayload.text}
								onChange={handleInputChange}
							/>
						</Form.Group>
						{licensePayload.text && (
							<SimilarityResultList
								list={similarLicenses}
								header="License"
								text={licensePayload.text}
								label={licensePayload.shortname}
							/>
						)}
					</Col>
				</Row>

				<div className="w-100 d-flex justify-content-center">
					<button
						type="button"
						className="btn btn-primary"
						disabled={
							updateLicenseMutation.isPending ||
							updateLicenseObligationsMutation.isPending
						}
						onClick={e => {
							updateLicenseMutation.mutate({
								licensePayload,
								shortname: licensePayload.shortname,
							});
							updateLicenseObligationsMutation.mutate({
								shortname: licensePayload.shortname,
								initialObligations: (
									licenseObligationsData?.data ?? []
								).map(ob => ob.topic),
								finalObligations,
							});
						}}
					>
						{(updateLicenseMutation.isPending ||
							updateLicenseObligationsMutation.isPending) && (
							<span
								className="spinner-border spinner-border-sm me-1"
								role="status"
							></span>
						)}
						Update License
					</button>
				</div>
			</Form>
		</div>
	);
}

LicenseDetailForm.propTypes = {
	licensePayload: PropTypes.shape({
		shortname: PropTypes.string.isRequired,
		fullname: PropTypes.string,
		spdx_id: PropTypes.string,
		risk: PropTypes.number,
		active: PropTypes.bool,
		copyleft: PropTypes.bool,
		OSIapproved: PropTypes.bool,
		text_updatable: PropTypes.bool,
		external_ref: PropTypes.object,
		text: PropTypes.string,
	}).isRequired,
	setLicensePayload: PropTypes.func.isRequired,
	page: PropTypes.number.isRequired,
	perPage: PropTypes.number.isRequired,
	sortField: PropTypes.string.isRequired,
	sortOrder: PropTypes.string.isRequired,
};

export default LicenseDetailForm;
