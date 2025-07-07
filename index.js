const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const REPOSITORIES = [
  { url: "Fairyvmos/bruh-hub", type: "Branch" },
  { url: "SteamAutoCracks/ManifestHub", type: "Branch" },
];

const sanitizeFileName = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.\-_ ]/g, '_');
};

/**
 * Mengambil nama game dari Steam API menggunakan AppID.
 * @param {string} appId - AppID game.
 * @returns {Promise<string>} Nama game, atau AppID jika tidak ditemukan.
 */
const getGameName = async (appId) => {
  try {
    console.log('Mengambil daftar aplikasi dari Steam API...');
    const response = await axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
    const apps = response.data.applist.apps;
    const app = apps.find(a => a.appid == appId);

    if (app && app.name) {
      console.log(`Nama game ditemukan: ${app.name}`);
      return app.name;
    }

    console.warn(`Game dengan AppID ${appId} tidak ditemukan. Menggunakan AppID sebagai nama file.`);
    return appId; // Fallback ke appId jika tidak ditemukan
  } catch (error) {
    console.error('Gagal mengambil nama game dari Steam API:', error.message);
    return appId; // Fallback jika API error
  }
};

app.get('/api/download', async (req, res) => {
  const { appId } = req.query;

  if (!appId) {
    return res.status(400).json({
      status: 'error',
      message: 'appId diperlukan.',
    });
  }

  const gameName = await getGameName(appId);
  const finalFileName = `${sanitizeFileName(gameName)}-Nzr.zip`;

  try {
    for (const repo of REPOSITORIES) {
      if (repo.type === 'Branch') {
        const url = `https://api.github.com/repos/${repo.url}/zipball/${appId}`;
        console.log(`Mencoba stream dari: ${url}`);

        try {
          const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
          });

          res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
          res.setHeader('Content-Type', 'application/zip');

          response.data.pipe(res);
          return;

        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`Branch '${appId}' tidak ditemukan di ${repo.url}. Mencoba selanjutnya...`);
            continue;
          }
          throw error;
        }
      }
    }

    res.status(404).json({
      status: 'not_found',
      message: `Game dengan appId "${appId}" tidak ditemukan di semua repositori.`,
    });
  } catch (error) {
    console.error('Terjadi error tak terduga:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan internal pada server.',
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log('Frontend siap diakses di alamat yang sama.');
});