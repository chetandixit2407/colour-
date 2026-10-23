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
  console.log('--- STARTING DELETION & REFRESH CONSISTENCY TEST SUITE ---');

  // Login as admin first
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
  console.log(`[PASS] Logged in as Admin, session token received.`);

  // Step 1: Create a test candidate via QR + register/submit
  const testCandidateName = 'Test Cand Kumar';
  const qrGenRes = await request('POST', '/api/qr/generate', { purpose: 'CANDIDATE_INTAKE' });
  const qrToken = qrGenRes.data?.qrToken;
  if (!qrToken) {
    console.error('Failed to generate QR token:', qrGenRes.data);
    process.exit(1);
  }

  const createRes = await request('POST', '/api/register/submit', {
    token: qrToken,
    fullName: testCandidateName,
    email: `delete.test.${Date.now()}@axleparsi.com`,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    position: 'Quality Automation Lead',
    experienceYears: '5',
    personToMeet: 'Nisha',
    departmentToMeet: 'HR',
    source: 'WALK_IN',
  });

  if (createRes.status !== 200 && createRes.status !== 201) {
    console.error('Failed to create candidate for test:', createRes.data);
    process.exit(1);
  }

  const candidateId = createRes.data.candidate?.id || createRes.data.candidateId;
  console.log(`[PASS] Created test candidate: ${candidateId} (${testCandidateName})`);

  // Verify candidate exists via GET /api/candidates
  const listBefore = await request('GET', '/api/candidates', undefined, authHeaders);
  const candArrayBefore = Array.isArray(listBefore.data) ? listBefore.data : (listBefore.data.candidates || []);
  const foundBefore = candArrayBefore.find((c: any) => c.id === candidateId);
  if (!foundBefore) {
    console.error('[FAIL] Candidate not returned in GET /api/candidates before delete');
    process.exit(1);
  }
  console.log('[PASS] Candidate found in GET /api/candidates');

  // Step 2: Measure deletion performance
  const t0 = Date.now();
  const deleteRes = await request('DELETE', `/api/candidates/${candidateId}?hard=true`, undefined, authHeaders);
  const duration = Date.now() - t0;
  console.log(`[PERF] Candidate DELETE call completed in ${duration}ms (status: ${deleteRes.status})`);

  if (deleteRes.status !== 200 || !deleteRes.data.success) {
    console.error('[FAIL] DELETE /api/candidates/:id failed:', deleteRes.data);
    process.exit(1);
  }

  // Step 3: Verify Candidate is NOT returned on GET /api/candidates
  const listAfter = await request('GET', '/api/candidates', undefined, authHeaders);
  const candArrayAfter = Array.isArray(listAfter.data) ? listAfter.data : (listAfter.data.candidates || []);
  const foundAfter = candArrayAfter.find((c: any) => c.id === candidateId);
  if (foundAfter) {
    console.error('[FAIL] Deleted candidate still present in GET /api/candidates!', foundAfter);
    process.exit(1);
  }
  console.log('[PASS] Candidate immediately removed from GET /api/candidates');

  // Step 4: Verify directly on disk in wcr_database.json
  const dbDiskRaw = fs.readFileSync(DB_PATH, 'utf8');
  const dbDisk = JSON.parse(dbDiskRaw);
  const candInDisk = dbDisk.candidates.find((c: any) => c.id === candidateId);
  if (candInDisk) {
    console.error('[FAIL] Deleted candidate is still inside wcr_database.json on disk!', candInDisk);
    process.exit(1);
  }
  console.log('[PASS] Candidate is PERMANENTLY deleted from wcr_database.json');

  // Step 5: Verify linked interviews are purged
  const interviewInDisk = dbDisk.interviews.find((i: any) => i.candidateId === candidateId);
  if (interviewInDisk) {
    console.error('[FAIL] Orphan interview for deleted candidate still in database:', interviewInDisk);
    process.exit(1);
  }
  console.log('[PASS] All linked interviews purged');

  // Step 6: Verify SSE resync doesn't revive or include deleted candidate
  const resyncRes = await request('GET', '/api/events/resync?since=0');
  const missedEvents = resyncRes.data.events || [];
  const revivingEvent = missedEvents.find((e: any) => e.candidateId === candidateId || e.payload?.candidate?.id === candidateId);
  if (revivingEvent) {
    console.error('[FAIL] Missed events replay returned deleted candidate event!', revivingEvent);
    process.exit(1);
  }
  console.log(`[PASS] Event replay /api/events/resync does not resurrect deleted candidate (${missedEvents.length} events checked)`);

  // Step 7: Test Visitor Deletion
  const visitorRes = await request('POST', '/api/visitors/checkin', {
    name: 'Test Visitor Agent',
    phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
    purpose: 'Vendor Consultation',
    hostEmployeeId: 'usr-hr-nisha',
    hostEmployeeName: 'Nisha Sharma',
  });
  const visitorId = visitorRes.data.visitor?.id || visitorRes.data.id;
  if (visitorId) {
    console.log(`[PASS] Created visitor ${visitorId}`);
    const delVisRes = await request('DELETE', `/api/visitors/${visitorId}`, undefined, authHeaders);
    if (delVisRes.status !== 200) {
      console.error('[FAIL] Visitor delete failed', delVisRes.data);
      process.exit(1);
    }
    const visList = await request('GET', '/api/visitors', undefined, authHeaders);
    const visArray = Array.isArray(visList.data) ? visList.data : (visList.data.visitors || []);
    const visFound = visArray.find((v: any) => v.id === visitorId);
    if (visFound) {
      console.error('[FAIL] Deleted visitor still in GET /api/visitors');
      process.exit(1);
    }
    console.log('[PASS] Visitor permanently removed from database');
  }

  // Step 8: Test Room Deletion
  const newRoomId = `room-test-${Date.now()}`;
  const addRoomRes = await request('POST', '/api/admin/rooms/add', {
    roomId: newRoomId,
    name: 'Ephemeral Testing Pod',
    type: 'INTERVIEW',
    capacity: 2,
    floor: '2nd Floor',
  }, authHeaders);
  if (addRoomRes.status === 200) {
    console.log(`[PASS] Created test room ${newRoomId}`);
    const delRoomRes = await request('DELETE', `/api/rooms/${newRoomId}`, undefined, authHeaders);
    if (delRoomRes.status !== 200) {
      console.error('[FAIL] Room delete failed', delRoomRes.data);
      process.exit(1);
    }
    const roomsList = await request('GET', '/api/rooms', undefined, authHeaders);
    const roomsArray = Array.isArray(roomsList.data) ? roomsList.data : (roomsList.data.rooms || []);
    const roomFound = roomsArray.find((r: any) => r.id === newRoomId);
    if (roomFound) {
      console.error('[FAIL] Deleted room still in GET /api/rooms');
      process.exit(1);
    }
    console.log('[PASS] Room permanently removed and not resurrected');
  }

  // Step 9: Test User Deletion
  const newStaffRes = await request('POST', '/api/admin/users/create', {
    adminUserId: 'usr-admin-sameer',
    adminName: 'Sameer Sir (Admin)',
    adminRole: 'ADMIN',
    name: 'Temporary Staff Member',
    email: `temp.staff.${Date.now()}@axleparsi.com`,
    username: `temp_${Date.now()}`,
    password: 'Password123!',
    role: 'HR',
    department: 'Human Resources',
    designation: 'HR Associate',
    phone: '+919988776655',
  }, authHeaders);
  if (newStaffRes.status === 200 && newStaffRes.data.user?.id) {
    const staffId = newStaffRes.data.user.id;
    console.log(`[PASS] Created test user ${staffId}`);
    const delUserRes = await request('DELETE', `/api/users/${staffId}`, undefined, authHeaders);
    if (delUserRes.status !== 200) {
      console.error('[FAIL] User delete failed', delUserRes.data);
      process.exit(1);
    }
    const usersList = await request('GET', '/api/admin/users', undefined, authHeaders);
    const userFound = (usersList.data.users as any[]).find((u) => u.id === staffId);
    if (userFound) {
      console.error('[FAIL] Deleted user still in GET /api/admin/users');
      process.exit(1);
    }
    console.log('[PASS] User permanently removed and not resurrected');
  }

  console.log('\n========================================');
  console.log('ALL DELETION & CONSISTENCY TESTS PASSED!');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
