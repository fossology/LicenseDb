// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>

import ClipLoader from 'react-spinners/ClipLoader';

function Spinner() {
	return (
		<div className="sweet-loading">
			<ClipLoader
				color={'rgb(24, 119, 242)'}
				loading={true}
				size={50}
				aria-label="Loading Spinner"
				data-testid="loader"
			/>
		</div>
	);
}

export default Spinner;
