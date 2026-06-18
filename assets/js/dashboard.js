/* Dashboard Controller & LocalStorage State Manager */

// Default mock data to populate if localStorage is empty
const defaultDashboardData = {
  profile: {
    fullName: "Alex Jumpmaster",
    email: "alex@gravityforce.com",
    phone: "(555) 123-4567",
    emergencyContactName: "Sarah Jumpmaster",
    emergencyContactPhone: "(555) 987-6543"
  },
  loyaltyPoints: 350,
  waiver: {
    signed: false,
    signedDate: null,
    signatureData: null
  },
  membership: {
    active: true,
    tier: "Quarterly VIP Pass",
    renewalDate: "2026-09-16",
    price: "$149 / Quarter"
  },
  bookings: [
    {
      id: "BK-8902",
      type: "Weekend Family Pass",
      date: "2026-06-20",
      time: "14:00",
      guests: 4,
      status: "Confirmed",
      qrCode: "MOCK_QR_BK_8902"
    }
  ],
  passes: [
    {
      id: "PS-4491",
      type: "2-Hour Single Session",
      status: "Active",
      datePurchased: "2026-06-15",
      qrCode: "MOCK_QR_PS_4491"
    }
  ],
  purchases: [
    {
      id: "TX-90211",
      description: "Quarterly VIP Pass Membership",
      amount: "$149.00",
      date: "2026-06-16"
    },
    {
      id: "TX-88201",
      description: "2-Hour Single Session Pass",
      amount: "$28.00",
      date: "2026-06-15"
    }
  ]
};

// Global state variable
let dbData = {};

document.addEventListener('DOMContentLoaded', () => {
  initDashboardState();
  initDashboardTabs();
  renderDashboardHome();
  initSignaturePad();
  initDashboardActions();
});

/* Initialize state from localStorage */
function initDashboardState() {
  if (!localStorage.getItem('gravity_db')) {
    localStorage.setItem('gravity_db', JSON.stringify(defaultDashboardData));
  }
  dbData = JSON.parse(localStorage.getItem('gravity_db'));
}

/* Save current state to localStorage */
function saveDashboardState() {
  localStorage.setItem('gravity_db', JSON.stringify(dbData));
}

/* Dashboard Tab Navigation */
function initDashboardTabs() {
  const menuLinks = document.querySelectorAll('.dashboard-menu-link');
  const sections = document.querySelectorAll('.dashboard-section');

  if (menuLinks.length === 0) return;

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetSectionId = link.getAttribute('data-section');
      if (!targetSectionId) return;
      e.preventDefault();
      
      // Update links
      menuLinks.forEach(el => el.classList.remove('active'));
      link.classList.add('active');

      // Update sections visibility
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetSectionId) {
          sec.classList.add('active');
        }
      });

      // Trigger section-specific renders
      if (targetSectionId === 'dash-home') {
        renderDashboardHome();
      
      } else if (targetSectionId === 'dash-waivers') {
        renderWaiver();
      } else if (targetSectionId === 'dash-parties') {
        renderParties();
      
      } else if (targetSectionId === 'dash-settings') {
        renderSettings();
      }
    });
  });
}

