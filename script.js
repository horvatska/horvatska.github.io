let zIndexCounter = 10;
let windowCount = 0;
let browserWindowCount = 0;

const desktop = document.getElementById("desktop");
const taskbarApps = document.getElementById("taskbar-apps");
const windowTemplate = document.getElementById("window-template").content;

// memorija localstoragea da se ne pojavi isti prozor 300 puta
window.onload = () => {
  if (!localStorage.getItem("aboutOpened")) {
    createWindow("about.html", "O sustavu:");
    localStorage.setItem("aboutOpened", "true");
  }
};

document.getElementById("recycle-bin").addEventListener("dblclick", () => {
  createWindow("recycle-bin.html", "Recycle Bin");
});


function createWindow(url, title, customId = null, iconSrc = null, iconAlt = "") {
  // zaštititi od više prozora
  if (url === "about.html") {
    const existing = Array.from(document.querySelectorAll(".window iframe"))
      .some(iframe => iframe.src.includes("about.html"));
    if (existing) return;
  }


  if (url === "recycle-bin.html") {
    const existing = Array.from(document.querySelectorAll(".window iframe"))
      .some(iframe => iframe.src.includes("recycle-bin.html"));
    if (existing) return;
  }

  const win = windowTemplate.cloneNode(true).querySelector(".window");
  const titleEl = win.querySelector(".title");
  const iframe = win.querySelector("iframe");

  const id = customId || `window-${windowCount++}`;
  win.setAttribute("id", id);
  titleEl.textContent = title;
  iframe.src = url;

  // jebanje winver prozora
  if (url === "about.html") {
    const maximizeBtn = win.querySelector(".maximize");
    maximizeBtn.style.display = "none";
  }

// ikone

if (iconSrc) {
  createTaskbarIcon(id, iconSrc, iconAlt);
} else if (url === "about.html") {
  createTaskbarIcon(id, "assets/images/exe.jpg", "O sustavu");
} else if (url === "recycle-bin.html") {
  createTaskbarIcon(id, "assets/images/recycle-bin.png", "Recycle Bin");
} else if (url === "novosti.html") {
  createTaskbarIcon(id, "assets/images/exe.jpg", "Novosti"); 
} else if (title === "README.md") {
  createTaskbarIcon(id, "assets/images/text-file.png", "README.md"); 
} else if (title !== "Internet Explorer") {
  createTaskbarItem(id, title);
}

  makeDraggable(win);

  win.style.top = `${100 + windowCount * 10}px`;
  win.style.left = `${100 + windowCount * 10}px`;
  win.style.zIndex = zIndexCounter++;

  // kontrole prozora
  win.querySelector(".minimize").onclick = () => minimizeWindow(id);
  win.querySelector(".maximize").onclick = () => maximizeWindow(id);
  win.querySelector(".close").onclick = () => closeWindow(id);

  desktop.appendChild(win);

  
  if (iconSrc) {
    createTaskbarIcon(id, iconSrc, iconAlt);
  } else if (title !== "Internet Explorer") {
    createTaskbarItem(id, title);
  }
}


function createTaskbarIcon(id, iconSrc, iconAlt) {
 
  if (document.getElementById(`${id}-task`)) return;
  const btn = document.createElement("button");
  btn.classList.add("taskbar-icon-btn");
  btn.setAttribute("id", `${id}-task`);
  btn.title = iconAlt || "";
  const img = document.createElement("img");
  img.src = iconSrc;
  img.alt = iconAlt;
  img.style.width = "24px";
  img.style.height = "24px";
  btn.appendChild(img);

  btn.onclick = () => {
    const win = document.getElementById(id);
    if (win && win.style.display === "none") {
      win.style.display = "flex";
      win.style.animation = "fadeIn 0.2s ease";
      win.style.zIndex = zIndexCounter++;
    } else if (win) {
      win.style.zIndex = zIndexCounter++;
    }
  };
  taskbarApps.appendChild(btn);
}


function createTaskbarItem(id, title) {
  if (document.getElementById(`${id}-task`)) return;
  const btn = document.createElement("button");
  btn.textContent = title;
  btn.classList.add("taskbar-button");
  btn.setAttribute("id", `${id}-task`);
  btn.onclick = () => {
    const win = document.getElementById(id);
    if (win && win.style.display === "none") {
      win.style.display = "flex";
      win.style.animation = "fadeIn 0.2s ease";
      win.style.zIndex = zIndexCounter++;
    } else if (win) {
      win.style.zIndex = zIndexCounter++;
    }
  };
  taskbarApps.appendChild(btn);
}

