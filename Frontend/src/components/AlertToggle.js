// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

function AlertDismissible({ show, setShow, data }) {
	const filteredItems = data?.data.filter(item => item.status > 400);
	if (show && filteredItems.length > 0) {
		return (
			<Alert variant="danger" onClose={() => setShow(false)} dismissible>
				{filteredItems.map((item, index) => (
					<p key={index}>
						<b>License: </b>
						{item.error}
						<br />
						<b>Status {item.status}:</b> {item.message}
					</p>
				))}
			</Alert>
		);
	}
	if (show && filteredItems.length > 0)
		return <Button onClick={() => setShow(true)}>Show Alert</Button>;
}

AlertDismissible.propTypes = {
	show: PropTypes.bool.isRequired,
	setShow: PropTypes.func.isRequired,
	data: PropTypes.shape({
		data: PropTypes.arrayOf(
			PropTypes.shape({
				status: PropTypes.number.isRequired,
				error: PropTypes.string.isRequired,
				message: PropTypes.string.isRequired,
			}),
		).isRequired,
	}),
};

export default AlertDismissible;
