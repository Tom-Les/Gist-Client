// Load .txt file
document.getElementById("fileInput").addEventListener("change", function () {
	const file = this.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		document.getElementById("textArea").value = e.target.result;
	};
	reader.readAsText(file);
});

// Download as .txt
function downloadText() {
	const text = document.getElementById("textArea").value;
	const blob = new Blob([text], { type: "text/plain" });
	const link = document.createElement("a");
	link.download = "download.txt";
	link.href = URL.createObjectURL(blob);
	link.click();
}

// Upload to Gist
async function uploadToGist() {
	const text = document.getElementById("textArea").value;
	const filename =
		document.getElementById("gistTitle").value.trim() || "uploaded_text.txt";

	const response = await fetch("/.netlify/functions/create-gist", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content: text, filename }),
	});

	let result;
	try {
		result = await response.json();
	} catch (e) {
		alert("Server error. Could not parse response.");
		return;
	}

	if (response.ok && result.html_url) {
		saveGistLocally({ id: result.id, url: result.html_url, filename });
		updateGistDropdown();

		document.getElementById("gistLink").textContent = "🔗 View your Gist";
		document.getElementById("gistLink").href = result.html_url;
		alert("✅ Gist created successfully!");
	} else {
		alert("❌ Upload failed:\n" + JSON.stringify(result));
	}
}

// Save Gist to localStorage
function saveGistLocally(gist) {
	const saved = JSON.parse(localStorage.getItem("savedGists") || "[]");
	saved.push(gist);
	localStorage.setItem("savedGists", JSON.stringify(saved));
}

// Populate dropdown
function updateGistDropdown() {
	const select = document.getElementById("gistSelect");
	select.innerHTML = '<option value="">Select a saved Gist</option>';
	const saved = JSON.parse(localStorage.getItem("savedGists") || "[]");

	saved.forEach((gist) => {
		const option = document.createElement("option");
		option.value = gist.id;
		option.textContent = gist.filename;
		select.appendChild(option);
	});
}

// Load from Gist URL or ID
async function loadGist() {
	const input = document.getElementById("gistUrl").value.trim();
	if (!input) return alert("Please enter a Gist URL or ID.");

	const gistId = input.split("/").pop();
	const apiUrl = `https://api.github.com/gists/${gistId}`;

	try {
		const response = await fetch(apiUrl);
		if (!response.ok) throw new Error("Gist not found");

		const gist = await response.json();
		const files = gist.files;
		const firstFile = Object.values(files)[0];

		document.getElementById("textArea").value = firstFile.content;
		alert("✅ Gist loaded successfully.");
	} catch (err) {
		alert("❌ Error loading Gist: " + err.message);
	}
}

// Load selected Gist from dropdown
function loadSelectedGist() {
	const id = document.getElementById("gistSelect").value;
	if (!id) return;
	document.getElementById("gistUrl").value = id;
	loadGist();
}

// Clear saved Gist list
function clearSavedGists() {
	localStorage.removeItem("savedGists");
	updateGistDropdown();
	alert("🧹 Gist list cleared.");
}

// Delete Gist
async function deleteGist() {
	const input = document.getElementById("gistUrl").value.trim();
	const gistId = input.split("/").pop();

	if (!gistId) return alert("No Gist ID to delete.");
	if (!confirm("Are you sure you want to delete this Gist?")) return;

	const response = await fetch("/.netlify/functions/delete-gist", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ gistId }),
	});

	const result = await response.json();

	if (response.ok) {
		alert("🗑️ Gist deleted successfully.");
	} else {
		alert("❌ Failed to delete Gist:\n" + JSON.stringify(result));
	}
}

function clearFields() {
	document.getElementById("textArea").value = "";
	document.getElementById("gistTitle").value = "";
	document.getElementById("gistUrl").value = "";
}

window.onload = updateGistDropdown;
