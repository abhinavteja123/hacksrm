/**
 * ProofSnap Backend API Server
 * 
 * Provides:
 * - POST /api/detect       → AI deepfake detection proxy (SightEngine)
 * - POST /api/plagiarism   → Plagiarism / reverse image check
 * - POST /api/verify       → Verify a proof
 * - GET  /api/verify/:hash → Look up proof by file hash (Supabase)
 * - GET  /api/proofs       → Recent proofs feed (Supabase)
 * - GET  /api/health       → Health check
 * 
 * Storage: Supabase (PostgreSQL + Object Storage)
 * Blockchain: DataHaven Testnet (EVM-compatible, Chain ID 55931)
 * 
 * Deploy free on Render.com / Railway.app
 * Set env vars: SIGHTENGINE_USER, SIGHTENGINE_SECRET, SUPABASE_URL, SUPABASE_KEY, PORT
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Supabase (optional - gracefully degrades)
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
} catch (e) {
  console.warn('Supabase not available:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Multer for file uploads (temp storage)
const upload = multer({
  dest: path.join(__dirname, 'tmp'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ──────────────── Health Check ────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ProofSnap API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────── AI Deepfake Detection ────────────────
app.post('/api/detect', upload.single('media'), async (req, res) => {
  const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
  const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;

  try {
    // If no SightEngine credentials, return simulation
    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      console.log('[detect] No SightEngine credentials. Returning simulated result.');
      cleanupFile(req.file?.path);

      return res.json({
        simulated: true,
        deepfake: {
          score: Math.random() * 0.15,
          isDeepfake: false,
        },
        aiGenerated: {
          score: Math.random() * 0.1,
          isAIGenerated: false,
        },
        quality: {
          score: 0.85 + Math.random() * 0.15,
        },
        raw: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    // Call SightEngine API
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('media', fs.createReadStream(req.file.path));
    form.append('models', 'deepfake,genai');
    form.append('api_user', SIGHTENGINE_USER);
    form.append('api_secret', SIGHTENGINE_SECRET);

    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    cleanupFile(req.file.path);

    if (data.status === 'failure') {
      console.error('[detect] SightEngine error:', data.error);
      return res.status(500).json({ error: 'Detection service error', details: data.error });
    }

    // Parse SightEngine response
    const deepfakeScore = data.deepfake?.score ?? 0;
    const aiGeneratedScore = data.type?.ai_generated ?? 0;

    res.json({
      simulated: false,
      deepfake: {
        score: deepfakeScore,
        isDeepfake: deepfakeScore > 0.5,
      },
      aiGenerated: {
        score: aiGeneratedScore,
        isAIGenerated: aiGeneratedScore > 0.5,
      },
      quality: {
        score: data.quality?.score ?? 0.9,
      },
      raw: data,
    });
  } catch (err) {
    console.error('[detect] Error:', err);
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────── Plagiarism / Reverse Image Check ────────────────
app.post('/api/plagiarism', upload.single('media'), async (req, res) => {
  try {
    // Simulate plagiarism check (real implementation would use
    // TinEye API, Google Vision, or Bing Visual Search)
    cleanupFile(req.file?.path);

    const similarityScore = Math.random() * 15; // 0-15% = mostly original
    const hash = crypto.randomBytes(16).toString('hex');

    res.json({
      simulated: true,
      plagiarismScore: Math.round(similarityScore),
      isOriginal: similarityScore < 20,
      matches: similarityScore > 10 ? [{
        source: 'stock-photos.example.com',
        similarity: Math.round(similarityScore),
        url: `https://example.com/image/${hash}`,
      }] : [],
      checkId: hash,
    });
  } catch (err) {
    console.error('[plagiarism] Error:', err);
    cleanupFile(req.file?.path);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────── Verify Proof Endpoint ────────────────
app.post('/api/verify', express.json(), async (req, res) => {
  const { fileHash, signature, publicKey } = req.body;

  if (!fileHash || !signature || !publicKey) {
    return res.status(400).json({ error: 'Missing required fields: fileHash, signature, publicKey' });
  }

  // Check Supabase if configured
  let supabaseMatch = null;
  if (supabase) {
    try {
      const { data } = await supabase
        .from('proofs')
        .select('*')
        .eq('file_hash', fileHash)
        .single();
      supabaseMatch = data;
    } catch { }
  }

  res.json({
    fileHash,
    publicKeyPrefix: publicKey.substring(0, 16) + '...',
    timestamp: new Date().toISOString(),
    status: supabaseMatch ? 'verified' : 'signature_present',
    supabaseRecord: supabaseMatch,
    blockchain: 'DataHaven Testnet (Chain ID: 55931)',
    note: 'Full cryptographic verification is performed client-side using Ed25519',
  });
});

// ──────────────── Lookup Proof by Hash (Supabase) ────────────────
app.get('/api/verify/:hash', async (req, res) => {
  const { hash } = req.params;

  if (!supabase) {
    return res.json({
      found: false,
      message: 'Supabase not configured. Proof lookup unavailable.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .eq('file_hash', hash)
      .single();

    if (error || !data) {
      return res.json({ found: false, hash });
    }

    res.json({ found: true, proof: data });
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// ──────────────── Recent Proofs Feed (Supabase) ────────────────
app.get('/api/proofs', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  if (!supabase) {
    return res.json({ proofs: [], message: 'Supabase not configured.' });
  }

  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch proofs' });
    }

    res.json({ proofs: data, count: data.length });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────── Cleanup helper ────────────────
function cleanupFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Failed to cleanup temp file:', filePath);
    }
  }
}

// ──────────────── Start Server ────────────────
app.listen(PORT, () => {
  console.log(`\n  🛡️  ProofSnap API running on port ${PORT}`);
  console.log(`  📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`  🔍 Detect: POST http://localhost:${PORT}/api/detect`);
  console.log(`  🔎 Plagiarism: POST http://localhost:${PORT}/api/plagiarism`);
  console.log(`  ⛓️  Blockchain: DataHaven Testnet (Chain ID: 55931)\n`);

  if (!process.env.SIGHTENGINE_USER) {
    console.log('  ⚠️  SIGHTENGINE_USER not set — using simulated detection');
  }
  if (!supabase) {
    console.log('  ⚠️  SUPABASE_URL/SUPABASE_KEY not set — cloud storage disabled');
  }
  console.log('');
});
