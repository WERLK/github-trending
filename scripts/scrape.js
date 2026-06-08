const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/trending.json');

async function fetchTrendingRepos() {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const since = date.toISOString().split('T')[0];
    
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `created:>${since}`,
        sort: 'stars',
        order: 'desc',
        per_page: 30
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const repos = response.data.items.map(repo => ({
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at
    }));

    const data = {
      fetched_at: new Date().toISOString(),
      repos: repos
    };

    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Successfully fetched ${repos.length} trending repos`);
    return data;
  } catch (error) {
    console.error('Error fetching trending repos:', error.message);
    throw error;
  }
}

if (require.main === module) {
  fetchTrendingRepos();
}

module.exports = fetchTrendingRepos;
