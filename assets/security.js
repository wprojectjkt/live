// Disable klik kanan
window.addEventListener("contextmenu", e => e.preventDefault());

// Disable shortcut untuk inspect element
document.onkeydown = function(e) {
  if (e.keyCode == 123) return false; // F12
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) return false; // Ctrl+Shift+I/J/C
  if (e.ctrlKey && e.keyCode == 85) return false; // Ctrl+U
  if (e.ctrlKey && e.keyCode == 83) return false; // Ctrl+S
};

// Anti inspect script
(function() {
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      window.location.href = "about:blank";
    }
  });
  console.log(element);
})();