/* Render Dashboard Home View */
function renderDashboardHome() {
  const upcomingDiv = document.getElementById('home-upcoming-bookings');
  const waiverBadge = document.getElementById('home-waiver-status');
  const loyaltySpan = document.getElementById('home-loyalty-points');
  const membershipDiv = document.getElementById('home-membership-details');
  const purchasesBody = document.getElementById('home-recent-purchases');
  
  if (!upcomingDiv) return;

  // Set Profile names
  const welcomeName = document.getElementById('welcome-user-name');
  if (welcomeName) {
    welcomeName.textContent = dbData.profile.fullName;
  }
  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) {
    sidebarName.textContent = dbData.profile.fullName;
  }

  // Loyalty Points
  if (loyaltySpan) {
    loyaltySpan.textContent = dbData.loyaltyPoints + ' pts';
  }

  // Waiver status badge
  if (waiverBadge) {
    if (dbData.waiver.signed) {
      waiverBadge.className = 'card-badge';
      waiverBadge.style.backgroundColor = 'var(--success)';
      waiverBadge.style.color = '#fff';
      waiverBadge.textContent = 'Active / Signed';
    } else {
      waiverBadge.className = 'card-badge';
      waiverBadge.style.backgroundColor = 'var(--danger)';
      waiverBadge.style.color = '#fff';
      waiverBadge.textContent = 'Unsigned / Required';
    }
  }

  // Upcoming bookings
  upcomingDiv.innerHTML = '';
  const activeBookings = dbData.bookings.filter(b => b.status === 'Confirmed');
  if (activeBookings.length === 0) {
    upcomingDiv.innerHTML = `<p style="padding: 1rem; color: var(--text-muted);">No upcoming bookings. Jump into action and book now!</p>`;
  } else {
    activeBookings.forEach(booking => {
      upcomingDiv.innerHTML += `
        <div style="background-color: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--card-border); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-weight: 600;">${booking.type}</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Date: <strong>${booking.date}</strong> | Time: <strong>${booking.time}</strong></p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Guests: ${booking.guests} | Booking ID: ${booking.id}</p>
          </div>
          <div>
            <button class="btn btn-secondary btn-qr-trigger" data-qr="${booking.qrCode}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View Pass QR</button>
          </div>
        </div>
      `;
    });
  }

  // Membership details
  if (membershipDiv) {
    if (dbData.membership.active) {
      membershipDiv.innerHTML = `
        <h4 style="font-weight: 600; color: var(--secondary);">${dbData.membership.tier}</h4>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Renewal Date: <strong>${dbData.membership.renewalDate}</strong></p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${dbData.membership.price}</p>
      `;
    } else {
      membershipDiv.innerHTML = `
        <h4 style="font-weight: 600; color: var(--danger);">No Active Membership</h4>
        <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-secondary);">Unlock unlimited access, guest passes, and party discounts today!</p>
        <button class="btn btn-primary" onclick="document.querySelector('[data-section=\\'dash-memberships\\']').click()" style="margin-top: 1rem; padding: 0.5rem 1.25rem; font-size: 0.85rem;">Become a Member</button>
      `;
    }
  }

  // Recent purchases
  if (purchasesBody) {
    purchasesBody.innerHTML = '';
    if (dbData.purchases.length === 0) {
      purchasesBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No transaction history.</td></tr>`;
    } else {
      dbData.purchases.forEach(tx => {
        purchasesBody.innerHTML += `
          <tr>
            <td><strong>${tx.id}</strong></td>
            <td>${tx.description}</td>
            <td>${tx.date}</td>
            <td><strong style="color: var(--secondary);">${tx.amount}</strong></td>
          </tr>
        `;
      });
    }
  }

  bindQREvents();
}

/* Render Jump Passes */
function renderPasses() {
  const activePassContainer = document.getElementById('active-passes-list');
  const historyPassBody = document.getElementById('pass-history-body');

  if (!activePassContainer) return;

  // Active Passes
  activePassContainer.innerHTML = '';
  const activePasses = dbData.passes.filter(p => p.status === 'Active');
  if (activePasses.length === 0) {
    activePassContainer.innerHTML = `<p style="color: var(--text-muted);">No active passes. Purchase your pass below!</p>`;
  } else {
    activePasses.forEach(pass => {
      activePassContainer.innerHTML += `
        <div style="background-color: var(--bg-secondary); border: 1px solid var(--card-border); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--glass-shadow); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--secondary); font-weight: 700;">Active Pass</div>
            <h4 style="margin: 0.25rem 0 0.5rem 0; font-weight: 600;">${pass.type}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Purchased: ${pass.datePurchased}</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Pass ID: ${pass.id}</p>
          </div>
          <button class="btn btn-primary btn-qr-trigger" data-qr="${pass.qrCode}">
            <svg style="width: 18px; height: 18px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 4h4v4H4V4zm0 12h4v4H4v-4zm12 0h4v4h-4v-4zM4 12h4v4H4v-4zm12-8h4v4h-4V4z"/>
            </svg>
            Show Pass QR
          </button>
        </div>
      `;
    });
  }

  // Pass history table
  if (historyPassBody) {
    historyPassBody.innerHTML = '';
    const allPasses = dbData.passes;
    allPasses.forEach(p => {
      historyPassBody.innerHTML += `
        <tr>
          <td><strong>${p.id}</strong></td>
          <td>${p.type}</td>
          <td>${p.datePurchased}</td>
          <td><span style="color: ${p.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'}; font-weight:600;">${p.status}</span></td>
          <td>
            <button class="btn btn-secondary" onclick="alert('Receipt TX-${p.id.split('-')[1]} downloaded successfully!')" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">Download Receipt</button>
          </td>
        </tr>
      `;
    });
  }

  bindQREvents();
}

/* Render Waiver View */
function renderWaiver() {
  const waiverStatusText = document.getElementById('waiver-status-text');
  const signWaiverForm = document.getElementById('sign-waiver-form');
  const signedWaiverPanel = document.getElementById('signed-waiver-panel');
  const signedDetailsText = document.getElementById('signed-details-text');
  const downloadSignatureImg = document.getElementById('download-signature-img');

  if (!waiverStatusText) return;

  if (dbData.waiver.signed) {
    waiverStatusText.innerHTML = `
      <div style="background-color: rgba(74, 222, 128, 0.1); border: 1px solid var(--success); padding: 1rem 1.5rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 1rem; color: var(--success); margin-bottom: 2rem;">
        <svg style="width: 24px; height: 24px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong>Waiver Status: SIGNED & ACTIVE</strong><br>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Your liability waiver is on file and active for all jumps.</span>
        </div>
      </div>
    `;
    signWaiverForm.style.display = 'none';
    signedWaiverPanel.style.display = 'block';
    if (signedDetailsText) {
      signedDetailsText.innerHTML = `
        <p>Participant: <strong>${dbData.profile.fullName}</strong></p>
        <p>Emergency Contact: <strong>${dbData.profile.emergencyContactName} (${dbData.profile.emergencyContactPhone})</strong></p>
        <p>Date Signed: <strong>${dbData.waiver.signedDate}</strong></p>
        <p>Status: <strong style="color: var(--success)">Approved & Valid</strong></p>
      `;
    }
    if (downloadSignatureImg && dbData.waiver.signatureData) {
      downloadSignatureImg.src = dbData.waiver.signatureData;
      downloadSignatureImg.style.display = 'block';
    }
  } else {
    waiverStatusText.innerHTML = `
      <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); padding: 1rem 1.5rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 1rem; color: var(--danger); margin-bottom: 2rem;">
        <svg style="width: 24px; height: 24px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <strong>Waiver Status: UNSIGNED</strong><br>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">You must sign a digital waiver online before checking in at the park.</span>
        </div>
      </div>
    `;
    signWaiverForm.style.display = 'block';
    signedWaiverPanel.style.display = 'none';
  }
}

/* Render Birthday Parties */
function renderParties() {
  const partyHistoryDiv = document.getElementById('party-history-list');
  if (!partyHistoryDiv) return;

  partyHistoryDiv.innerHTML = '';
  const partyBookings = dbData.bookings.filter(b => b.type.toLowerCase().includes('party') || b.type.toLowerCase().includes('package'));
  if (partyBookings.length === 0) {
    partyHistoryDiv.innerHTML = `<p style="color: var(--text-muted); padding: 1rem 0;">No party bookings found. Book your birthday package below!</p>`;
  } else {
    partyBookings.forEach(booking => {
      partyHistoryDiv.innerHTML += `
        <div style="background-color: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--card-border); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--secondary); font-weight:700;">Party Booking</div>
            <h4 style="margin-top: 0.25rem; font-weight:600;">${booking.type}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Date: <strong>${booking.date}</strong> | Time: <strong>${booking.time}</strong></p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Guests: ${booking.guests} | Booking ID: ${booking.id}</p>
          </div>
          <div>
            <span style="display:inline-block; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight:600; background-color: rgba(74, 222, 128, 0.1); color: var(--success); border: 1px solid var(--success);">${booking.status}</span>
            <button class="btn btn-secondary" onclick="alert('Contacting booking host helper at support@gravityforce.com to manage booking ${booking.id}.')" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-left: 0.5rem;">Manage</button>
          </div>
        </div>
      `;
    });
  }
}

/* Render Memberships */
function renderMemberships() {
  const tierText = document.getElementById('member-tier-name');
  const detailsText = document.getElementById('member-details-text');
  const actionDiv = document.getElementById('membership-actions');

  if (!tierText) return;

  if (dbData.membership.active) {
    tierText.innerHTML = `<span style="color: var(--secondary);">${dbData.membership.tier}</span>`;
    detailsText.innerHTML = `
      <p style="margin-bottom: 0.5rem;">Status: <strong style="color: var(--success)">Active</strong></p>
      <p style="margin-bottom: 0.5rem;">Renewal Date: <strong>${dbData.membership.renewalDate}</strong></p>
      <p style="margin-bottom: 0.5rem;">Price Rate: <strong>${dbData.membership.price}</strong></p>
      <p>Exclusive Rewards Level: <strong>Gold Jumper Level (VIP Priority Access)</strong></p>
    `;
    actionDiv.innerHTML = `
      <button class="btn btn-secondary" onclick="alert('Subscription cancel auto-renewal requested.')">Cancel Auto-Renewal</button>
      <button class="btn btn-primary" onclick="alert('Billing details opened.')" style="margin-left: 1rem;">Update Payment Method</button>
    `;
  } else {
    tierText.textContent = "No Membership Tier Selected";
    detailsText.innerHTML = `<p>Sign up below to unlock massive rewards, unlimited free entries, sibling discounts, private lounge entries, and double loyalty points.</p>`;
    actionDiv.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Review options below to sign up.</p>`;
  }
}

