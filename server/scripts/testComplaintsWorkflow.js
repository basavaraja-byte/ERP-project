import app from '../src/app.js';
import http from 'http';

async function runTests() {
  console.log('='.repeat(60));
  console.log('  TrustView ERP — Automated Complaint Management Verification');
  console.log('='.repeat(60));

  const baseUrl = `http://localhost:5000/api`;

  try {
    // 1. Authenticate as Student (Rahul Sharma - Campus 1)
    console.log('\n[Step 1] Authenticating as Student (student.rahul@trustview.edu)...');
    const stuLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student.rahul@trustview.edu', password: 'TrustView@2026' })
    });
    const stuAuth = await stuLoginRes.json();
    if (!stuAuth.token) throw new Error('Student login failed: ' + JSON.stringify(stuAuth));
    console.log(`✓ Student authenticated: ${stuAuth.user.name} (${stuAuth.user.role}, Campus: ${stuAuth.user.assignedCampusId})`);

    // 2. Submit Complaint as Student
    console.log('\n[Step 2] Submitting Grievance as Student...');
    const complaintPayload = {
      title: 'Lab 2 Workstation monitor flickering',
      description: 'Monitor #14 in Lab 2 has severe flickering during morning practical hours.',
      category: 'Lab & Infrastructure',
      priority: 'Medium'
    };
    const postRes = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stuAuth.token}`
      },
      body: JSON.stringify(complaintPayload)
    });
    const postData = await postRes.json();
    if (postRes.status !== 201 || !postData.data) {
      throw new Error(`Failed to submit complaint (HTTP ${postRes.status}): ${JSON.stringify(postData)}`);
    }
    const createdComplaint = postData.data;
    console.log(`✓ Complaint created: ${createdComplaint.complaintId} — "${createdComplaint.title}"`);
    console.log(`  Derived Submitter: ${createdComplaint.submitterName} (${createdComplaint.submitterRole})`);
    console.log(`  Campus: ${createdComplaint.campusId}, Status: ${createdComplaint.status}`);

    // Verify auto-derived fields
    if (createdComplaint.submitterRole !== 'STUDENT') throw new Error('Role mismatch in complaint');
    if (createdComplaint.campusId !== 'campus-1') throw new Error('Campus mismatch in complaint');

    // 3. Authenticate as Parent (Mr. Ramesh Sharma - Campus 1)
    console.log('\n[Step 3] Authenticating as Parent (parent.sharma@trustview.edu)...');
    const parLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'parent.sharma@trustview.edu', password: 'TrustView@2026' })
    });
    const parAuth = await parLoginRes.json();
    if (!parAuth.token) throw new Error('Parent login failed: ' + JSON.stringify(parAuth));
    console.log(`✓ Parent authenticated: ${parAuth.user.name} (${parAuth.user.role}, Linked Ward: ${parAuth.user.wardStudentId})`);

    // Submit Grievance as Parent
    const parComplaintPayload = {
      title: 'Bus route #4 arrival delay notification request',
      description: 'Requesting SMS notification when bus route #4 departs from main campus.',
      category: 'Administration',
      priority: 'Low'
    };
    const parPostRes = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parAuth.token}`
      },
      body: JSON.stringify(parComplaintPayload)
    });
    const parPostData = await parPostRes.json();
    if (parPostRes.status !== 201 || !parPostData.data) {
      throw new Error(`Failed to submit parent complaint: ${JSON.stringify(parPostData)}`);
    }
    console.log(`✓ Parent Complaint created: ${parPostData.data.complaintId}`);

    // 4. Authenticate as HOD Campus 1
    console.log('\n[Step 4] Authenticating as HOD (hod.cs@trustview.edu)...');
    const hodLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hod.cs@trustview.edu', password: 'TrustView@2026' })
    });
    const hodAuth = await hodLoginRes.json();
    if (!hodAuth.token) throw new Error('HOD login failed: ' + JSON.stringify(hodAuth));
    console.log(`✓ HOD authenticated: ${hodAuth.user.name} (${hodAuth.user.role}, Campus: ${hodAuth.user.assignedCampusId})`);

    // 5. Query Complaints as HOD
    console.log('\n[Step 5] Fetching Complaints as HOD...');
    const getRes = await fetch(`${baseUrl}/complaints`, {
      headers: { 'Authorization': `Bearer ${hodAuth.token}` }
    });
    const getData = await getRes.json();
    if (getRes.status !== 200 || !Array.isArray(getData.data)) {
      throw new Error(`Failed to fetch HOD complaints: ${JSON.stringify(getData)}`);
    }
    console.log(`✓ HOD retrieved ${getData.data.length} complaints for ${hodAuth.user.assignedCampusId}`);
    const found = getData.data.find(c => c.complaintId === createdComplaint.complaintId);
    if (!found) throw new Error(`Newly created complaint ${createdComplaint.complaintId} was not returned to HOD!`);
    console.log(`✓ Confirmed newly submitted student complaint is visible on HOD Grievance Desk.`);

    // 6. Update Status as HOD: Transition to "Under Review"
    console.log('\n[Step 6] Updating Status to "Under Review" as HOD...');
    const patchRes1 = await fetch(`${baseUrl}/complaints/${createdComplaint.complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hodAuth.token}`
      },
      body: JSON.stringify({
        status: 'Under Review',
        resolutionNotes: 'Hardware lab technician dispatched to inspect monitor cable.',
        assignedTo: 'Prof. K. Swaminathan'
      })
    });
    const patchData1 = await patchRes1.json();
    if (patchRes1.status !== 200 || patchData1.data?.status !== 'Under Review') {
      throw new Error(`Failed to update to Under Review: ${JSON.stringify(patchData1)}`);
    }
    console.log(`✓ Status successfully transitioned to: ${patchData1.data.status}`);

    // 7. Update Status as HOD: Transition to "Resolved"
    console.log('\n[Step 7] Resolving Grievance as HOD...');
    const patchRes2 = await fetch(`${baseUrl}/complaints/${createdComplaint.complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hodAuth.token}`
      },
      body: JSON.stringify({
        status: 'Resolved',
        resolutionNotes: 'Faulty HDMI cable replaced. Display confirmed stable at 75Hz.'
      })
    });
    const patchData2 = await patchRes2.json();
    if (patchRes2.status !== 200 || patchData2.data?.status !== 'Resolved') {
      throw new Error(`Failed to update to Resolved: ${JSON.stringify(patchData2)}`);
    }
    console.log(`✓ Status successfully transitioned to: ${patchData2.data.status} by ${patchData2.data.resolvedBy}`);

    // 8. Test RBAC: Faculty cannot update complaint status
    console.log('\n[Step 8] Verifying Faculty cannot update complaint status (RBAC test)...');
    const facLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty.cs@trustview.edu', password: 'TrustView@2026' })
    });
    const facAuth = await facLoginRes.json();
    const facPatchRes = await fetch(`${baseUrl}/complaints/${createdComplaint.complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facAuth.token}`
      },
      body: JSON.stringify({ status: 'Rejected' })
    });
    if (facPatchRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Faculty, got ${facPatchRes.status}`);
    }
    console.log(`✓ Correctly rejected with HTTP 403 Forbidden for Faculty.`);

    // 9. Test Cross-Campus Isolation: HOD from Campus 2 cannot modify Campus 1 complaint
    console.log('\n[Step 9] Verifying Cross-Campus Boundary Protection...');
    // Create or use Dean/Principal from Campus 2
    const dean2LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dean.campus2@trustview.edu', password: 'TrustView@2026' })
    });
    const dean2Auth = await dean2LoginRes.json();
    const crossRes = await fetch(`${baseUrl}/complaints/${createdComplaint.complaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dean2Auth.token}`
      },
      body: JSON.stringify({ status: 'Rejected' })
    });
    if (crossRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-campus modification, got ${crossRes.status}`);
    }
    console.log(`✓ Correctly rejected cross-campus tampering with HTTP 403 Forbidden.`);

    // 10. Form Validation: Blank fields rejected
    console.log('\n[Step 10] Testing Blank Submission Validation...');
    const blankRes = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${stuAuth.token}`
      },
      body: JSON.stringify({ title: '   ', description: '', category: '' })
    });
    if (blankRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for blank title, got ${blankRes.status}`);
    }
    console.log(`✓ Correctly rejected blank submission with HTTP 400 Validation Error.`);

    console.log('\n' + '='.repeat(60));
    console.log('  ALL 10 COMPLAINTS & GRIEVANCE TESTS PASSED WITH 100% SUCCESS!');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('\n[VERIFICATION FAILED]:', err.message);
    process.exit(1);
  }
}

runTests();
