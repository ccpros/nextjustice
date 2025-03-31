// lib/github.ts

export async function fetchGitHubFile(repo: string, path: string, branch = "main") {
    const token = process.env.GITHUB_ACCESS_TOKEN;
  
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );
  
    if (!res.ok) {
      throw new Error(`GitHub fetch failed: ${res.statusText}`);
    }
  
    return await res.text();
  }
  