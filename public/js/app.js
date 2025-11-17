// Theme Management
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    initDashboard();
  } else if (path === '/rules') {
    initRules();
  } else if (path === '/logs') {
    initLogs();
  }
});

// ===== DASHBOARD =====
function initDashboard() {
  updateConnectionStatus();
  updateStats();

  setInterval(updateConnectionStatus, 5000);
  setInterval(updateStats, 5000);

  // QR Code modal
  const modal = document.getElementById('qrModal');
  const modalContent = document.getElementById('qrModalContent');
  const btn = document.getElementById('showQrBtn');
  const closeBtn = document.getElementById('closeQrModal');

  if (btn) {
    btn.onclick = () => {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
      }, 10);
      loadQRCode();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = closeQRModal;
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeQRModal();
    };
  }

  function closeQRModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
  }
}

async function updateConnectionStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();

    if (data.success) {
      const statusIcon = document.getElementById('statusIcon');
      const statusText = document.getElementById('statusText');
      const showQrBtn = document.getElementById('showQrBtn');

      if (data.data.status === 'connected') {
        if (statusIcon) {
          statusIcon.innerHTML = '<i class="fas fa-check text-white text-3xl"></i>';
          statusIcon.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl';
        }
        if (statusText) {
          statusText.innerHTML = '<span class="text-green-600 dark:text-green-400 font-semibold text-lg">Connected & Active</span>';
        }
        if (showQrBtn) showQrBtn.classList.add('hidden');
      } else if (data.data.status === 'connecting') {
        if (statusIcon) {
          statusIcon.innerHTML = '<i class="fas fa-circle-notch animate-spin text-white text-3xl"></i>';
          statusIcon.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl animate-pulse';
        }
        if (statusText) {
          statusText.innerHTML = '<span class="text-yellow-600 dark:text-yellow-400 font-semibold text-lg">Connecting...</span>';
        }
        if (showQrBtn) showQrBtn.classList.remove('hidden');
      } else {
        if (statusIcon) {
          statusIcon.innerHTML = '<i class="fas fa-times text-white text-3xl"></i>';
          statusIcon.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-xl';
        }
        if (statusText) {
          statusText.innerHTML = '<span class="text-red-600 dark:text-red-400 font-semibold text-lg">Disconnected</span>';
        }
        if (showQrBtn) showQrBtn.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error('Error fetching status:', error);
  }
}

