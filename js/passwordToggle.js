const show_pw_btn = document.querySelector("#show_pw_btn");
const show_pw_icon = document.querySelector("#show_pw_icon");
const password_input = document.querySelector("#password");

const show_conf_pw_btn = document.querySelector("#show_conf_pw_btn");
const show_conf_pw_icon = document.querySelector("#show_conf_pw_icon");
const conf_password_input = document.querySelector("#conf-password");

show_pw_btn.addEventListener("click", () => {
  const pwd_type =
    password_input.getAttribute("type") === "password" ? "text" : "password";
  password_input.setAttribute("type", pwd_type);

  show_pw_icon.classList.toggle("fa-eye");
  show_pw_icon.classList.toggle("fa-eye-slash");
});

show_conf_pw_btn.addEventListener("click", () => {
  const conf_type =
    conf_password_input.getAttribute("type") === "password"
      ? "text"
      : "password";
  conf_password_input.setAttribute("type", conf_type);

  show_conf_pw_icon.classList.toggle("fa-eye");
  show_conf_pw_icon.classList.toggle("fa-eye-slash");
});
