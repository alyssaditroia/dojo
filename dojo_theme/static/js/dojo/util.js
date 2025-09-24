function copyToClipboard(event) {
  const input = document.getElementById('user-token-result');
  input.select();
  input.setSelectionRange(0, 99999);
  document.execCommand("copy");

  $(event.target).tooltip({
    title: "Copied!",
    trigger: "manual"
  });
  $(event.target).tooltip("show");

  setTimeout(function() {
    $(event.target).tooltip("hide");
  }, 1500);
}

document.addEventListener("DOMContentLoaded", function () {
    if (new Date() >= new Date("2025-03-01")) return;

    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme");

    if (theme) {
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
    } else {
        const storedTheme = localStorage.getItem('theme');
        document.body.classList.add(`theme-${storedTheme}`);
    }

    // Add width toggle button
    const widthToggle = document.createElement('button');
    widthToggle.className = 'width-toggle';
    widthToggle.innerHTML = localStorage.getItem('containerFull') === 'true' ? '[ ]' : '[=]';
    widthToggle.title = 'Toggle container width';
    document.body.appendChild(widthToggle);

    // Apply saved width preference
    if (localStorage.getItem('containerFull') === 'true') {
        document.querySelectorAll('.container').forEach(container => {
            container.classList.add('container-full');
        });
    }

    // Toggle width on click
    widthToggle.addEventListener('click', function() {
        const containers = document.querySelectorAll('.container');
        const isFull = containers[0]?.classList.contains('container-full');

        containers.forEach(container => {
            if (isFull) {
                container.classList.remove('container-full');
            } else {
                container.classList.add('container-full');
            }
        });

        localStorage.setItem('containerFull', !isFull);
        widthToggle.innerHTML = isFull ? '[=]' : '[ ]';
    });
});