function getToastContainer() {
  let container = document.getElementById("toast-wrapper");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-wrapper";
    document.body.appendChild(container);
   }
   
   return container;
}

/**
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */

function showNotification(message, type = "success") {
  const container = getToastContainer();
  const toast = document.createElement("div");

  const borderClass =
    type === "success" ? "toast-success-line" : "toast-error-line";
  const icon = type === "success" ? "🌸" : "⚠️";

  toast.className = `custom__toast ${borderClass}`;
  toast.innerHTML = `
      <span style="font-size: 20px">${icon}</span>
      <span>${message}</span>
   `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}


function showNotificationWindow(title, text, type = "success", customImage = "img/bg/intro4.png") {
  return Swal.fire({
    title: title,
    text: text,
    icon: type, 
    iconColor: "rgb(var(--accent-2))",
    confirmButtonText: "Зрозуміло",

    backdrop: `
            linear-gradient(
                rgba(255, 230, 238, 0.4),
                rgba(255, 230, 238, 0.4)
            ),
            url("${customImage}") center center / cover no-repeat
        `,
  });
}


function showConfirmDialog(title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'rgb(var(--accent-2))', // Твій рожевий колір
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Так, видалити!',
    cancelButtonText: 'Ні, скасувати',
    
    // Твій фірмовий фон
    backdrop: `
            linear-gradient(
                rgba(255, 230, 238, 0.4),
                rgba(255, 230, 238, 0.4)
            ),
            url("img/bg/intro4.png") center center / cover no-repeat
        `,
  });
}