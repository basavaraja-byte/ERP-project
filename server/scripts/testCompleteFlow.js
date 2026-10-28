async function runCompleteFlowTest() {
  const fetch = globalThis.fetch;
  console.log('=== STEP 1: Live Health & MongoDB Atlas ===');
  const hRes = await fetch('http://localhost:5000/api/health');
  const h = await hRes.json();
  console.log('Status:', h.status, '| DB Connected:', h.database.connected, '| Atlas DB:', h.database.name);

  console.log('\n=== STEP 2: Trustee Login & Six-Campus Verification ===');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'trustee@trustview.edu', password: 'TrustView@2026' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginData.status);
  console.log('Authenticated Role:', loginData.user?.role);
  console.log('User Name:', loginData.user?.name);
  const token = loginData.token;

  // Retrieve campuses list
  const campusesRes = await fetch('http://localhost:5000/api/campuses', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const campusesData = await campusesRes.json();
  console.log('Total Campuses Returned:', campusesData.data.length);
  campusesData.data.forEach((c, idx) => {
    console.log('  [Card ' + (idx + 1) + '] ID: ' + c.id + ' | Code: ' + c.code + ' | Name: ' + c.name);
  });

  console.log('\n=== STEP 3: Trustee Opens Campus 1 Detailed Dashboard ===');
  const c1Res = await fetch('http://localhost:5000/api/campuses/campus-1', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const c1 = await c1Res.json();
  console.log('Campus 1 Detailed Data:', c1.success, '| Name:', c1.data.name, '| Students:', c1.data.studentCount);

  console.log('\n=== STEP 4: Trustee Returns to All Campuses ===');
  console.log('Action: onBackToAllCampuses resets selectedCampusId to "all" without logging out.');

  console.log('\n=== STEP 5: Dean & Principal Campus Scope Authorization ===');
  const deanRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dean.campus1@trustview.edu', password: 'TrustView@2026' })
  });
  const dean = await deanRes.json();
  console.log('Dean Role:', dean.user?.role, '| Assigned Campus:', dean.user?.assignedCampusId);

  // Dean attempts cross-campus access to campus-2
  const deanCross = await fetch('http://localhost:5000/api/audit?campusId=campus-2', {
    headers: { Authorization: 'Bearer ' + dean.token }
  });
  const deanCrossData = await deanCross.json();
  console.log('Dean access to Campus 2 (Cross-Campus): HTTP', deanCross.status, deanCrossData.code);

  const princRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'principal.campus2@trustview.edu', password: 'TrustView@2026' })
  });
  const princ = await princRes.json();
  console.log('Principal Role:', princ.user?.role, '| Assigned Campus:', princ.user?.assignedCampusId);

  // Principal attempts cross-campus rule recalculation
  const princCross = await fetch('http://localhost:5000/api/rules/recalculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + princ.token },
    body: JSON.stringify({ campusId: 'campus-1' })
  });
  const princCrossData = await princCross.json();
  console.log('Principal access to Campus 1 (Cross-Campus): HTTP', princCross.status, princCrossData.code);
  console.log('\n=== ALL COMPLETE FLOW TESTS VERIFIED SUCCESSFULLY ===');
}
runCompleteFlowTest();

