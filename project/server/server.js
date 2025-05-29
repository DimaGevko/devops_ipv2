const express = require('express');
const fetch = require('node-fetch'); // Тепер посилається на node-fetch@2.7.0
const { google } = require('googleapis');
const model = require('./model');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Налаштування Google API
const auth = new google.auth.OAuth2(
    '198715010136-id0i60vvr2h4o04at01igs7smf99k2pf.apps.googleusercontent.com', // Замініть на ваш Client ID
    'AIzaSyCvbg3sFQOkFp915iAGVGgliKII7vtnWMM', // Замініть на ваш Client Secret
    'http://localhost:3000'
);
const drive = google.drive({ version: 'v3', auth });

// Ендпоінт для завантаження CSV
app.post('/api/upload', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).send('No file content');
    try {
        const data = model.parseCSV(content);
        if (data.length === 0) return res.status(400).send('No valid data in file');
        const result = model.performRegression(data);
        res.json(result);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send(err.message);
    }
});

// Ендпоінт для завантаження з Google Drive
app.get('/api/google-drive', async (req, res) => {
    const { fileId } = req.query;
    const authHeader = req.headers.authorization;
    if (!fileId || !authHeader) return res.status(400).send('File ID and authorization token are required');

    const token = authHeader.split(' ')[1];
    auth.setCredentials({ access_token: token });

    try {
        const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        let data = '';
        response.data.on('data', chunk => data += chunk);
        response.data.on('end', () => {
            const result = model.parseCSV(data);
            if (result.length === 0) return res.status(400).send('No valid data in file');
            res.json(model.performRegression(result));
        });
    } catch (err) {
        console.error('Google Drive error:', err);
        res.status(500).send('Error fetching from Google Drive: ' + err.message);
    }
});

// Ендпоінт для завантаження з GitHub
app.get('/api/github', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');
    try {
        const decodedUrl = decodeURIComponent(url);
        console.log('Attempting to fetch from GitHub URL:', decodedUrl); // Лог URL
        const response = await fetch(decodedUrl, { headers: { 'Accept': 'text/plain' } });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error: ${response.status} - ${errorText}`);
        }
        const content = await response.text();
        console.log('Fetched content length:', content.length); // Лог довжини вмісту
        const data = model.parseCSV(content);
        if (data.length === 0) return res.status(400).send('No valid data in file');
        res.json(model.performRegression(data));
    } catch (err) {
        console.error('GitHub fetch error:', err.message, err.stack); // Детальний лог помилки
        res.status(500).send('Error fetching from GitHub: ' + err.message);
    }
});

// Ендпоінт для регресії
app.post('/api/regression', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).send('No file content');
    try {
        const data = model.parseCSV(content);
        if (data.length === 0) return res.status(400).send('No valid data in file');
        const result = model.performRegression(data);
        res.json(result);
    } catch (err) {
        console.error('Regression error:', err);
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});