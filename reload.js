const commitsList = document.getElementById('recent-commits');
async function fetchLatestCommits(owner, token = null) {
  const headers = {
    Accept: "application/vnd.github+json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const reposRes = await fetch(
    `https://api.github.com/users/${owner}/repos?per_page=100&type=owner`,
    { headers }
  );
  if (!reposRes.ok) {
    throw new Error(`GitHub API error: ${reposRes.status}`);
  }
  const repos = await reposRes.json();
  console.log(`Found ${repos.length} repositories`);
  const commitsPromises = repos.map(async (repo) => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo.name}/commits?per_page=10`,
        { headers }
      );
      if (!res.ok) {
        console.warn(`Failed to fetch commits for ${repo.name}: ${res.status}`);
        return [];
      }
      const commits = await res.json();
      return commits;
    } catch (err) {
      console.warn(`Error fetching commits for ${repo.name}:`, err);
      return [];
    }
  });

  const allCommitsArrays = await Promise.all(commitsPromises);

  const allCommits = allCommitsArrays.flat();

  allCommits.sort((a, b) => {
    const dateA = new Date(a.commit.author.date);
    const dateB = new Date(b.commit.author.date);
    return dateB - dateA;
  });
  const latest10 = allCommits.slice(0, 10);
  return latest10;
}

function renderCommits(commits, owner) {
	commitsList.innerHTML = "";

	if (!commits.length) {
		commitsList.textContent = "No commits found.";
		return;
	}
	const fragment = document.createDocumentFragment();

	for (const commit of commits) {
		const li = document.createElement("li");
		const a = document.createElement("a");
		
		const dateStr = commit.commit.author.date;
		const date = new Date(dateStr);
		const formattedDate = date.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
		
		const sha = commit.sha.slice(0, 7);
		
		const repo = commit.html_url.split('/')[4];
		
		const message = commit.commit.message.split("\n")[0];

		a.href = `https://github.com/TallCheesecake/${repo}/commit/${sha}`;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.innerHTML = `${repo} — ${message}<br>${formattedDate}`;
		li.appendChild(a);
		fragment.appendChild(li);
	}
	commitsList.appendChild(fragment);
}

async function loadCommits() {
	commitsList.textContent = "Loading commits…";
	try {
		const commits = await fetchLatestCommits('TallCheesecake');
		renderCommits(commits, 'TallCheesecake');
	} catch (err) {
		console.error(err);
		commitsList.textContent = "Could not load commits.";
	}
}

window.addEventListener("DOMContentLoaded", loadCommits);
