// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const InputField = ({ label, name, value, onChange }) => (
	<Form.Group controlId={name}>
		<Form.Label>{label}</Form.Label>
		<Form.Control
			as="textarea"
			rows={5}
			type="text"
			name={name}
			value={value}
			onChange={onChange}
		/>
	</Form.Group>
);

InputField.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default InputField;
