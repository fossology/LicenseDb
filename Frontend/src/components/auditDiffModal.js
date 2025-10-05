// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import DiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAuditDetails } from '../api/api';

const DiffModal = ({ show, handleClose, audit }) => {
	const { data } = useQuery({
		queryKey: ['auditDetail', audit?.auditId],
		queryFn: () => fetchAuditDetails({ auditId: audit?.auditId }),
		placeholderData: keepPreviousData,
		enabled: !!audit?.auditId,
	});
	const single_audit = audit?.audit;
	const auditDetails = data?.data;
	return (
		<Modal show={show} onHide={handleClose} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>
					<b>{audit?.auditType}</b>&nbsp;
					{audit?.auditType.toLowerCase() === 'license' && (
						<span>
							Short Name: {single_audit.entity?.shortname}
						</span>
					)}
					{audit?.auditType.toLowerCase() === 'obligation' && (
						<span>Topic: {single_audit.entity?.topic}</span>
					)}
					{audit?.auditType.toLowerCase() ===
						'obligationclassification' && (
						<span>{single_audit.entity?.classification}</span>
					)}
					{audit?.auditType.toLowerCase() === 'obligationtype' && (
						<span>{single_audit.entity?.type}</span>
					)}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{auditDetails ? (
					auditDetails.map((change, index) => (
						<div key={change.id}>
							<h5>{change.field}</h5>
							<DiffViewer
								oldValue={change.old_value || ''}
								newValue={change.updated_value || ''}
								splitView={true}
								compareMethod={DiffMethod.WORDS}
							/>
							<hr />
						</div>
					))
				) : (
					<p>No audit details available.</p>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

DiffModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	audit: PropTypes.shape({
		auditId: PropTypes.string.isRequired,
		auditType: PropTypes.string.isRequired,
		audit: PropTypes.shape({
			entity: PropTypes.oneOfType([
				PropTypes.shape({
					shortname: PropTypes.string,
				}),
				PropTypes.shape({
					topic: PropTypes.string,
				}),
				PropTypes.shape({
					classification: PropTypes.string,
				}),
				PropTypes.shape({
					type: PropTypes.string,
				}),
			]),
		}),
	}),
};

export default DiffModal;
