/*
	SPDX-License-Identifier: GPL-2.0-only
	SPDX-FileCopyrightText: © 2025 Siemens AG
	SPDX-FileContributor: 2025 Chayan Das <01chayandas@gmail.com>
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import DiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

const TextDiffModal = ({
	show,
	handleClose,
	title,
	label1,
	label2,
	oldText,
	newText,
}) => {
	return (
		<Modal show={show} onHide={handleClose} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>
					<b>{title}</b>
					{label1 && (
						<span className="ms-2 text-muted">{label1}</span>
					)}
					{label2 && (
						<span className="ms-2 text-muted">vs {label2}</span>
					)}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<DiffViewer
					oldValue={oldText || ''}
					newValue={newText || ''}
					splitView={true}
					compareMethod={DiffMethod.WORDS}
				/>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

TextDiffModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	title: PropTypes.string,
	label1: PropTypes.string,
	label2: PropTypes.string,
	oldText: PropTypes.string,
	newText: PropTypes.string,
};

export default TextDiffModal;
