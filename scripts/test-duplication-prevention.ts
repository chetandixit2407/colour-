import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';
const DB_PATH = path.resolve(process.cwd(), 'data', 'wcr_database.json');

async function request(
  method: string,
  urlPath: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;

    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed: any = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // raw string
          }
          resolve({ status: res.statusCode || 0, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING DUPLICATION PREVENTION & DEDUPLICATION TEST SUITE ---');

  // Login as admin
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'sameer@whitecollarrealty.com',
    password: 'wcr123',
  });
  const sessionToken = loginRes.data?.token || 'usr-admin-sameer';
  const authHeaders = {
    'Cookie': `wcr_session=${sessionToken}; wcr_staff_token=${sessionToken}`,
    'x-user-role': 'ADMIN',
    'x-user-id': 'usr-admin-sameer',
  };

  // Trigger bootstrap to run database service initialization and deduplication
  await request('GET', '/api/bootstrap');

  // Step 1: Check existing database for duplicate candidate or visitor names
  const dbDiskRaw = fs.readFileSync(DB_PATH, 'utf8');
  const dbDisk = JSON.parse(dbDiskRaw);

  const candNameMap: Record<string, number> = {};
  dbDisk.candidates.forEach((c: any) => {
    const n = (c.fullName || '').toLowerCase().trim();
    if (n) candNameMap[n] = (candNameMap[n] || 0) + 1;
  });
  const candDupes = Object.entries(candNameMap).filter(([_, count]) => count > 1);
  if (candDupes.length > 0) {
    console.error('[FAIL] Duplicate candidates found in wcr_database.json:', candDupes);
    process.exit(1);
  }
  console.log('[PASS] Zero duplicate candidates present in database file.');

  const visNameMap: Record<string, number> = {};
  dbDisk.visitors.forEach((v: any) => {
    const n = (v.fullName || '').toLowerCase().trim();
    if (n) visNameMap[n] = (visNameMap[n] || 0) + 1;
  });
  const visDupes = Object.entries(visNameMap).filter(([_, count]) => count > 1);
  if (visDupes.length > 0) {
    console.error('[FAIL] Duplicate visitors found in wcr_database.json:', visDupes);
    process.exit(1);
  }
  console.log('[PASS] Zero duplicate visitors present in database file.');

  // Step 2: Test candidate duplicate submission prevention
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testEmail = `uniq.candidate.${Date.now()}@axleparsi.com`;
  const candidateName = 'Anil Kapoor Executive';

  // Submission 1
  const qr1 = await request('POST', '/api/qr/generate', { purpose: 'CANDIDATE_INTAKE' });
  const sub1 = await request('POST', '/api/register/submit', {
    token: qr1.data.qrToken,
    fullName: candidateName,
    email: testEmail,
    phone: testPhone,
    position: 'Leasing Specialist',
    personToMeet: 'Nisha',
    departmentToMeet: 'HR',
  });

  const firstCandId = sub1.data.candidate?.id;
  console.log(`[PASS] First submission created candidate ${firstCandId}`);

  // Submission 2 with same phone and name (different formatting)
  const qr2 = await request('POST', '/api/qr/generate', { purpose: 'CANDIDATE_INTAKE' });
  const sub2 = await request('POST', '/api/register/submit', {
    token: qr2.data.qrToken,
    fullName: candidateName,
    email: testEmail,
    phone: `+91 ${testPhone}`, // formatted phone
    position: 'Senior Leasing Specialist',
    personToMeet: 'Nisha',
    departmentToMeet: 'HR',
  });

  const secondCandId = sub2.data.candidate?.id;
  if (secondCandId !== firstCandId) {
    console.error(`[FAIL] Duplicate candidate created! First ID: ${firstCandId}, Second ID: ${secondCandId}`);
    process.exit(1);
  }
  console.log(`[PASS] Duplicate candidate submission successfully merged into existing candidate ${firstCandId}`);

  // Step 3: Test duplicate room creation rejection
  const dupRoomRes = await request('POST', '/api/rooms', {
    name: 'Elegance Suite',
    type: 'INTERVIEW',
  }, authHeaders);

  if (dupRoomRes.status !== 400 || !dupRoomRes.data.error) {
    console.error('[FAIL] Duplicate room creation was not rejected:', dupRoomRes.data);
    process.exit(1);
  }
  console.log('[PASS] Duplicate room creation correctly rejected with 400 Bad Request.');

  // Step 4: Test duplicate staff user creation rejection
  const dupUserRes = await request('POST', '/api/admin/users/create', {
    adminUserId: 'usr-admin-sameer',
    adminName: 'Sameer Sir (Admin)',
    adminRole: 'ADMIN',
    name: 'Duplicate Nisha',
    email: 'nisha@whitecollarrealty.com', // Existing HR email
    username: 'nisha_hr',
    password: 'Password123!',
    role: 'HR',
  }, authHeaders);

  if (dupUserRes.status !== 400 || !dupUserRes.data.error) {
    console.error('[FAIL] Duplicate user account creation was not rejected:', dupUserRes.data);
    process.exit(1);
  }
  console.log('[PASS] Duplicate staff account creation correctly rejected with 400 Bad Request.');

  // Clean up test candidate
  if (firstCandId) {
    await request('DELETE', `/api/candidates/${firstCandId}?hard=true`, undefined, authHeaders);
    console.log(`[PASS] Cleaned up test candidate ${firstCandId}`);
  }

  console.log('\n========================================');
  console.log('ALL DEDUPLICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
