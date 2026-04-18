import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/verify', (req, res) => {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server configuration error: ADMIN_PASSWORD is not set on Railway.' });
  }
  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Incorrect admin password.' });
});

app.post('/api/publish', async (req, res) => {
  const { password, data } = req.body;
  
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Incorrect or missing password.' });
  }
  
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error: GITHUB_TOKEN is not set on Railway. Cannot publish to GitHub.' });
  }

  const REPO = 'abdul-saboor-strack/Portfolio';
  const FILE_PATH = 'portfolio/src/content/siteData.js';
  const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  try {
    // 1. Fetch current file SHA
    const getRes = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-CMS'
      }
    });

    if (!getRes.ok) {
      const err = await getRes.json();
      return res.status(getRes.status).json({ error: `Failed to read GitHub file: ${err.message}` });
    }

    const fileInfo = await getRes.json();
    const sha = fileInfo.sha;

    // 2. Create updated file content (Base64)
    const newFileText = `export const siteData = ${JSON.stringify(data, null, 2)};\n`;
    const newBase64 = Buffer.from(newFileText).toString('base64');

    // 3. Commit to repository
    const putRes = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-CMS'
      },
      body: JSON.stringify({
        message: 'feat: update portfolio data from Live CMS',
        content: newBase64,
        sha: sha,
        branch: 'main'
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(putRes.status).json({ error: `Failed to commit to GitHub: ${err.message}` });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Publish API Error:', error);
    return res.status(500).json({ error: 'Internal server error while publishing data.' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Portfolio server started on port ${port}. Serving static build.`);
});
