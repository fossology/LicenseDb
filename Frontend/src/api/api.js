// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import axios from 'axios';
import { GetToken } from '../contexts/AuthContext';
import isApiAuthenticated from '../utils/authSettings';

export const fetchLicenses = async ({
	page = 1,
	limit = 10,
	params = {},
	sortField,
	sortOrder,
}) => {
	const base_url = `${process.env.REACT_APP_BASE_URL}/licenses?page=${page}&limit=${limit}&sort_by=${sortField}&order_by=${sortOrder}`;
	const paramString = Object.entries(params)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		)
		.join('&');
	const url = `${base_url}&${paramString}`;
	const headers = {};
	if (isApiAuthenticated('licenses', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const fetchLicensePreviews = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/licenses/preview?active=true`;
	const headers = {};
	if (isApiAuthenticated('licenses/preview', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const fetchObligations = async ({
	page = 1,
	limit = 10,
	params = { active: true },
	sortOrder,
}) => {
	const base_url = `${process.env.REACT_APP_BASE_URL}/obligations?page=${page}&limit=${limit}&order_by=${sortOrder}`;
	const paramString = Object.entries(params)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		)
		.join('&');
	const url = `${base_url}&${paramString}`;
	const headers = {};
	if (isApiAuthenticated('obligations', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const fetchUsers = async ({
	page = 1,
	limit = 10,
	params = { active: true },
}) => {
	const base_url = `${process.env.REACT_APP_BASE_URL}/users?active=true&page=${page}&limit=${limit}`;
	const paramString = Object.entries(params)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		)
		.join('&');
	const url = `${base_url}&${paramString}`;
	const headers = {};
	if (isApiAuthenticated('users', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const fetchAudits = async ({ page, limit, params = {} }) => {
	const base_url = `${process.env.REACT_APP_BASE_URL}/audits?page=${page}&limit=${limit}`;
	const paramString = Object.entries(params)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		)
		.join('&');
	const url = `${base_url}&${paramString}`;
	const headers = {};
	if (isApiAuthenticated('audits', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	const audits = response?.data.data;
	return audits;
};

export const fetchAuditDetails = async ({ auditId }) => {
	const base_url = `${process.env.REACT_APP_BASE_URL}/audits/${auditId}/changes`;
	const headers = {};
	if (isApiAuthenticated('audits/{audit_id}/changes', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(base_url, {
		headers,
	});
	return response.data;
};

export const postLicense = async ({ licensePayload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/licenses`;
	const headers = {};
	if (isApiAuthenticated('licenses', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, licensePayload, {
		headers,
	});
	return response.data;
};

export const postObligation = async ({ obligationPayload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations`;
	const headers = {};
	if (isApiAuthenticated('obligations', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, obligationPayload, {
		headers,
	});
	return response.data;
};

export const postUser = async ({ userPayload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/users`;
	const headers = {};
	if (isApiAuthenticated('users', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, userPayload, {
		headers,
	});
	return response.data;
};

export const updateLicense = async ({
	licensePayload,
	accessToken,
	shortname,
}) => {
	const url = `${process.env.REACT_APP_BASE_URL}/licenses/${encodeURIComponent(shortname)}`;
	const headers = {};
	if (isApiAuthenticated('licenses/{shortname}', 'patch')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.patch(url, licensePayload, {
		headers,
	});
	return response.data;
};

export const updateObligation = async ({
	obligationPayload,
	accessToken,
	topic,
}) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/${encodeURIComponent(topic)}`;
	const headers = {};
	if (isApiAuthenticated('obligations/{topic}', 'patch')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.patch(url, obligationPayload, {
		headers,
	});
	return response.data;
};

export const updateObligationWithLicenses = async ({
	associated_licenses,
	topic,
}) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligation_maps/topic/${encodeURIComponent(topic)}/license`;
	const headers = {};
	if (isApiAuthenticated('obligation_maps/topic/{topic}/license', 'put')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.put(url, associated_licenses, {
		headers,
	});
	return response.data;
};

export const updateUser = async ({ userPayload, username }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/users/${encodeURIComponent(username)}`;
	const headers = {};
	if (isApiAuthenticated('users/{username}', 'patch')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.patch(url, userPayload, {
		headers,
	});
	return response.data;
};

export const exportLicenses = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/licenses/export`;
	const headers = {};
	if (isApiAuthenticated('licenses/export', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response;
};

export const exportObligations = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/export`;
	const headers = {};
	if (isApiAuthenticated('obligations/export', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response;
};

export const uploadLicenseFile = async file => {
	const formData = new FormData();
	formData.append('file', file);
	const url = `${process.env.REACT_APP_BASE_URL}/licenses/import`;
	const headers = {};
	if (isApiAuthenticated('licenses/import', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	headers['Content-Type'] = 'multipart/form-data';
	const response = await axios.post(url, formData, {
		headers,
	});
	return response.data;
};

export const uploadObligationFile = async file => {
	const formData = new FormData();
	formData.append('file', file);
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/import`;
	const headers = {};
	if (isApiAuthenticated('obligations/import', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	headers['Content-Type'] = 'multipart/form-data';
	const response = await axios.post(url, formData, {
		headers,
	});
	return response.data;
};

export const fetchObligationPreviews = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/preview?active=true`;
	const headers = {};
	if (isApiAuthenticated('obligations/preview', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, { headers });
	return response.data;
};

export const fetchObligationsOfLicense = async ({ shortname }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligation_maps/license/${encodeURIComponent(shortname)}`;
	const headers = {};
	if (isApiAuthenticated('obligation_maps/license/{license}', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const updateObligationsOfLicense = async ({
	shortname,
	initialObligations,
	finalObligations,
	accessToken,
}) => {
	const changes = {};
	for (const ob of initialObligations) {
		if (finalObligations.indexOf(ob) === -1) {
			changes[ob] = [
				{
					add: false,
					shortname,
				},
			];
		}
	}
	for (const ob of finalObligations) {
		if (initialObligations.indexOf(ob) === -1) {
			changes[ob] = [
				{
					add: true,
					shortname,
				},
			];
		}
	}

	const headers = {};
	if (isApiAuthenticated('obligation_maps/topic/{topic}/license', 'patch')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const obligationUpdatePromises = Object.keys(changes).map(topic =>
		axios.patch(
			`${process.env.REACT_APP_BASE_URL}/obligation_maps/topic/${encodeURIComponent(topic)}/license`,
			{ map: changes[topic] },
			{
				headers,
			},
		),
	);
	await Promise.all(obligationUpdatePromises);
};

export const fetchObligationTypes = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/types`;
	const headers = {};
	if (isApiAuthenticated('obligations/types', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, { headers });
	return response.data;
};

export const postObligationType = async ({ payload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/types`;
	const headers = {};
	if (isApiAuthenticated('obligations/types', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, payload, {
		headers,
	});
	return response.data;
};

export const deleteObligationType = async ({ type }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/types/${encodeURIComponent(type)}`;
	const headers = {};
	if (isApiAuthenticated('obligations/types/{type}', 'delete')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.delete(url, {
		headers,
	});
	return response.data;
};

export const fetchObligationClassfications = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/classifications`;
	const headers = {};
	if (isApiAuthenticated('obligations/classifications', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const postObligationClassification = async ({ payload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/classifications`;
	const headers = {};
	if (isApiAuthenticated('obligations/classifications', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, payload, {
		headers,
	});
	return response.data;
};

export const deleteObligationClassification = async ({ classification }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/classifications/${encodeURIComponent(classification)}`;
	const headers = {};
	if (
		isApiAuthenticated(
			'obligations/classifications/{classification}',
			'delete',
		)
	) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.delete(url, {
		headers,
	});

	if (response.status === 204) {
		return true;
	}

	return response.data;
};

export const fetchUserProfile = async token => {
	const url = `${process.env.REACT_APP_BASE_URL}/users/profile`;
	const headers = {};
	if (isApiAuthenticated('users/profile', 'get')) {
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const searchLicenseByShortname = async ({ queryPayload }) => {
	const url = `${process.env.REACT_APP_BASE_URL}/search`;
	const headers = {};
	if (isApiAuthenticated('search', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.post(url, queryPayload, {
		headers,
	});
	return response.data;
};

export const fetchDashboardData = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/dashboard`;
	const headers = {};
	if (isApiAuthenticated('dashboard', 'get')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}
	const response = await axios.get(url, {
		headers,
	});
	return response.data;
};

export const fetchApiAuthSettings = async () => {
	const url = `${process.env.REACT_APP_BASE_URL}/apiCollection`;
	const response = await axios.get(url);
	return response.data;
};

export const fetchSimilarObligations = async text => {
	const url = `${process.env.REACT_APP_BASE_URL}/obligations/similarity`;
	const headers = {};

	if (isApiAuthenticated('obligations/similarity', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await axios.post(url, { text }, { headers });
	return response.data;
};

export const fetchSimilarLicenses = async text => {
	const url = `${process.env.REACT_APP_BASE_URL}/licenses/similarity`;
	const headers = {};

	if (isApiAuthenticated('licenses/similarity', 'post')) {
		const token = await GetToken();
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await axios.post(url, { text }, { headers });
	return response.data;
};