function makeDraggable(win) {
  const bar = win.querySelector(".title-bar");
  let isDragging = false, offsetX, offsetY;

  bar.addEventListener("mousedown", e => {
    isDragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    win.style.zIndex = zIndexCounter++;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => isDragging = false);
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.classList.add("minimizing");
  setTimeout(() => {
    win.style.display = "none";
    win.classList.remove("minimizing");
  }, 200);
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  const isMax = win.classList.toggle("maximized");

  win.classList.add("resizing");
  setTimeout(() => win.classList.remove("resizing"), 200);

  if (isMax) {
    win.dataset.originalStyle = `${win.style.top}|${win.style.left}|${win.style.width}|${win.style.height}`;
    win.style.top = "0";
    win.style.left = "0";
    win.style.width = "100%";
    win.style.height = "calc(100% - 40px)";
  } else {
    const [top, left, width, height] = win.dataset.originalStyle.split("|");
    win.style.top = top;
    win.style.left = left;
    win.style.width = width;
    win.style.height = height;
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  const task = document.getElementById(`${id}-task`);
  if (win) win.remove();
  
  if (task && !task.classList.contains("original-ie")) task.remove();
}


document.getElementById("ie-button").addEventListener("click", () => {
  if (!sessionStorage.getItem("ieWarningShown")) {
    showWarningBox(
      "Zbog sigurnosnih razloga, Tvoj preglednik možda neće ispravno prikazati web stranicu zbog embeding problema. Nastavite?",
      () => {
        sessionStorage.setItem("ieWarningShown", "true");
        openBrowserWindow("https://www.google.com");
      }
    );
  } else {
    openBrowserWindow("https://www.google.com");
  }
});


function openBrowserWindow(url) {
  browserWindowCount++;
  const browserId = `browser-window-${browserWindowCount}`;
  createWindow(
    url,
    "Internet Explorer",
    browserId,
    "assets/images/ie.png",
    "Internet Explorer"
  );
}


function showWarningBox(message, onOk) {

  if (document.getElementById("custom-warning-box")) return;

  const overlay = document.createElement("div");
  overlay.id = "custom-warning-box";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.25)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.border = "2px solid #e6b800";
  box.style.borderRadius = "8px";
  box.style.padding = "28px 32px";
  box.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
  box.style.fontFamily = "Segoe UI, Arial, sans-serif";
  box.style.fontSize = "16px";
  box.style.maxWidth = "350px";
  box.style.textAlign = "center";

  box.innerHTML = `
    <div style="font-weight:bold; color:#e6b800; margin-bottom:12px;">
      ⚠️ Upozorenje
    </div>
    <div style="margin-bottom:18px;">${message}</div>
    <button id="warning-ok" style="
      background:#e6b800; color:#fff; border:none; border-radius:4px;
      padding:8px 22px; font-size:15px; cursor:pointer; font-weight:bold;
    ">OK</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("warning-ok").onclick = () => {
    document.body.removeChild(overlay);
    if (typeof onOk === "function") onOk();
  };

  const sound = new Audio('assets/sound/Windows Exclamation.wav');
  sound.play();

}


window.addEventListener("message", (event) => {
  if (event.data.type === "close-about-window") {
    
    const windows = document.querySelectorAll(".window");
    windows.forEach(win => {
      const iframe = win.querySelector("iframe");
      if (iframe && iframe.src.includes("about.html")) {
        closeWindow(win.id);
      }
    });
  }
});

const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");

startButton.addEventListener("click", () => {
  if (startMenu.classList.contains("hidden")) {
    startMenu.classList.remove("hidden");
  } else {
    startMenu.classList.add("hidden");
  }
});


document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add("hidden");
  }
});


document.getElementById("start-about").addEventListener("click", () => {
  createWindow("about.html", "O sustavu:");
  startMenu.classList.add("hidden");
});

document.getElementById("start-novosti").addEventListener("click", () => {
  createWindow("novosti.html", "Vijesti Horvatske");
  startMenu.classList.add("hidden");
});

function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  const time = now.toLocaleTimeString("hr-HR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString("hr-HR");
  clock.textContent = `${time}\n${date}`;
}
setInterval(updateClock, 1000);
updateClock();


const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");


let globalVolume = volumeSlider ? volumeSlider.value / 100 : 0.5;


(function() {
  const OriginalAudio = window.Audio;
  window.Audio = function(...args) {
    const audio = new OriginalAudio(...args);
    audio.volume = globalVolume;
    return audio;
  };
  window.Audio.prototype = OriginalAudio.prototype;
})();

function setGlobalVolume(vol) {
  globalVolume = vol;
 
  document.querySelectorAll('audio, video').forEach(el => {
    el.volume = globalVolume;
  });
}


setGlobalVolume(globalVolume);

if (volumeSlider && volumeIcon) {
  volumeSlider.addEventListener("input", () => {
    const v = parseInt(volumeSlider.value, 10);
    
    if (v === 0) {
      volumeIcon.src = "assets/images/volume-mute.png";
    } else if (v < 40) {
      volumeIcon.src = "assets/images/volume-low.png";
    } else {
      volumeIcon.src = "assets/images/volume.png";
    }
    // Set global volume (0.0 - 1.0)
    setGlobalVolume(v / 100);
  });
}


const observer = new MutationObserver(() => setGlobalVolume(globalVolume));
observer.observe(document.body, { childList: true, subtree: true });

document.getElementById("readme-shortcut").addEventListener("dblclick", () => {
  createWindow(
    "data:text/html,<h2>HORVATSKA OS GREETING</h2><pre>Prvi inovacijski operativni sustav Horvatske napravljen od Bubijan D.O.O. Tvrtke. Uskoro novi updejt sa customization i mozda u buducnosti budemo ko terry davis napravimo Horvatska OS na linux kernelu.</pre>",
    "README.md"
  );
});