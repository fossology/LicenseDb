// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Sourav Bhowmik <sourav.bhowmik@siemens.com>
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { generatePKCE } from '../utils/pkce';
import { fetchUserProfile } from '../api/api';

const MILLISEC = 1000;

const AuthContext = React.createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	useEffect(() => {
		if (process.env.REACT_APP_PROVIDER === 'oidc') {
			const interval = setInterval(
				getAccessTokenFromRefreshToken,
				30 * 60 * MILLISEC,
			); // every 30 minutes

			return () => clearInterval(interval);
		}
	}, []);

	async function Signin(userCredentialsPayload) {
		try {
			const url = `${process.env.REACT_APP_BASE_URL}/login`;
			const response = await axios.post(url, userCredentialsPayload);
			localStorage.setItem('licensedb.token', response.data.token);

			const user = await fetchUserProfile(response.data.token);
			localStorage.setItem(
				'licensedb.user',
				JSON.stringify(user.data[0]),
			);
		} catch (e) {
			if (e.response) {
				throw new Error(e.response.data.message);
			} else {
				throw new Error(e.message);
			}
		}
	}

	async function OidcSignin() {
		const { code_verifier, code_challenge } = await generatePKCE();
		localStorage.setItem('licensedb.codeVerifier', code_verifier);
		const auth_url = `${process.env.REACT_APP_AUTH_URL}?response_type=code&client_id=${
			process.env.REACT_APP_CLIENT_ID
		}&redirect_uri=${encodeURIComponent(
			process.env.REACT_APP_REDIRECT_URL,
		)}&scope=openid&code_challenge=${code_challenge}&code_challenge_method=S256&response_mode=fragment`;

		window.location.href = auth_url;
	}

	async function Exchange(code) {
		let token = '';
		let refresh_token = '';
		let expires_at = null;
		try {
			const codeVerifier = localStorage.getItem('licensedb.codeVerifier');
			if (!codeVerifier) return;
			localStorage.removeItem('licensedb.codeVerifier');

			const response = await axios.post(
				process.env.REACT_APP_TOKEN_URL,
				{
					grant_type: 'authorization_code',
					code: code,
					redirect_uri: process.env.REACT_APP_REDIRECT_URL,
					client_id: process.env.REACT_APP_CLIENT_ID,
					code_verifier: codeVerifier,
				},
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			token = response.data.id_token;
			refresh_token = response.data.refresh_token;
			expires_at = Date.now() + response.data.expires_in * MILLISEC;

			const url = `${process.env.REACT_APP_BASE_URL}/users/oidc`;
			await axios.post(
				url,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const user = await fetchUserProfile(token);

			localStorage.setItem('licensedb.token', token);
			localStorage.setItem('licensedb.expires_at', expires_at);
			localStorage.setItem('licensedb.refresh_token', refresh_token);
			localStorage.setItem(
				'licensedb.user',
				JSON.stringify(user.data[0]),
			);
		} catch (e) {
			if (e.response?.data?.status) {
				if (e.response.data.status !== 409) {
					throw new Error(e.response.data.message);
				} else {
					const user = await fetchUserProfile(token);

					localStorage.setItem('licensedb.token', token);
					localStorage.setItem('licensedb.expires_at', expires_at);
					localStorage.setItem(
						'licensedb.refresh_token',
						refresh_token,
					);
					localStorage.setItem(
						'licensedb.user',
						JSON.stringify(user.data[0]),
					);
				}
			} else {
				throw e;
			}
		}
	}

	const value = {
		Signin,
		OidcSignin,
		Exchange,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export function Signout() {
	localStorage.removeItem('licensedb.token');
	localStorage.removeItem('licensedb.user');
	localStorage.removeItem('licensedb.refresh_token');
	localStorage.removeItem('licensedb.expires_at');
	window.location.href = process.env.PUBLIC_URL;
}

async function getAccessTokenFromRefreshToken() {
	let token = '';
	let new_refresh_token = '';
	let expires_at = null;
	try {
		const refresh_token = localStorage.getItem('licensedb.refresh_token');

		const response = await axios.post(
			process.env.REACT_APP_TOKEN_URL,
			{
				grant_type: 'refresh_token',
				client_id: process.env.REACT_APP_CLIENT_ID,
				refresh_token: refresh_token,
				scope: 'openid',
			},
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);

		token = response.data.id_token;
		new_refresh_token = response.data.refresh_token;
		expires_at = Date.now() + response.data.expires_in * MILLISEC;

		const user = await fetchUserProfile(token);

		localStorage.setItem('licensedb.token', token);
		localStorage.setItem('licensedb.expires_at', expires_at);
		localStorage.setItem('licensedb.refresh_token', new_refresh_token);
		localStorage.setItem('licensedb.user', JSON.stringify(user.data[0]));
	} catch (e) {
		if (e.response?.data?.status) {
			if (e.response.data.status !== 409) {
				Signout();
			} else {
				const user = await fetchUserProfile(token);

				localStorage.setItem('licensedb.token', token);
				localStorage.setItem('licensedb.expires_at', expires_at);
				localStorage.setItem(
					'licensedb.refresh_token',
					new_refresh_token,
				);
				localStorage.setItem(
					'licensedb.user',
					JSON.stringify(user.data[0]),
				);
			}
		} else {
			Signout();
		}
	}
}

export async function GetToken() {
	const expires_at = localStorage.getItem('licensedb.expires_at');
	let token = localStorage.getItem('licensedb.token');
	const BUFFER_TIME = 60 * MILLISEC * 10; // 10 mins
	if (
		Date.now() >= Number(expires_at) - BUFFER_TIME &&
		process.env.REACT_APP_PROVIDER === 'oidc'
	) {
		await getAccessTokenFromRefreshToken();
		token = localStorage.getItem('licensedb.token');
	}

	return token;
}

// can be expired or active, just to show relevant ui if token is present
export function GetTokenSync() {
	return localStorage.getItem('licensedb.token');
}

export function GetUser() {
	const userJSON = localStorage.getItem('licensedb.user');
	return userJSON ? JSON.parse(userJSON) : null;
}
