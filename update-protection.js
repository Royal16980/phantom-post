#!/usr/bin/env node
// Use Vercel CLI's stored auth to disable deployment protection
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Find the auth token from vercel's config
const configDir = process.env.APPDATA 
  ? path.join(process.env.APPDATA, 'com.vercel.cli', 'Data')
  : path.join(os.homedir(), '.vercel');

let token;
try {
  const authFile = path.join(configDir, 'auth.json');
  const auth = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  token = auth.token;
  console.log('Found token:', token ? token.substring(0, 10) + '...' : 'null');
  console.log('Expires at:', new Date(auth.expiresAt * 1000).toISOString());
} catch (e) {
  console.error('Could not read auth:', e.message);
  process.exit(1);
}

// Call Vercel API to disable protection
const options = {
  hostname: 'api.vercel.com',
  path: '/v9/projects/prj_8PsJ3WrgyOqbi5CWEboN7QmDq2UM?teamId=team_01CKdo5YRCourL9eD7i184XW',
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
};

const body = JSON.stringify({ ssoProtection: null });

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200) {
      const proj = JSON.parse(data);
      console.log('ssoProtection:', proj.ssoProtection);
      console.log('Production alias:', proj.alias?.[0]);
      console.log('✅ Protection disabled!');
    } else {
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.write(body);
req.end();
req.on('error', e => console.error('Request error:', e.message));
