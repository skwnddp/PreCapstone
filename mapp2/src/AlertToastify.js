// AlertToastify.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AlertToastify.css"

// 기본 alert()를 react-toastify로 대체
const AlertToastify = (message) => {
  toast("💬 " + message, {
    position: "bottom-right", // 위치 (top-left, top-center, top-right 등)
    autoClose: 2000,       // 자동 닫힘
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    className: "black-red-theme",
    progressClassName: "custom-progress",
  });
};

// window.alert을 커스터마이즈
window.alert = AlertToastify;

const AlertContainer = () => {
  return (
    <ToastContainer limit={5} />
  )
};

export { AlertToastify, AlertContainer };