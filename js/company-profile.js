(function () {
  "use strict";

  var viewer = document.querySelector("[data-profile-viewer]");
  var frame = document.querySelector("[data-profile-frame]");
  var iframe = document.querySelector("[data-profile-iframe]");
  var loading = document.querySelector("[data-profile-loading]");
  var status = document.querySelector("[data-profile-status]");
  var fullscreen = document.querySelector("[data-profile-fullscreen]");
  var driveUrl = "https://drive.google.com/file/d/1BkvSyD6eJuEL3qQYKE7XZSfbUWy-6xJW/view";
  if (!viewer || !frame || !iframe) return;

  iframe.addEventListener("load", function () {
    viewer.classList.add("is-loaded");
    if (loading) loading.hidden = true;
    if (status) status.textContent = "Company profile ready";
  });

  if (fullscreen) {
    fullscreen.addEventListener("click", function () {
      var request = frame.requestFullscreen || frame.webkitRequestFullscreen;
      if (typeof request === "function") request.call(frame);
      else window.open(driveUrl, "_blank", "noopener,noreferrer");
    });
  }
})();