/* Render Settings */
function renderSettings() {
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const emergencyNameInput = document.getElementById('profile-emergency-name');
  const emergencyPhoneInput = document.getElementById('profile-emergency-phone');

  if (!nameInput) return;

  nameInput.value = dbData.profile.fullName;
  emailInput.value = dbData.profile.email;
  phoneInput.value = dbData.profile.phone;
  emergencyNameInput.value = dbData.profile.emergencyContactName;
  emergencyPhoneInput.value = dbData.profile.emergencyContactPhone;
}

/* Canvas drawing signature initialization */
function initSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const clearBtn = document.getElementById('clear-sig');
  let drawing = false;

  // Scale canvas rendering for high DPI displays
  const scaleCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };
  
  scaleCanvas();
  window.addEventListener('resize', scaleCanvas);

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDraw = (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    drawing = false;
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', draw);
  window.addEventListener('touchend', stopDraw);

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Expose signature exporter to save submission
  window.getSignatureDataURL = () => {
    // Check if canvas is empty
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      return null;
    }
    return canvas.toDataURL();
  };
}

/* Bind dashboard actions forms */
function initDashboardActions() {
  // Jump pass purchases
  const buyPassForm = document.getElementById('buy-pass-form');
  if (buyPassForm) {
    buyPassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const passType = document.getElementById('pass-type-select').value;
      const quantity = parseInt(document.getElementById('pass-qty-select').value, 10);
      const priceMap = {
        "1-Hour Single Session ($18)": 18,
        "2-Hour Single Session ($28)": 28,
        "Family Weekend Fun Pass ($85)": 85,
        "Unlimited Monthly Access Pass ($99)": 99
      };

      const basePrice = priceMap[passType] || 20;
      const totalAmount = basePrice * quantity;

      // Add to passes
      const newIdNum = Math.floor(1000 + Math.random() * 9000);
      const newPass = {
        id: `PS-${newIdNum}`,
        type: passType.split(' (')[0],
        status: "Active",
        datePurchased: new Date().toISOString().split('T')[0],
        qrCode: `MOCK_QR_PS_${newIdNum}`
      };

      dbData.passes.unshift(newPass);

      // Add to transaction history
      dbData.purchases.unshift({
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        description: `Purchased ${quantity}x ${newPass.type}`,
        amount: `$${totalAmount.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0]
      });

      // Credit loyalty points
      dbData.loyaltyPoints += (basePrice * quantity * 2);

      saveDashboardState();
      alert(`Success! Purchased ${quantity} pass(es) for $${totalAmount.toFixed(2)}. ${basePrice * quantity * 2} Loyalty points added!`);
      buyPassForm.reset();
      renderPasses();
    });
  }

  // Waiver signing submit
  const waiverFormEl = document.getElementById('sign-waiver-form');
  if (waiverFormEl) {
    waiverFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const sigData = window.getSignatureDataURL();
      const acceptTerms = document.getElementById('accept-liability-terms').checked;

      if (!acceptTerms) {
        alert('Please review and check the liability acceptance terms.');
        return;
      }

      if (!sigData) {
        alert('Please provide a signature on the signature pad canvas.');
        return;
      }

      dbData.waiver.signed = true;
      dbData.waiver.signedDate = new Date().toISOString().split('T')[0];
      dbData.waiver.signatureData = sigData;
      
      saveDashboardState();
      alert('Digital Liability Waiver signed and saved to database successfully!');
      renderWaiver();
      renderDashboardHome();
    });
  }

  // Revoke waiver reset for testing
  const resetWaiverBtn = document.getElementById('reset-waiver-btn');
  if (resetWaiverBtn) {
    resetWaiverBtn.addEventListener('click', () => {
      if (confirm('Revoke waiver to test signing workflow?')) {
        dbData.waiver.signed = false;
        dbData.waiver.signedDate = null;
        dbData.waiver.signatureData = null;
        saveDashboardState();
        renderWaiver();
        renderDashboardHome();
      }
    });
  }

  // Party Package Booking
  const partyForm = document.getElementById('book-party-form');
  if (partyForm) {
    partyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const pack = document.getElementById('party-pack-select').value;
      const date = document.getElementById('party-date').value;
      const time = document.getElementById('party-time').value;
      const guests = document.getElementById('party-guests').value;

      if (!date || !time) {
        alert('Please select date and time.');
        return;
      }

      const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      dbData.bookings.unshift({
        id: bookingId,
        type: pack,
        date: date,
        time: time,
        guests: parseInt(guests, 10),
        status: "Confirmed",
        qrCode: `MOCK_QR_${bookingId}`
      });

      // Transaction
      dbData.purchases.unshift({
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        description: `Booking deposit for ${pack}`,
        amount: "$150.00",
        date: new Date().toISOString().split('T')[0]
      });

      saveDashboardState();
      alert(`Successfully booked ${pack}! Deposit payment logged.`);
      partyForm.reset();
      renderParties();
      renderDashboardHome();
    });
  }

  // Membership upgrades
  const upgradeBtns = document.querySelectorAll('.btn-membership-upgrade');
  upgradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tierName = btn.getAttribute('data-tier');
      const price = btn.getAttribute('data-price');
      
      dbData.membership.active = true;
      dbData.membership.tier = tierName;
      dbData.membership.price = price;
      
      // Calculate renewal date (add 1 month or 1 year)
      const nextDate = new Date();
      if (tierName.toLowerCase().includes('annual')) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      dbData.membership.renewalDate = nextDate.toISOString().split('T')[0];

      dbData.purchases.unshift({
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        description: `Membership Sub: ${tierName}`,
        amount: price.split(' / ')[0],
        date: new Date().toISOString().split('T')[0]
      });

      saveDashboardState();
      alert(`Congratulations! You have upgraded to the ${tierName}. Double loyalty points unlocked.`);
      renderMemberships();
      renderDashboardHome();
    });
  });

  // Settings Save Profile
  const profileForm = document.getElementById('profile-settings-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      dbData.profile.fullName = document.getElementById('profile-name').value;
      dbData.profile.email = document.getElementById('profile-email').value;
      dbData.profile.phone = document.getElementById('profile-phone').value;
      dbData.profile.emergencyContactName = document.getElementById('profile-emergency-name').value;
      dbData.profile.emergencyContactPhone = document.getElementById('profile-emergency-phone').value;

      saveDashboardState();
      alert('Profile details saved successfully!');
      renderDashboardHome();
    });
  }
}

/* Modal QR codes display triggers */
function bindQREvents() {
  const qrTriggers = document.querySelectorAll('.btn-qr-trigger');
  
  // Create Modal overlay once if missing
  let qrModal = document.getElementById('qr-modal-wrapper');
  if (!qrModal) {
    qrModal = document.createElement('div');
    qrModal.id = 'qr-modal-wrapper';
    qrModal.style.position = 'fixed';
    qrModal.style.top = '0';
    qrModal.style.left = '0';
    qrModal.style.width = '100vw';
    qrModal.style.height = '100vh';
    qrModal.style.backgroundColor = 'rgba(0,0,0,0.85)';
    qrModal.style.backdropFilter = 'blur(6px)';
    qrModal.style.zIndex = '3000';
    qrModal.style.display = 'none';
    qrModal.style.alignItems = 'center';
    qrModal.style.justifyContent = 'center';
    qrModal.innerHTML = `
      <div style="background-color: var(--bg-secondary); padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--glass-border); width: 340px; text-align: center; position: relative;">
        <button id="qr-modal-close" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;">&times;</button>
        <h3 style="font-weight:600; margin-bottom:1rem;">Your Check-in Pass</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">Present this QR code to front desk upon arrival for fast check-in.</p>
        <div style="background-color: #fff; padding: 1.5rem; border-radius: var(--radius-md); display: inline-block; margin-bottom: 1.5rem; border: 3px solid var(--secondary);">
          <div id="qr-mock-code" style="width: 160px; height: 160px; display: flex; flex-wrap: wrap; background-color:#fff;"></div>
        </div>
        <div id="qr-modal-id" style="font-family: monospace; font-size: 0.9rem; font-weight: 700; color: var(--secondary);">ID: PS-0000</div>
      </div>
    `;
    document.body.appendChild(qrModal);

    // Modal closing events
    const closeBtn = document.getElementById('qr-modal-close');
    closeBtn.addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        qrModal.style.display = 'none';
      }
    });
  }

  const codeContainer = document.getElementById('qr-mock-code');
  const qrIdDisplay = document.getElementById('qr-modal-id');

  qrTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetQR = btn.getAttribute('data-qr');
      qrIdDisplay.textContent = targetQR;
      
      // Draw a neat pixelated mock QR code dynamically!
      codeContainer.innerHTML = '';
      for (let i = 0; i < 64; i++) {
        const pixel = document.createElement('div');
        pixel.style.width = '20px';
        pixel.style.height = '20px';
        // Random check-in patterns, keeping corner anchors solid black
        const isAnchor = (i < 3 || (i % 8 < 3 && i < 24)) || 
                         (i % 8 >= 5 && i < 24) ||
                         (i >= 40 && i % 8 < 3);
        const randomFill = Math.random() > 0.45;
        pixel.style.backgroundColor = (isAnchor || randomFill) ? '#111' : '#fff';
        codeContainer.appendChild(pixel);
      }

      qrModal.style.display = 'flex';
    });
  });
}
