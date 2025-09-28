// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CheckBox = ({ label, name, value, onChange }) => (
	<Form.Group controlId={name}>
		<Form.Check
			type="checkbox"
			checked={value || false}
			name={name}
			label={label}
			value={value}
			onChange={onChange}
		/>
	</Form.Group>
);

CheckBox.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	value: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

CheckBox.defaultProps = {
	value: false,
};

export default CheckBox;
