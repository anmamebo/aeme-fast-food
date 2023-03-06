function toastTrigger(e, toastId, modal) {  
  e.preventDefault();

  if (modal) {
    document.getElementById('closeModal').click();
  }
  
  const successFormToast = document.getElementById(toastId);
  
  const toast = new bootstrap.Toast(successFormToast);
  toast.show();
}