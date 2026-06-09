const https = require('https');
const fs = require('fs');

function fetchTrending() {
  return new Promise((resolve, reject) => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const since = date.toISOString().split('T')[0];
    const options = {
      hostname: 'api.github.com',
      path: '/search/repositories?q=created:>' + since + '&sort=stars&order=desc&per_page=30',
      headers: {
        'User-Agent': 'deploy-script',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN } : {})
      }
    };
    https.get(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

const langColors = {
  'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
  'Java': '#b07219', 'Go': '#00ADD8', 'Rust': '#dea584', 'C++': '#f34b7d',
  'C': '#555555', 'Ruby': '#701516', 'PHP': '#4F5D95', 'Swift': '#ffac45',
  'Kotlin': '#F18E33', 'Dart': '#00B4AB', 'HTML': '#e34c26',
  'CSS': '#563d7c', 'Vue': '#41b883', 'Shell': '#89e051'
};

async function main() {
  console.log('Fetching trending repos...');
  const json = await fetchTrending();
  const data = {
    fetched_at: new Date().toISOString(),
    repos: json.items.map(r => ({
      name: r.full_name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updated_at: r.updated_at
    }))
  };

  if (!fs.existsSync('data')) fs.mkdirSync('data');
  fs.writeFileSync('data/trending.json', JSON.stringify(data, null, 2));

  const reposHtml = data.repos.map(repo => {
    const langColor = langColors[repo.language] || '#858585';
    return '      <div class="repo-card">' +
      '<a href="' + repo.url + '" target="_blank" class="repo-name">' + repo.name + '</a>' +
      '<p class="repo-description">' + (repo.description || '暂无描述') + '</p>' +
      '<div class="repo-meta">' +
      (repo.language ? '<div class="meta-item"><span class="language" style="background-color:' + langColor + '"></span>' + repo.language + '</div>' : '') +
      '<div class="meta-item stars">⭐ ' + repo.stars.toLocaleString() + '</div>' +
      '<div class="meta-item forks">🍴 ' + repo.forks.toLocaleString() + '</div>' +
      '</div>' +
      '</div>';
  }).join('\n');

  const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>GitHub 每日热点</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}.container{max-width:1200px;margin:0 auto}header{text-align:center;color:white;margin-bottom:40px;padding:20px 0}header h1{font-size:2.5rem;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,0.2)}.last-update{font-size:0.9rem;opacity:0.9}.repos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px}.repo-card{background:white;border-radius:12px;padding:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:transform 0.3s,box-shadow 0.3s}.repo-card:hover{transform:translateY(-4px);box-shadow:0 8px 25px rgba(0,0,0,0.2)}.repo-name{font-size:1.2rem;font-weight:600;color:#0366d6;margin-bottom:12px;text-decoration:none;display:inline-block;word-break:break-all}.repo-name:hover{text-decoration:underline}.repo-description{color:#586069;margin-bottom:16px;line-height:1.5;font-size:0.95rem;min-height:3em}.repo-meta{display:flex;flex-wrap:wrap;gap:16px;align-items:center}.meta-item{display:flex;align-items:center;gap:6px;color:#586069;font-size:0.9rem}.language{width:12px;height:12px;border-radius:50%;display:inline-block}.stars{color:#f1c40f}.forks{color:#3498db}</style></head><body><div class="container"><header><h1>🔥 GitHub 每日热点</h1><div class="last-update">最后更新: ' + new Date(data.fetched_at).toLocaleString('zh-CN') + '</div></header><div class="repos-grid">' + reposHtml + '</div></div></body></html>';

  fs.writeFileSync('index.html', html);
  console.log('Done! Generated with ' + data.repos.length + ' repos');
}

main().catch(err => { console.error(err); process.exit(1); });