async function updateStats() {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();

    if (data.success) {
      document.getElementById('messageCount').textContent = data.data.messageCount;
      document.getElementById('activeRules').textContent = data.data.enabledRules;
      document.getElementById('totalRules').textContent = data.data.totalRules;
      document.getElementById('uptime').textContent = data.data.uptimeFormatted;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

async function loadQRCode() {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = '<div class="animate-spin"><i class="fas fa-circle-notch text-4xl text-whatsapp-500"></i></div>';

  try {
    const response = await fetch('/api/qr');
    const data = await response.json();

    if (data.success && data.data.qr) {
      container.innerHTML = `<img src="${data.data.qr}" alt="QR Code" class="rounded-xl shadow-lg max-w-full">`;
    } else {
      container.innerHTML = '<p class="text-gray-600 dark:text-gray-400">QR Code not available. Please wait...</p>';
    }
  } catch (error) {
    console.error('Error loading QR code:', error);
    container.innerHTML = '<p class="text-red-600 dark:text-red-400">Error loading QR code</p>';
  }
}

// ===== RULES =====
let currentEditingRuleId = null;

function initRules() {
  loadRules();

  const modal = document.getElementById('ruleModal');
  const modalContent = document.getElementById('ruleModalContent');
  const openBtn = document.getElementById('openAddRuleModal');
  const closeBtn = document.getElementById('closeRuleModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('ruleForm');

  openBtn.onclick = () => {
    resetForm();
    openModal();
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  form.addEventListener('submit', handleRuleSubmit);

  function openModal() {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  function closeModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
  }
}

async function loadRules() {
  const container = document.getElementById('rulesContainer');
  container.innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin"><i class="fas fa-circle-notch text-4xl text-whatsapp-500"></i></div></div>';

  try {
    const response = await fetch('/api/rules');
    const data = await response.json();

    if (data.success) {
      if (data.data.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-inbox text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400 text-lg">No rules created yet</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">Click "Add New Rule" to get started</p>
          </div>
        `;
      } else {
        container.innerHTML = data.data.map((rule, index) => createRuleHTML(rule, index)).join('');
      }
    }
  } catch (error) {
    console.error('Error loading rules:', error);
    container.innerHTML = '<p class="text-center text-red-600 dark:text-red-400 py-12">Error loading rules</p>';
  }
}

function createRuleHTML(rule, index) {
  const chatTypeColors = {
    all: 'from-gray-400 to-gray-600',
    individual: 'from-blue-400 to-blue-600',
    group: 'from-purple-400 to-purple-600'
  };
  
  const chatTypeIcons = {
    all: 'fa-globe',
    individual: 'fa-user',
    group: 'fa-users'
  };

  return `
    <div class="glass rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-fadeIn" style="animation-delay: ${index * 0.05}s">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <span class="px-4 py-2 rounded-xl text-sm font-bold ${rule.enabled ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} shadow-lg">
              <i class="fas ${rule.enabled ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
              ${rule.enabled ? 'Active' : 'Disabled'}
            </span>
            <span class="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${chatTypeColors[rule.chatType]} text-white shadow-lg">
              <i class="fas ${chatTypeIcons[rule.chatType]} mr-1"></i>
              ${rule.chatType.charAt(0).toUpperCase() + rule.chatType.slice(1)}
            </span>
            ${rule.delay > 0 ? `<span class="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"><i class="fas fa-clock mr-1"></i>${rule.delay}s delay</span>` : ''}
            ${rule.caseSensitive ? '<span class="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-lg"><i class="fas fa-font mr-1"></i>Case Sensitive</span>' : ''}
          </div>
          <div class="mb-4">
            <div class="flex items-start space-x-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-whatsapp-500 to-whatsapp-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <i class="fas fa-search text-white"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">TRIGGER PATTERN</p>
                <p class="text-xl font-bold text-gray-800 dark:text-white">"${rule.pattern}"</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <i class="fas fa-reply text-white"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">AUTO RESPONSE</p>
                <p class="text-lg text-gray-700 dark:text-gray-300">${rule.response}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex lg:flex-col gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleRule('${rule.id}')" class="sr-only peer">
            <div class="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-whatsapp-300 dark:peer-focus:ring-whatsapp-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-whatsapp-500 peer-checked:to-whatsapp-600 shadow-lg"></div>
          </label>
          <button onclick="editRule('${rule.id}')" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            <i class="fas fa-edit text-lg"></i>
          </button>
          <button onclick="deleteRule('${rule.id}')" class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            <i class="fas fa-trash text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

async function handleRuleSubmit(e) {
  e.preventDefault();

  const ruleId = document.getElementById('ruleId').value;
  const ruleData = {
    pattern: document.getElementById('pattern').value,
    response: document.getElementById('response').value,
    chatType: document.getElementById('chatType').value,
    delay: parseInt(document.getElementById('delay').value),
    caseSensitive: document.getElementById('caseSensitive').checked,
    enabled: document.getElementById('enabled').checked
  };

  try {
    let response;
    if (ruleId) {
      response = await fetch(`/api/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
    } else {
      response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
    }

    const data = await response.json();

    if (data.success) {
      document.getElementById('ruleModal').classList.add('hidden');
      loadRules();
      showNotification(ruleId ? 'Rule updated successfully!' : 'Rule created successfully!', 'success');
    } else {
      showNotification('Error: ' + data.error.message, 'error');
    }
  } catch (error) {
    console.error('Error saving rule:', error);
    showNotification('Error saving rule', 'error');
  }
}

async function editRule(id) {
  try {
    const response = await fetch('/api/rules');
    const data = await response.json();

    if (data.success) {
      const rule = data.data.find(r => r.id === id);
      if (rule) {
        document.getElementById('ruleId').value = rule.id;
        document.getElementById('pattern').value = rule.pattern;
        document.getElementById('response').value = rule.response;
        document.getElementById('chatType').value = rule.chatType;
        document.getElementById('delay').value = rule.delay;
        document.getElementById('caseSensitive').checked = rule.caseSensitive;
        document.getElementById('enabled').checked = rule.enabled;

        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit text-blue-500 mr-2"></i>Edit Rule';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Update Rule';

        const modal = document.getElementById('ruleModal');
        const modalContent = document.getElementById('ruleModalContent');
        modal.classList.remove('hidden');
        setTimeout(() => {
          modalContent.classList.remove('scale-95', 'opacity-0');
          modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
      }
    }
  } catch (error) {
    console.error('Error loading rule:', error);
  }
}

async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;

  try {
    const response = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      loadRules();
      showNotification('Rule deleted successfully!', 'success');
    } else {
      showNotification('Error: ' + data.error.message, 'error');
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    showNotification('Error deleting rule', 'error');
  }
}

async function toggleRule(id) {
  try {
    const response = await fetch(`/api/rules/${id}/toggle`, { method: 'PATCH' });
    const data = await response.json();

    if (data.success) {
      loadRules();
    } else {
      showNotification('Error: ' + data.error.message, 'error');
    }
  } catch (error) {
    console.error('Error toggling rule:', error);
    showNotification('Error toggling rule', 'error');
  }
}

function resetForm() {
  document.getElementById('ruleForm').reset();
  document.getElementById('ruleId').value = '';
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle text-whatsapp-500 mr-2"></i>Add New Rule';
  document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Save Rule';
  document.getElementById('enabled').checked = true;
}

// ===== LOGS =====
function initLogs() {
  loadLogs();
  setInterval(loadLogs, 5000);
}

async function loadLogs() {
  const container = document.getElementById('logsContainer');
  
  if (container.innerHTML.includes('circle-notch')) {
    // First load
  } else {
    // Keep existing content during refresh
  }

  try {
    const response = await fetch('/api/logs');
    const data = await response.json();

    if (data.success) {
      if (data.data.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-inbox text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400 text-lg">No messages logged yet</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">Messages will appear here once your bot starts receiving them</p>
          </div>
        `;
      } else {
        container.innerHTML = data.data.map((log, index) => createLogHTML(log, index)).join('');
      }
    }
  } catch (error) {
    console.error('Error loading logs:', error);
  }
}

function createLogHTML(log, index) {
  const time = new Date(log.timestamp).toLocaleString();
  const hasResponse = log.response !== null;

  return `
    <div class="p-8 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 animate-fadeIn" style="animation-delay: ${index * 0.03}s">
      <div class="flex items-start space-x-4 mb-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${log.chatType === 'group' ? 'from-purple-500 to-purple-700' : 'from-blue-500 to-blue-700'} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
          <i class="fas ${log.chatType === 'group' ? 'fa-users' : 'fa-user'} text-xl"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xl font-bold text-gray-800 dark:text-white">${log.senderName}</h4>
            <span class="px-4 py-1 rounded-xl text-xs font-bold ${log.chatType === 'group' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'} text-white shadow-lg">
              <i class="fas ${log.chatType === 'group' ? 'fa-users' : 'fa-user'} mr-1"></i>${log.chatType}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <i class="fas fa-clock mr-1"></i>${time}
          </p>
          
          <div class="space-y-3">
            <div class="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-2xl p-4 shadow-md">
              <p class="text-gray-800 dark:text-white font-medium">${log.message}</p>
            </div>
            
            ${hasResponse ? `
              <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-whatsapp-500 to-whatsapp-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <i class="fas fa-reply text-white"></i>
                </div>
                <div class="flex-1 bg-gradient-to-r from-whatsapp-50 to-green-50 dark:from-whatsapp-900 dark:to-green-900 border-l-4 border-whatsapp-500 rounded-2xl p-4 shadow-md">
                  <p class="text-gray-800 dark:text-white font-medium mb-2">${log.response}</p>
                  ${log.matchedRulePattern ? `<p class="text-xs text-gray-600 dark:text-gray-400 font-semibold"><i class="fas fa-tag mr-1"></i>Matched pattern: "${log.matchedRulePattern}"</p>` : ''}
                </div>
              </div>
            ` : `
              <div class="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                <i class="fas fa-times-circle text-xl"></i>
                <p class="italic font-medium">No matching rule found</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Notification System
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`;
  notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
