const postDialog = document.querySelector("[data-post-dialog]");
const openPostButton = document.querySelector("[data-open-post]");
const closePostButton = document.querySelector("[data-close-post]");
const imageUrlInput = document.querySelector("[data-image-url]");
const imagePreview = document.querySelector("[data-image-preview]");

if (openPostButton && postDialog) {
  openPostButton.addEventListener("click", () => postDialog.showModal());
  closePostButton.addEventListener("click", () => postDialog.close());
  postDialog.addEventListener("click", (event) => {
    if (event.target === postDialog) postDialog.close();
  });
}

if (imageUrlInput && imagePreview) {
  imageUrlInput.addEventListener("input", () => {
    imagePreview.hidden = !imageUrlInput.value;
    imagePreview.src = imageUrlInput.value;
  });
  imagePreview.addEventListener("error", () => {
    imagePreview.hidden = true;
  });
}
