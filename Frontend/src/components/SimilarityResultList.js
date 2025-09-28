/*
	SPDX-License-Identifier: GPL-2.0-only
	SPDX-FileCopyrightText: © 2025 Siemens AG
	SPDX-FileContributor: 2025 Chayan Das <01chayandas@gmail.com>
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import TextDiffModal from './textDiffModal';
import '../styles/similarityResultList.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function SimilarityCircle({ percentage }) {
	const getColor = value => {
		if (value >= 95) return '#dc3545';
		if (value >= 80) return '#ffc107';
		return '#28a745';
	};

	const data = {
		datasets: [
			{
				data: [percentage, 100 - percentage],
				backgroundColor: [getColor(percentage), '#e9ecef'],
				borderWidth: 0,
			},
		],
	};

	const options = {
		cutout: '70%',
		plugins: {
			tooltip: { enabled: false },
			legend: { display: false },
		},
	};

	return (
		<div className="circle-container">
			<Doughnut data={data} options={options} />
			<div className="circle-text">{percentage.toFixed(0)}%</div>
		</div>
	);
}

function SimilarityCard({ item, onClick }) {
	const displayName = item.shortname || item.topic || 'Unnamed';
	const similarityPercent = (item.similarity ?? 0) * 100;

	const getBadge = value => {
		if (value >= 90) return { text: 'High Match', variant: 'danger' };
		if (value >= 80) return { text: 'Good Match', variant: 'warning' };
		return { text: 'Partial Match', variant: 'success' };
	};

	const badge = getBadge(similarityPercent);

	return (
		<Card onClick={onClick} className="p-3 cursor-pointer similarity-card">
			<div className="d-flex justify-content-between align-items-center full-width">
				<div className="card-left">
					<h3 className="card-title">{displayName}</h3>
					<span className={`badge bg-${badge.variant} card-badge`}>
						{badge.text}
					</span>
				</div>
				<div className="card-right">
					<SimilarityCircle percentage={similarityPercent} />
				</div>
			</div>
		</Card>
	);
}

const SimilarityResultList = ({
	list = [],
	header = 'Result',
	text = '',
	label = 'Current Text',
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedSim, setSelectedSim] = useState(null);

	const handleSimClick = sim => {
		setSelectedSim({
			Id: sim.Id,
			name: sim.shortname || sim.topic || 'Unnamed',
			oldText: sim.text || '',
			newText: text,
		});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedSim(null);
	};

	return (
		<div className="similarity-result-container mt-2">
			<div className="similarity-result-header mb-1">
				<h2 className="similarity-result-title text-muted">
					Similar {header}s Found
				</h2>
				<div className="similarity-result-count">
					{list.length} result{list.length !== 1 ? 's' : ''}
				</div>
			</div>

			<div className="similarity-result-list p-2">
				{list.length > 0 ? (
					<div className="similarity-result-grid">
						{list.map((item, index) => (
							<div key={index} className="similarity-result-item">
								<SimilarityCard
									item={item}
									onClick={() => handleSimClick(item)}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="similarity-result-empty text-muted">
						No similar {header.toLowerCase()}s found.
					</div>
				)}
			</div>

			{selectedSim && (
				<TextDiffModal
					show={isModalOpen}
					handleClose={closeModal}
					title="Text Comparison"
					label1={selectedSim.name}
					label2={label}
					oldText={selectedSim.oldText}
					newText={selectedSim.newText}
				/>
			)}
		</div>
	);
};

SimilarityCircle.propTypes = {
	percentage: PropTypes.number.isRequired,
};

SimilarityCard.propTypes = {
	item: PropTypes.shape({
		Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		shortname: PropTypes.string,
		topic: PropTypes.string,
		similarity: PropTypes.number,
		text: PropTypes.string,
	}),
	onClick: PropTypes.func.isRequired,
};

SimilarityResultList.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			shortname: PropTypes.string,
			topic: PropTypes.string,
			similarity: PropTypes.number,
		}),
	),
	header: PropTypes.string,
	text: PropTypes.string,
	label: PropTypes.string,
};

export default SimilarityResultList;
