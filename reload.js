const owner = "TallCheesecake";
const repo = "Lox";

const commitsList = document.getElementById("recent-commits");

const perPage = 10;

async function fetchCommits() {
    const res = await fetch(
        `https://api.github.com/search/commits?q=author:${owner}&sort=author-date&order=desc&per_page=${perPage}`,
        {
            headers: { Accept: "application/vnd.github+json" }
        }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    // The commits are in data.items
	console.log(data);
    for (item in data) {
	item.map(item => ({
        repo: item.repository.full_name,
        sha: item.sha,
        message: item.commit.message,
        url: item.html_url,
        date: item.commit.author.date
    }));
    }

    // const output = data.items.map(item => ({
    //     repo: item.repository.full_name,
    //     sha: item.sha,
    //     message: item.commit.message,
    //     url: item.html_url,
    //     date: item.commit.author.date
    // }));
	console.log(output);
	return output; 
}

function renderCommits(commits) {
	commitsList.innerHTML = "";

	if (!commits.length) {
		commitsList.textContent = "No commits found.";
		return;
	}
	const fragment = document.createDocumentFragment();

for (const commit of commits) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    // Use repo name and commit info from the commit object
    const repoName = commit.repo;
    const sha = commit.sha.slice(0, 7);
    const message = commit.message.split("\n")[0];
    const date = new Date(commit.date);
    const formattedDate = date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    a.href = commit.url; // full GitHub commit URL
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    // Create separate spans to avoid innerHTML issues
    const repoSpan = document.createElement("span");
    repoSpan.textContent = `${repoName} — ${message}`;
    const dateSpan = document.createElement("span");
    dateSpan.textContent = `${formattedDate} (${sha})`;
    dateSpan.style.display = "block"; // mimics <br>

    a.appendChild(repoSpan);
    a.appendChild(dateSpan);

    li.appendChild(a);
    fragment.appendChild(li);
}

	commitsList.appendChild(fragment);
}

async function loadCommits() {
	commitsList.textContent = "Loading commits…";

	try {
		const commits = await fetchCommits();
		renderCommits(commits);
	} catch (err) {
		console.error(err);
		commitsList.textContent = "Could not load commits.";
	}
}

window.addEventListener("DOMContentLoaded", loadCommits);
