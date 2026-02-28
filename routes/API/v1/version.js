function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('https://raw.githubusercontent.com/kswarrior/ks-panel/main/package.json')
    .then(response => response.json())
    .then(data => {
      const latestVersion = data.version;
      const icon = document.getElementById('update-icon');
      const paths = icon.querySelectorAll('path');

      if (compareVersions(latestVersion, CURRENT_VERSION) > 0) {
        // Old version: red color, click opens GitHub
        paths.forEach(path => path.setAttribute('stroke', '#F44336'));
        icon.onclick = () => window.open('https://github.com/kswarrior/ks-panel', '_blank');
      } else {
        // Latest version: green color, click shows message
        paths.forEach(path => path.setAttribute('stroke', '#4CAF50'));
        icon.onclick = () => alert('Latest version running');
      }
    })
    .catch(error => {
      console.error('Error fetching latest version:', error);
      // Fallback: gray color, no action
      const paths = document.querySelectorAll('#update-icon path');
      paths.forEach(path => path.setAttribute('stroke', '#808080'));
    });
});
