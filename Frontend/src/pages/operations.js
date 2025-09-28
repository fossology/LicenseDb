// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React, { useState } from 'react';
import '../styles/operation.css';
import { AiOutlineImport, AiOutlineExport } from 'react-icons/ai';
import { PiUploadSimpleBold } from 'react-icons/pi';
import { Form, Row, Col } from 'react-bootstrap';
import '../styles/createFormView.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import {
	exportLicenses,
	exportObligations,
	uploadLicenseFile,
	uploadObligationFile,
} from '../api/api';
import AlertDismissible from '../components/AlertToggle';
import { importOptions } from '../utils/data/dropdownOptions';

function Operation() {
	const [selectedLink, setSelectedLink] = useState(null);
	const [defaultOption, setImportOption] = useState(importOptions[0]);
	const [file, setFile] = useState(null);
	const [showAlert, setShowAlert] = useState(false);
	const [alertData, setAlertData] = useState('');

	const queryClient = useQueryClient();

	const { mutate: importLicenseMutation, isPending: isLicensePending } =
		useMutation({
			mutationFn: uploadLicenseFile,
			onSuccess: data => {
				setShowAlert(true);
				setAlertData(data);
				toast.success('Licenses imported successfully!', {
					position: 'top-right',
					autoClose: 7000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'dark',
				});
				queryClient.invalidateQueries('licenses');
				queryClient.invalidateQueries('audits');
			},
			onError: error => {
				toast.error(
					'License import error: ' + error.response.data.error,
					{
						position: 'top-right',
						autoClose: false,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						theme: 'dark',
					},
				);
			},
		});

	const { mutate: importObliMutation, isPending: isObliPending } =
		useMutation({
			mutationFn: uploadObligationFile,
			onSuccess: data => {
				setShowAlert(true);
				setAlertData(data);
				toast.success('Obligations imported successfully!', {
					position: 'top-right',
					autoClose: 7000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: 'dark',
				});
				queryClient.invalidateQueries('licenses');
				queryClient.invalidateQueries('audits');
			},
			onError: error => {
				toast.error(
					'Obligation import error: ' + error.response.data.error,
					{
						position: 'top-right',
						autoClose: false,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						theme: 'dark',
					},
				);
			},
		});

	const handleLinkClick = link => {
		setSelectedLink(link);
		setShowAlert(false);
		if (link === 'export-license') {
			try {
				handleExportLicense();
			} catch (error) {
				console.error('Error exporting licenses:', error);
			}
		} else if (link === 'export-obli') {
			try {
				handleExportObligation();
			} catch (error) {
				console.error('Error exporting obligations:', error);
			}
		}
	};

	// Function to extract filename from Content-Disposition header
	const getFileNameFromContentDisposition = contentDisposition => {
		const filenameRegex = /filename[^=\n]*=((['"]).*?\2|[^\n]*)/;
		const matches = filenameRegex.exec(contentDisposition);
		return matches !== null && matches[1]
			? matches[1].replace(/['"]/g, '')
			: 'download.json';
	};

	const handleFileChange = event => {
		setFile(event.target.files[0]);
	};

	const handleExportLicense = async () => {
		try {
			const response = await exportLicenses();
			const jsonData = JSON.stringify(response?.data, null, 2);
			const blob = new Blob([jsonData], { type: 'application/json' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');

			// Extract filename from headers
			const contentDisposition = response?.headers['content-disposition'];
			const filename =
				getFileNameFromContentDisposition(contentDisposition);
			link.href = url;
			link.setAttribute('download', filename);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);

			toast.success('License exported successfully!', {
				position: 'top-right',
				autoClose: 7000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
		} catch {
			toast.error('License export error!', {
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: 'dark',
			});
		}
	};

	const handleExportObligation = async () => {
		try {
			const response = await exportObligations();

			const jsonData = JSON.stringify(response?.data, null, 2);
			const blob = new Blob([jsonData], { type: 'application/json' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');

			// Extract filename from headers
			const contentDisposition = response?.headers['content-disposition'];
			const filename =
				getFileNameFromContentDisposition(contentDisposition);

			link.href = url;
			link.setAttribute('download', filename);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);

			toast.success('Obligations exported successfully!', {
				position: 'top-right',
				autoClose: 7000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'dark',
			});
		} catch {
			toast.error('Obligations export error!', {
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: 'dark',
			});
		}
	};

	const handleSubmit = e => {
		e.preventDefault();
		if (!file) {
			toast.error('No file was chosen! Please choose a json file.', {
				position: 'top-right',
				autoClose: false,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: 'dark',
			});
		}

		if (selectedLink === 'import-license') importLicenseMutation(file);
		else if (selectedLink === 'import-obli') importObliMutation(file);
	};

	return (
		<div className="content">
			<h5 className="header-title">Operations</h5>
			<div className="link-container">
				<div className="link-group">
					<a
						className={`link ${
							selectedLink === 'import-license' ? 'active' : ''
						}`}
						onClick={() => handleLinkClick('import-license')}
					>
						<span className="icon import">
							<AiOutlineImport />
						</span>
						Import Licenses
					</a>
					<a
						className={`link ${selectedLink === 'import-obli' ? 'active' : ''}`}
						onClick={() => handleLinkClick('import-obli')}
					>
						<span className="icon import">
							<AiOutlineImport />
						</span>
						Import Obligations
					</a>
				</div>
				<div className="link-group">
					<a
						className="link"
						onClick={() => handleLinkClick('export-license')}
					>
						<span className="icon export">
							<AiOutlineExport />
						</span>
						Export License as JSON
					</a>
					<a
						className="link"
						onClick={() => handleLinkClick('export-obli')}
					>
						<span className="icon export">
							<AiOutlineExport />
						</span>
						Export Obligation as JSON
					</a>
				</div>
			</div>

			<>
				{(isLicensePending || isObliPending) && (
					<div className="d-flex justify-content-center align-items-center">
						<Spinner animation="grow" variant="primary" />
					</div>
				)}
				<div
					className={
						isLicensePending || isObliPending
							? 'mt-2 opacity-50'
							: ''
					}
				>
					<div className="operation-main">
						{(selectedLink === 'import-license' ||
							selectedLink === 'import-obli') && (
							<Form
								className="create-form-parent operation-container"
								onSubmit={handleSubmit}
							>
								{selectedLink === 'import-license' && (
									<h6>Upload JSON for Import License</h6>
								)}
								{selectedLink === 'import-obli' && (
									<h6>Upload JSON for Import Obligation</h6>
								)}
								<Row>
									<Col sm={6}>
										<Row>
											<Col sm={4}>
												<Form.Group className="form-fields">
													<Form.Label>
														Import Options
													</Form.Label>
													<Select
														options={importOptions}
														value={defaultOption}
														onChange={
															setImportOption
														}
													/>
												</Form.Group>
											</Col>
											<Col sm={8}>
												<Form.Group className="form-fields">
													<Form.Label>
														Choose file for upload
													</Form.Label>
													<Form.Control
														type="file"
														accept=".json"
														onChange={
															handleFileChange
														}
													/>
												</Form.Group>
											</Col>
										</Row>

										<div className="button-wrapper">
											<Button
												type="submit"
												variant="outline-success"
											>
												<PiUploadSimpleBold className="me-1" />
												Upload
											</Button>
										</div>
									</Col>
									<Col sm={6}>
										{showAlert && (
											<AlertDismissible
												show={showAlert}
												setShow={setShowAlert}
												data={alertData}
											/>
										)}
									</Col>
								</Row>
							</Form>
						)}
					</div>
				</div>
			</>
		</div>
	);
}

export default Operation;
