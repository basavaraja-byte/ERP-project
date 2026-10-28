import app from '../src/app.js';
import { User } from '../src/models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '') : '';
if (uri && (uri.includes('<') || uri.includes('>'))) {
  uri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, (_match, user, pass) => {
    return `mongodb+srv://${user.replace(/^<|>$/g, '')}:${pass.replace(/^<|>$/g, '')}@`;
  });
}

async function testLiveAuth() {
  await mongoose.connect(uri, { dbName: 'trustview_erp' });
  const server = app.listen(5099);

  try {
    console.log('Testing Trustee login...');
    const res1 = await fetch('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'trustee@trustview.edu', password: 'TrustView@2026' })
    });
    const data1 = await res1.json();
    console.log('Trustee login status:', res1.status, data1.status, data1.user?.role, 'Token received:', Boolean(data1.token));

    console.log('\nTesting Dean login...');
    const res2 = await fetch('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dean.campus1@trustview.edu', password: 'TrustView@2026' })
    });
    const data2 = await res2.json();
    console.log('Dean login status:', res2.status, data2.status, data2.user?.role, 'Campus:', data2.user?.assignedCampusId);

    console.log('\nTesting HOD login...');
    const res3 = await fetch('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hod.cs@trustview.edu', password: 'TrustView@2026' })
    });
    const data3 = await res3.json();
    console.log('HOD login status:', res3.status, data3.status, data3.user?.role, 'Dept:', data3.user?.department);

    console.log('\nTesting invalid password...');
    const res4 = await fetch('http://localhost:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'trustee@trustview.edu', password: 'WrongPassword' })
    });
    const data4 = await res4.json();
    console.log('Bad login status (expected 401):', res4.status, data4.code);

    console.log('\nTesting GET /api/auth/me with JWT...');
    const res5 = await fetch('http://localhost:5099/api/auth/me', {
      headers: { 'Authorization': `Bearer ${data1.token}` }
    });
    const data5 = await res5.json();
    console.log('/me status:', res5.status, data5.user?.name, data5.user?.role);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testLiveAuth().catch(console.error);
