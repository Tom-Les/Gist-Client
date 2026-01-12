const fetch = require("node-fetch");

exports.handler = async function (event, context) {
	if (event.httpMethod !== "POST") {
		return { statusCode: 405, body: "Method Not Allowed" };
	}

	// Parse request body
	const { content, filename = "uploaded_text.txt" } = JSON.parse(event.body);

	// Get token from environment variable
	const token = process.env.GITHUB_TOKEN;

	if (!token) {
		return { statusCode: 500, body: "Missing GitHub token" };
	}

	// Prepare request to GitHub API
	const response = await fetch("https://api.github.com/gists", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			description: "Uploaded from Netlify Function",
			public: true,
			files: {
				[filename]: { content },
			},
		}),
	});

	const result = await response.json();

	return {
		statusCode: response.status,
		body: JSON.stringify(result),
	};
};
