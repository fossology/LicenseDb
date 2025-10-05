// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';
import Select from 'react-select';

const dot = (color = 'transparent') => ({
	alignItems: 'center',
	display: 'flex',

	':before': {
		backgroundColor: color,
		borderRadius: 10,
		content: '" "',
		display: 'block',
		marginRight: 8,
		height: 10,
		width: 10,
	},
});

const colourStyles = {
	control: styles => ({ ...styles, backgroundColor: 'white' }),
	option: (styles, { data, isDisabled, isFocused, isSelected }) => {
		const color = chroma(data.color);
		return {
			...styles,
			backgroundColor: isDisabled
				? undefined
				: isSelected
					? data.color
					: isFocused
						? color.alpha(0.1).css()
						: undefined,
			color: isDisabled
				? '#ccc'
				: data.color === '#FFFFFF'
					? 'black'
					: isSelected
						? chroma.contrast(color, 'white') <= 2
							? 'black'
							: 'white'
						: data.color,
			cursor: isDisabled ? 'not-allowed' : 'default',

			':active': {
				...styles[':active'],
				backgroundColor: !isDisabled
					? isSelected
						? data.color
						: color.alpha(0.3).css()
					: undefined,
			},
		};
	},
	input: styles => ({ ...styles, ...dot() }),
	placeholder: styles => ({ ...styles, ...dot('#ccc') }),
	singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
};

const CustomSelect = ({ options, name, payload, setPayload }) => {
	const selectedValue =
		options.find(option => option.value === payload[name]) || null;
	return (
		<Select
			value={selectedValue}
			name={name}
			onChange={(value, action) => {
				setPayload({ ...payload, [action.name]: value.value });
			}}
			options={options}
			styles={colourStyles}
		/>
	);
};

CustomSelect.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			color: PropTypes.string.isRequired,
		}),
	).isRequired,
	name: PropTypes.string.isRequired,
	payload: PropTypes.object.isRequired,
	setPayload: PropTypes.func.isRequired,
};

export default CustomSelect;
