const fetch = require("node-fetch");

exports.handler = async function (event) {
	if (event.httpMethod !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" };
	}

	const { gistId } = JSON.parse(event.body);
	const token = process.env.GITHUB_TOKEN;

	if (!token || !gistId) {
		return { statusCode: 400, body: "Missing token or gist ID" };
	}

	const response = await fetch(`https://api.github.com/gists/${gistId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	return {
		statusCode: response.status,
		body: JSON.stringify({ status: response.status }),
	};
};
