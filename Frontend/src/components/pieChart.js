// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import 'chart.js/auto';
import '../styles/dashboard.css';

function PieChart({ chartData }) {
	const [isLaptopOrSmaller, setIsLaptopOrSmaller] = useState(
		window.innerWidth <= 1440,
	);

	useEffect(() => {
		const handleResize = () => {
			setIsLaptopOrSmaller(window.innerWidth <= 1440);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const riskToColorMapping = new Map([
		[0, '#F2F0EF'],
		[1, 'aqua'],
		[2, 'green'],
		[3, 'yellow'],
		[4, 'orange'],
		[5, 'red'],
	]);

	const data = {
		labels: (chartData ?? []).map(r => `Risk ${r.risk}`),
		datasets: [
			{
				label: '# of Licenses',
				data: (chartData ?? []).map(r => r.count),
				backgroundColor: (chartData ?? []).map(r => {
					return riskToColorMapping.get(r.risk);
				}),
			},
		],
	};

	const commonOptions = {
		maintainAspectRatio: false,
		responsive: true,
	};

	const desktopOptions = {
		plugins: {
			legend: {
				position: 'bottom',
				align: 'start',
				labels: {
					generateLabels: chart => {
						const { datasets } = chart.data;
						const totalRisks = datasets[0].data.reduce(
							(acc, value) => acc + value,
							0,
						);

						return datasets[0].data.map((value, index) => ({
							text: `${data.labels[index]}: ${value} licenses (${(
								(value / totalRisks) *
								100
							).toFixed(2)}%)`,
							fillStyle: datasets[0].backgroundColor[index],
						}));
					},
				},
			},
		},
	};

	const laptopOrSmallerOptions = {
		plugins: {
			legend: {
				position: 'bottom',
				align: 'start',
				labels: {
					boxWidth: 12,
					padding: 10,
					font: {
						size: 10,
					},
					generateLabels: chart => {
						const { datasets } = chart.data;
						const totalRisks = datasets[0].data.reduce(
							(acc, value) => acc + value,
							0,
						);

						return datasets[0].data.map((value, index) => ({
							text: `${data.labels[index]}: ${value} licenses (${(
								(value / totalRisks) *
								100
							).toFixed(2)}%)`,
							fillStyle: datasets[0].backgroundColor[index],
						}));
					},
				},
			},
		},
	};

	const options = isLaptopOrSmaller
		? { ...commonOptions, ...laptopOrSmallerOptions }
		: { ...commonOptions, ...desktopOptions };

	const licenses = data.datasets[0].data.reduce(
		(acc, currentValue) => acc + currentValue,
		0,
	);
	return (
		<>
			{(chartData ?? []).length !== 0 && (
				<div className="pie-chart">
					<h5>Licenses: {licenses}</h5>
					<Pie data={data} options={options} />
				</div>
			)}
		</>
	);
}

PieChart.propTypes = {
	chartData: PropTypes.arrayOf(
		PropTypes.shape({
			risk: PropTypes.number.isRequired,
			count: PropTypes.number.isRequired,
		}),
	).isRequired,
};

export default PieChart;
