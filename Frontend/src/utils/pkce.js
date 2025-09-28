// SPDX-License-Identifier: GPL-2.0-only
// SPDX-FileCopyrightText: © 2024 Siemens AG
// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

export function base64URLEncode(str) {
	return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

const sha256 = async message => {
	const msgBuffer = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
	const hashArray = new Uint8Array(hashBuffer);
	return hashArray;
};

export async function generatePKCE() {
	const code_verifier = base64URLEncode(
		crypto.getRandomValues(new Uint8Array(64)),
	);
	const code_challenge = base64URLEncode(await sha256(code_verifier));
	return { code_verifier, code_challenge };
}
