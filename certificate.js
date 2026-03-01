/**
 * DSCE Clubs — Digital Certificate Generator
 * Generates beautiful, downloadable certificates using HTML5 Canvas
 */

const CertificateGenerator = (() => {
    const API_BASE = 'http://localhost:3000/api/certificates';

    /* ------------------------------------------------------------------ */
    /*  Canvas Rendering                                                    */
    /* ------------------------------------------------------------------ */

    function drawCertificate(canvas, data) {
        const ctx = canvas.getContext('2d');
        const W = 1200;
        const H = 850;
        canvas.width = W;
        canvas.height = H;

        // ---------- Background ----------
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#0f0c29');
        bgGrad.addColorStop(0.5, '#1a1a3e');
        bgGrad.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Subtle star field
        for (let i = 0; i < 120; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const r = Math.random() * 1.5 + 0.3;
            const alpha = Math.random() * 0.6 + 0.2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fill();
        }

        // ---------- Decorative corner accents ----------
        drawCornerAccents(ctx, W, H);

        // ---------- Golden border ----------
        const borderPad = 30;
        ctx.strokeStyle = 'rgba(255, 215, 100, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(borderPad, borderPad, W - borderPad * 2, H - borderPad * 2);

        ctx.strokeStyle = 'rgba(255, 215, 100, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(borderPad + 8, borderPad + 8, W - (borderPad + 8) * 2, H - (borderPad + 8) * 2);

        // ---------- Glowing orb behind title ----------
        const orbGrad = ctx.createRadialGradient(W / 2, 140, 10, W / 2, 140, 200);
        orbGrad.addColorStop(0, 'rgba(108, 92, 231, 0.35)');
        orbGrad.addColorStop(0.5, 'rgba(253, 121, 168, 0.15)');
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, W, 300);

        // ---------- Logo / emoji ----------
        ctx.font = '48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌌', W / 2, 100);

        // ---------- "DSCE Clubs" ----------
        ctx.font = 'bold 18px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 215, 100, 0.9)';
        ctx.letterSpacing = '4px';
        ctx.fillText('D S C E   C L U B S', W / 2, 140);

        // ---------- CERTIFICATE OF PARTICIPATION ----------
        ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
        const titleGrad = ctx.createLinearGradient(W / 2 - 250, 0, W / 2 + 250, 0);
        titleGrad.addColorStop(0, '#6c5ce7');
        titleGrad.addColorStop(0.5, '#fd79a8');
        titleGrad.addColorStop(1, '#a29bfe');
        ctx.fillStyle = titleGrad;
        ctx.fillText('Certificate of Participation', W / 2, 210);

        // ---------- Decorative divider ----------
        drawDivider(ctx, W / 2, 240, 300);

        // ---------- "This is to certify that" ----------
        ctx.font = '16px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('This is to certify that', W / 2, 290);

        // ---------- Attendee Name ----------
        ctx.font = 'bold 40px "Playfair Display", Georgia, serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(data.attendeeName || 'Student Name', W / 2, 350);

        // ---------- Underline ----------
        const nameWidth = ctx.measureText(data.attendeeName || 'Student Name').width;
        const lineGrad = ctx.createLinearGradient(W / 2 - nameWidth / 2, 0, W / 2 + nameWidth / 2, 0);
        lineGrad.addColorStop(0, 'rgba(108,92,231,0)');
        lineGrad.addColorStop(0.3, 'rgba(253,121,168,0.8)');
        lineGrad.addColorStop(0.7, 'rgba(253,121,168,0.8)');
        lineGrad.addColorStop(1, 'rgba(108,92,231,0)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W / 2 - nameWidth / 2 - 20, 362);
        ctx.lineTo(W / 2 + nameWidth / 2 + 20, 362);
        ctx.stroke();

        // ---------- "has successfully participated in" ----------
        ctx.font = '16px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('has successfully participated in', W / 2, 405);

        // ---------- Event Name ----------
        ctx.font = 'bold 32px "Playfair Display", Georgia, serif';
        const evGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
        evGrad.addColorStop(0, '#ffd166');
        evGrad.addColorStop(1, '#ffbe76');
        ctx.fillStyle = evGrad;
        ctx.fillText(data.eventName || 'Event Name', W / 2, 458);

        // ---------- Club + Date info ----------
        ctx.font = '15px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        const clubLabel = getClubLabel(data.clubName);
        const dateStr = formatDate(data.eventDate);
        ctx.fillText(`organized by ${clubLabel}`, W / 2, 500);
        ctx.fillText(`on ${dateStr}`, W / 2, 525);

        // ---------- Decorative divider ----------
        drawDivider(ctx, W / 2, 555, 200);

        // ---------- Certificate ID ----------
        ctx.font = '12px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(`Certificate ID: ${data.certificateId || 'CERT-XXXX-XXXX'}`, W / 2, 590);

        // ---------- Issued On ----------
        const issuedDate = data.issuedAt ? formatDate(data.issuedAt) : formatDate(new Date());
        ctx.fillText(`Issued on: ${issuedDate}`, W / 2, 610);

        // ---------- Signature area ----------
        drawSignatureArea(ctx, W, H);

        // ---------- Bottom decorative line ----------
        const bottomGrad = ctx.createLinearGradient(0, H - 60, W, H - 60);
        bottomGrad.addColorStop(0, 'rgba(108,92,231,0.5)');
        bottomGrad.addColorStop(0.5, 'rgba(253,121,168,0.5)');
        bottomGrad.addColorStop(1, 'rgba(162,155,254,0.5)');
        ctx.strokeStyle = bottomGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(60, H - 50);
        ctx.lineTo(W - 60, H - 50);
        ctx.stroke();

        // Footer
        ctx.font = '11px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('This certificate is digitally generated by DSCE Clubs Hub • Verify at dsceclubs.com/verify', W / 2, H - 25);
    }

    function drawCornerAccents(ctx, W, H) {
        const cornerSize = 60;
        const pad = 20;
        ctx.strokeStyle = 'rgba(253, 121, 168, 0.4)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Top-left
        ctx.beginPath();
        ctx.moveTo(pad, pad + cornerSize);
        ctx.lineTo(pad, pad);
        ctx.lineTo(pad + cornerSize, pad);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(W - pad - cornerSize, pad);
        ctx.lineTo(W - pad, pad);
        ctx.lineTo(W - pad, pad + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(pad, H - pad - cornerSize);
        ctx.lineTo(pad, H - pad);
        ctx.lineTo(pad + cornerSize, H - pad);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(W - pad - cornerSize, H - pad);
        ctx.lineTo(W - pad, H - pad);
        ctx.lineTo(W - pad, H - pad - cornerSize);
        ctx.stroke();
    }

    function drawDivider(ctx, cx, y, halfWidth) {
        const grad = ctx.createLinearGradient(cx - halfWidth, 0, cx + halfWidth, 0);
        grad.addColorStop(0, 'rgba(253,121,168,0)');
        grad.addColorStop(0.2, 'rgba(253,121,168,0.5)');
        grad.addColorStop(0.5, 'rgba(255,215,100,0.6)');
        grad.addColorStop(0.8, 'rgba(253,121,168,0.5)');
        grad.addColorStop(1, 'rgba(253,121,168,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - halfWidth, y);
        ctx.lineTo(cx + halfWidth, y);
        ctx.stroke();

        // Small diamond in center
        ctx.fillStyle = 'rgba(255, 215, 100, 0.6)';
        ctx.beginPath();
        ctx.moveTo(cx, y - 5);
        ctx.lineTo(cx + 5, y);
        ctx.lineTo(cx, y + 5);
        ctx.lineTo(cx - 5, y);
        ctx.closePath();
        ctx.fill();
    }

    function drawSignatureArea(ctx, W, H) {
        const sigY = 680;

        // Left signature
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(150, sigY);
        ctx.lineTo(380, sigY);
        ctx.stroke();

        ctx.font = '13px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Club Coordinator', 265, sigY + 20);

        // Signature flourish (left)
        ctx.strokeStyle = 'rgba(108,92,231,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(200, sigY - 15);
        ctx.bezierCurveTo(230, sigY - 35, 270, sigY - 10, 310, sigY - 20);
        ctx.stroke();

        // Right signature
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W - 380, sigY);
        ctx.lineTo(W - 150, sigY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Faculty Advisor', W - 265, sigY + 20);

        // Signature flourish (right)
        ctx.strokeStyle = 'rgba(253,121,168,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W - 310, sigY - 15);
        ctx.bezierCurveTo(W - 270, sigY - 30, W - 230, sigY - 5, W - 200, sigY - 18);
        ctx.stroke();

        // Seal in center
        drawSeal(ctx, W / 2, sigY - 10);
    }

    function drawSeal(ctx, cx, cy) {
        const radius = 35;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(cx, cy, radius - 10, cx, cy, radius + 20);
        glowGrad.addColorStop(0, 'rgba(255, 215, 100, 0.15)');
        glowGrad.addColorStop(1, 'rgba(255, 215, 100, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(cx - 60, cy - 60, 120, 120);

        // Outer circle
        ctx.strokeStyle = 'rgba(255, 215, 100, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        // Star points
        ctx.fillStyle = 'rgba(255, 215, 100, 0.5)';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
            const x = cx + Math.cos(angle) * (radius - 4);
            const y = cy + Math.sin(angle) * (radius - 4);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center text
        ctx.font = 'bold 10px Montserrat, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 215, 100, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('DSCE', cx, cy - 2);
        ctx.font = '8px Montserrat, Arial, sans-serif';
        ctx.fillText('VERIFIED', cx, cy + 10);
    }

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                             */
    /* ------------------------------------------------------------------ */

    function getClubLabel(club) {
        const clubMap = {
            tech: 'Tech Society — POINT BLANK',
            arts: 'Creative Arts — AALEKA',
            debate: 'Debate Club — LITSOC',
            music: 'Music Society — MELODY',
            sports: 'Sports Club — VIGOR',
            dance: 'Dance Club — ABCD'
        };
        return clubMap[club] || club || 'DSCE Clubs';
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /* ------------------------------------------------------------------ */
    /*  Download helpers                                                    */
    /* ------------------------------------------------------------------ */

    function downloadAsPNG(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename || 'DSCE_Certificate.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function downloadAsPDF(canvas, filename) {
        // Build a simple PDF from the canvas image
        const imgData = canvas.toDataURL('image/png');
        const W = canvas.width;
        const H = canvas.height;

        // Use a printable iframe approach for universal PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename || 'DSCE Certificate'}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
            img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${imgData}" />
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
            printWindow.document.close();
        }
    }

    /* ------------------------------------------------------------------ */
    /*  API Integration                                                     */
    /* ------------------------------------------------------------------ */

    async function fetchAvailableEvents() {
        try {
            const res = await fetch(`${API_BASE}/events`);
            if (!res.ok) throw new Error('Failed to fetch events');
            return await res.json();
        } catch (err) {
            console.warn('Could not fetch events from API, using fallback:', err.message);
            return null;
        }
    }

    async function generateCertificateAPI(data) {
        try {
            const res = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.warn('Could not save certificate to API:', err.message);
            return null;
        }
    }

    async function fetchStudentCertificates(studentId) {
        try {
            const res = await fetch(`${API_BASE}/student/${studentId}`);
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch (err) {
            console.warn('Could not fetch student certificates:', err.message);
            return [];
        }
    }

    async function verifyCertificate(certId) {
        try {
            const res = await fetch(`${API_BASE}/verify/${certId}`);
            return await res.json();
        } catch (err) {
            console.warn('Could not verify certificate:', err.message);
            return null;
        }
    }

    async function trackDownload(certId) {
        try {
            await fetch(`${API_BASE}/download/${certId}`, { method: 'POST' });
        } catch (_) { /* silent */ }
    }

    /* ------------------------------------------------------------------ */
    /*  UI Initialisation                                                   */
    /* ------------------------------------------------------------------ */

    function init() {
        const certTab = document.getElementById('e-certificate');
        const hubList = document.getElementById('hub-certificates-list');

        if (certTab) {
            // Replace the existing form with enhanced UI on registration page
            certTab.innerHTML = buildCertificateUI();
            // Bind events for generation
            bindEvents();
            // Populate events dropdown
            populateEventsDropdown();
        }

        if (hubList) {
            // Logic for the My Hub page
            initHubCertificates(hubList);
        }
    }

    function initHubCertificates(container) {
        // Hidden canvas for rendering when viewing from history
        if (!document.getElementById('hub-cert-preview-modal')) {
            const wrapper = document.createElement('div');
            wrapper.id = 'hub-cert-preview-modal';
            wrapper.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2000; overflow:auto; padding:50px 20px;';
            wrapper.innerHTML = `
        <div style="max-width:1100px; margin:0 auto; background:#1a1a2e; padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.1);">
          <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <h3 style="color:white; margin:0;"><i class="fas fa-award"></i> Certificate Preview</h3>
            <div style="display:flex; gap:10px;">
              <button id="hub-dl-png" class="cert-action-btn"><i class="fas fa-image"></i> PNG</button>
              <button id="hub-dl-pdf" class="cert-action-btn"><i class="fas fa-file-pdf"></i> PDF</button>
              <button id="hub-close-modal" class="cert-action-btn" style="background:rgba(214,48,49,0.2); color:#ff7675; border-color:rgba(214,48,49,0.4);"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div style="text-align:center;"><canvas id="cert-canvas-hub"></canvas></div>
        </div>
      `;
            document.body.appendChild(wrapper);

            document.getElementById('hub-close-modal').onclick = () => wrapper.style.display = 'none';
            document.getElementById('hub-dl-png').onclick = () => {
                const canv = document.getElementById('cert-canvas-hub');
                if (canv && currentCertData) downloadAsPNG(canv, `DSCE_Certificate_${currentCertData.attendeeName.replace(/ /g, '_')}.png`);
            };
            document.getElementById('hub-dl-pdf').onclick = () => {
                const canv = document.getElementById('cert-canvas-hub');
                if (canv && currentCertData) downloadAsPDF(canv, `DSCE_Certificate_${currentCertData.attendeeName.replace(/ /g, '_')}`);
            };
        }

        // Load certificates for logged in user (usually stored in localStorage)
        const studentId = localStorage.getItem('studentId') || '1DS21CS001'; // Default for demo
        if (studentId) {
            loadHubCertificates(studentId, container);
        } else {
            container.innerHTML = '<p class="no-data">Login to view your certificates</p>';
        }
    }

    async function loadHubCertificates(studentId, container) {
        container.innerHTML = '<div class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        const certs = await fetchStudentCertificates(studentId);

        if (!certs || certs.length === 0) {
            container.innerHTML = '<p class="no-data">No certificates earned yet. Attend events to get certified!</p>';
            return;
        }

        container.innerHTML = certs.map(c => `
      <div class="hub-item cert-hub-item" data-cert='${JSON.stringify(c)}'>
        <div class="hub-item-info">
          <h4>${c.eventName}</h4>
          <p>ID: ${c.certificateId} • Issued: ${formatDate(c.issuedAt)}</p>
        </div>
        <button class="view-club-btn hub-cert-view" style="width: auto; padding: 0.5rem 1rem;">View</button>
      </div>
    `).join('');

        container.querySelectorAll('.hub-cert-view').forEach(btn => {
            btn.onclick = (e) => {
                const card = e.target.closest('.cert-hub-item');
                const certData = JSON.parse(card.dataset.cert);
                currentCertData = certData;

                const modal = document.getElementById('hub-cert-preview-modal');
                const canvas = document.getElementById('cert-canvas-hub');
                modal.style.display = 'block';
                drawCertificate(canvas, certData);
                modal.scrollTo(0, 0);
            };
        });
    }

    function buildCertificateUI() {
        return `
      <h2 class="section-title">Generate <span class="text-gradient">E-Certificate</span></h2>
      <p class="cert-subtitle">Generate and download your participation certificate instantly</p>

      <div class="cert-container">
        <!-- Generation Form -->
        <div class="cert-form-section">
          <form id="cert-generate-form" class="registration-form cert-form">
            <div class="form-row">
              <div class="form-group">
                <label for="cert-first-name"><i class="fas fa-user"></i> First Name</label>
                <input type="text" id="cert-first-name" name="first_name" required placeholder="Enter first name">
              </div>
              <div class="form-group">
                <label for="cert-last-name"><i class="fas fa-user"></i> Last Name</label>
                <input type="text" id="cert-last-name" name="last_name" required placeholder="Enter last name">
              </div>
            </div>

            <div class="form-group">
              <label for="cert-email"><i class="fas fa-envelope"></i> Email (optional)</label>
              <input type="email" id="cert-email" name="email" placeholder="student@example.com">
            </div>

            <div class="form-group">
              <label for="cert-student-id"><i class="fas fa-id-card"></i> Student ID</label>
              <input type="text" id="cert-student-id" name="student_id" required maxlength="12"
                pattern="[A-Za-z0-9]{8,12}"
                title="Student ID should be 8–12 alphanumeric characters"
                placeholder="e.g. 1DS21CS001">
            </div>

            <div class="form-group">
              <label for="cert-event-select"><i class="fas fa-calendar-alt"></i> Select Event</label>
              <select id="cert-event-select" name="event" required>
                <option value="">-- Choose Event --</option>
                <option value="AI Workshop Series">AI Workshop Series</option>
                <option value="Digital Art Masterclass">Digital Art Masterclass</option>
                <option value="Public Speaking Workshop">Public Speaking Workshop</option>
                <option value="Music Jam Session">Music Jam Session</option>
                <option value="Web Development Bootcamp">Web Development Bootcamp</option>
                <option value="Debate Championship">Debate Championship</option>
              </select>
            </div>

            <div class="form-actions cert-actions">
              <button type="button" id="cert-preview-btn" class="submit-button cert-preview-btn">
                <i class="fas fa-eye"></i> Preview Certificate
              </button>
              <button type="submit" class="submit-button cert-generate-btn" disabled>
                <i class="fas fa-certificate"></i> Generate & Save
              </button>
            </div>
          </form>
        </div>

        <!-- Preview Area -->
        <div class="cert-preview-section" id="cert-preview-section" style="display:none;">
          <div class="cert-preview-header">
            <h3><i class="fas fa-award"></i> Certificate Preview</h3>
            <div class="cert-preview-actions">
              <button id="cert-download-png" class="cert-action-btn" title="Download as PNG">
                <i class="fas fa-image"></i> PNG
              </button>
              <button id="cert-download-pdf" class="cert-action-btn" title="Save as PDF">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
            </div>
          </div>
          <div class="cert-canvas-wrapper">
            <canvas id="cert-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Student Certificate History -->
      <div class="cert-history-section" id="cert-history-section" style="display:none;">
        <h3 class="cert-history-title"><i class="fas fa-history"></i> Your Certificates</h3>
        <div class="cert-history-grid" id="cert-history-grid"></div>
      </div>

      <!-- Verification Section -->
      <div class="cert-verify-section">
        <h3><i class="fas fa-shield-alt"></i> Verify a Certificate</h3>
        <div class="cert-verify-form">
          <input type="text" id="cert-verify-id" placeholder="Enter Certificate ID (e.g. CERT-2026-0001)">
          <button id="cert-verify-btn" class="submit-button cert-verify-btn">
            <i class="fas fa-check-circle"></i> Verify
          </button>
        </div>
        <div id="cert-verify-result" class="cert-verify-result" style="display:none;"></div>
      </div>
    `;
    }

    let currentCertData = null;

    function bindEvents() {
        const previewBtn = document.getElementById('cert-preview-btn');
        const generateForm = document.getElementById('cert-generate-form');
        const downloadPNG = document.getElementById('cert-download-png');
        const downloadPDF = document.getElementById('cert-download-pdf');
        const verifyBtn = document.getElementById('cert-verify-btn');
        const generateBtn = generateForm ? generateForm.querySelector('.cert-generate-btn') : null;
        const studentIdInput = document.getElementById('cert-student-id');

        if (previewBtn) {
            previewBtn.addEventListener('click', handlePreview);
        }

        if (generateForm) {
            generateForm.addEventListener('submit', handleGenerate);
        }

        if (downloadPNG) {
            downloadPNG.addEventListener('click', () => {
                const canvas = document.getElementById('cert-canvas');
                if (canvas && currentCertData) {
                    downloadAsPNG(canvas, `DSCE_Certificate_${currentCertData.attendeeName.replace(/\s/g, '_')}.png`);
                    if (currentCertData.certificateId) trackDownload(currentCertData.certificateId);
                }
            });
        }

        if (downloadPDF) {
            downloadPDF.addEventListener('click', () => {
                const canvas = document.getElementById('cert-canvas');
                if (canvas && currentCertData) {
                    downloadAsPDF(canvas, `DSCE_Certificate_${currentCertData.attendeeName.replace(/\s/g, '_')}`);
                    if (currentCertData.certificateId) trackDownload(currentCertData.certificateId);
                }
            });
        }

        if (verifyBtn) {
            verifyBtn.addEventListener('click', handleVerify);
        }

        // Load certificates when student ID is entered
        if (studentIdInput) {
            studentIdInput.addEventListener('change', () => {
                const sid = studentIdInput.value.trim();
                if (sid.length >= 8) loadStudentCertificates(sid);
            });
        }
    }

    function handlePreview() {
        const firstName = document.getElementById('cert-first-name').value.trim();
        const lastName = document.getElementById('cert-last-name').value.trim();
        const eventName = document.getElementById('cert-event-select').value;
        const studentId = document.getElementById('cert-student-id').value.trim();

        if (!firstName || !lastName || !eventName || !studentId) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        const canvas = document.getElementById('cert-canvas');
        currentCertData = {
            attendeeName: `${firstName} ${lastName}`,
            eventName,
            studentId,
            attendeeEmail: document.getElementById('cert-email').value.trim(),
            clubName: getClubFromEvent(eventName),
            eventDate: new Date().toISOString().split('T')[0],
            certificateId: 'CERT-PREVIEW',
            issuedAt: new Date()
        };

        drawCertificate(canvas, currentCertData);

        const previewSection = document.getElementById('cert-preview-section');
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Enable generate button
        const genBtn = document.querySelector('.cert-generate-btn');
        if (genBtn) genBtn.disabled = false;

        showToast('Certificate preview generated!', 'success');
    }

    async function handleGenerate(e) {
        e.preventDefault();

        if (!currentCertData) {
            showToast('Please preview the certificate first', 'warning');
            return;
        }

        const genBtn = document.querySelector('.cert-generate-btn');
        if (genBtn) {
            genBtn.disabled = true;
            genBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        }

        const result = await generateCertificateAPI({
            studentId: currentCertData.studentId,
            eventName: currentCertData.eventName,
            attendeeName: currentCertData.attendeeName,
            attendeeEmail: currentCertData.attendeeEmail
        });

        if (result && result.certificate) {
            currentCertData.certificateId = result.certificate.certificateId;
            currentCertData.eventDate = result.certificate.eventDate;
            currentCertData.issuedAt = result.certificate.issuedAt;
            currentCertData.clubName = result.certificate.clubName;

            // Redraw with real data
            const canvas = document.getElementById('cert-canvas');
            drawCertificate(canvas, currentCertData);

            const msg = result.alreadyExists
                ? 'Certificate already exists! Showing your existing certificate.'
                : 'Certificate generated and saved successfully!';
            showToast(msg, 'success');

            // Refresh history
            loadStudentCertificates(currentCertData.studentId);
        } else {
            // Works offline — certificate is preview-only
            showToast('Certificate preview is ready! (Server unavailable — not saved to database)', 'info');
        }

        if (genBtn) {
            genBtn.disabled = false;
            genBtn.innerHTML = '<i class="fas fa-certificate"></i> Generate & Save';
        }
    }

    async function handleVerify() {
        const certIdInput = document.getElementById('cert-verify-id');
        const resultDiv = document.getElementById('cert-verify-result');
        const certId = certIdInput.value.trim();

        if (!certId) {
            showToast('Please enter a certificate ID', 'warning');
            return;
        }

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div class="cert-verify-loading"><i class="fas fa-spinner fa-spin"></i> Verifying...</div>';

        const result = await verifyCertificate(certId);

        if (!result) {
            resultDiv.innerHTML = `
        <div class="cert-verify-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>Could not verify — server unavailable</span>
        </div>`;
            return;
        }

        if (result.valid) {
            const c = result.certificate;
            resultDiv.innerHTML = `
        <div class="cert-verify-valid">
          <div class="verify-icon"><i class="fas fa-check-circle"></i></div>
          <h4>Certificate Verified ✓</h4>
          <div class="verify-details">
            <p><strong>Certificate ID:</strong> ${c.certificateId}</p>
            <p><strong>Name:</strong> ${c.attendeeName}</p>
            <p><strong>Event:</strong> ${c.eventName}</p>
            <p><strong>Date:</strong> ${formatDate(c.eventDate)}</p>
            <p><strong>Issued:</strong> ${formatDate(c.issuedAt)}</p>
          </div>
        </div>`;
        } else {
            resultDiv.innerHTML = `
        <div class="cert-verify-invalid">
          <div class="verify-icon"><i class="fas fa-times-circle"></i></div>
          <h4>${result.message}</h4>
        </div>`;
        }
    }

    async function loadStudentCertificates(studentId) {
        const historySection = document.getElementById('cert-history-section');
        const historyGrid = document.getElementById('cert-history-grid');
        if (!historySection || !historyGrid) return;

        const certs = await fetchStudentCertificates(studentId);
        if (!certs || certs.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';
        historyGrid.innerHTML = certs.map(c => `
      <div class="cert-history-card" data-cert='${JSON.stringify(c)}'>
        <div class="cert-history-icon"><i class="fas fa-award"></i></div>
        <div class="cert-history-info">
          <h4>${c.eventName}</h4>
          <p class="cert-history-id">${c.certificateId}</p>
          <p class="cert-history-date">Issued: ${formatDate(c.issuedAt)}</p>
        </div>
        <button class="cert-history-view-btn" title="View Certificate">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    `).join('');

        // Bind view buttons
        historyGrid.querySelectorAll('.cert-history-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.cert-history-card');
                const certData = JSON.parse(card.dataset.cert);
                currentCertData = certData;

                const canvas = document.getElementById('cert-canvas');
                drawCertificate(canvas, certData);

                const previewSection = document.getElementById('cert-preview-section');
                previewSection.style.display = 'block';
                previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    async function populateEventsDropdown() {
        const events = await fetchAvailableEvents();
        if (!events || events.length === 0) return;

        const select = document.getElementById('cert-event-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- Choose Event --</option>';
        events.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev.name;
            opt.textContent = `${ev.name} (${getClubLabel(ev.club)})`;
            select.appendChild(opt);
        });
    }

    function getClubFromEvent(eventName) {
        const eventClubMap = {
            'AI Workshop Series': 'tech',
            'Digital Art Masterclass': 'arts',
            'Public Speaking Workshop': 'debate',
            'Music Jam Session': 'music',
            'Web Development Bootcamp': 'tech',
            'Debate Championship': 'debate',
            'Creative Writing Workshop': 'arts',
            'Multi-Day Conference': 'tech',
            'Tech Seminar': 'tech'
        };
        return eventClubMap[eventName] || '';
    }

    /* ------------------------------------------------------------------ */
    /*  Toast notification                                                  */
    /* ------------------------------------------------------------------ */

    function showToast(message, type) {
        const existing = document.querySelector('.cert-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `cert-toast cert-toast-${type || 'info'}`;

        const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('cert-toast-show'));

        setTimeout(() => {
            toast.classList.remove('cert-toast-show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    /* ------------------------------------------------------------------ */
    /*  Public API                                                          */
    /* ------------------------------------------------------------------ */

    return {
        init,
        drawCertificate,
        downloadAsPNG,
        downloadAsPDF,
        verifyCertificate: handleVerify
    };
})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    CertificateGenerator.init();
});
