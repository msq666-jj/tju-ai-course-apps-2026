const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

async function copyText(text, button) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    copied = fallbackCopy(text);
  }

  if (!copied) {
    showToast("复制失败，请手动选择文字");
    return;
  }

  const original = button.textContent;
  button.textContent = "已复制";
  showToast("已复制到剪贴板");
  setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

document.querySelector("#copyPrompt").addEventListener("click", (event) => {
  copyText(document.querySelector("#systemPrompt").innerText.trim(), event.currentTarget);
});

document.querySelector("#copySystemPrompt").addEventListener("click", (event) => {
  copyText(document.querySelector("#systemPrompt").innerText.trim(), event.currentTarget);
});
