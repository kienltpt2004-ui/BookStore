// toast.js - lightweight toast notification system
// Provides showToast(message, type) and overrides window.alert
const toast = {
  show(message, type = 'info') {
    const toastContainerId = 'toast-container';
    let container = document.getElementById(toastContainerId);
    if (!container) {
      container = document.createElement('div');
      container.id = toastContainerId;
      // Position at top-right for better visibility
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }
    const toastEl = document.createElement('div');
    toastEl.textContent = message;
    toastEl.style.minWidth = '200px';
    toastEl.style.padding = '12px 16px';
    toastEl.style.borderRadius = '8px';
    toastEl.style.color = '#fff';
    toastEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toastEl.style.fontFamily = 'Inter, sans-serif';
    toastEl.style.fontSize = '14px';
    toastEl.style.opacity = '0';
    toastEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    // Background based on type
    if (type === 'success') toastEl.style.background = '#2ed573';
    else if (type === 'error') toastEl.style.background = '#ff4757';
    else if (type === 'warning') toastEl.style.background = '#ffa502';
    else toastEl.style.background = '#3742fa'; // info/default
    container.appendChild(toastEl);
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-10px)';
      toastEl.addEventListener('transitionend', () => toastEl.remove());
    }, 3000);
  }
};
// Expose globally
window.showToast = function(message, type) { toast.show(message, type); };
// Override native alert to use toast notifications (info style)
window.alert = function(msg) { toast.show(msg, 'info'); };
