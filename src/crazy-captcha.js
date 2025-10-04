// Crazy Random Captcha - single file embeddable library
(function (global) {
  function rnd(n) {
    return Math.floor(Math.random() * n);
  }
  function randChoice(arr) {
    return arr[rnd(arr.length)];
  }

  // Small event emitter
  function E() {
    this.listeners = {};
  }
  E.prototype.on = function (evt, fn) {
    (this.listeners[evt] ||= this.listeners[evt] = []).push(fn);
    return this;
  };
  E.prototype.emit = function (evt, arg) {
    (this.listeners[evt] || []).forEach((fn) => fn(arg));
  };

  // Utilities
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function css(elm, obj) {
    Object.assign(elm.style, obj);
  }

  // Captcha constructor
  function CrazyCaptcha() {
    E.call(this);
    this._state = {};
  }
  CrazyCaptcha.prototype = Object.create(E.prototype);
  CrazyCaptcha.prototype.constructor = CrazyCaptcha;

  CrazyCaptcha.attach = function (container, options) {
    options = Object.assign({ difficulty: "easy" }, options || {});
    const c = new CrazyCaptcha();
    c._container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    c._options = options;
    c._build();
    return c;
  };

  CrazyCaptcha.prototype._build = function () {
    const root = el("div", "crazy-captcha");
    css(root, {
      border: "1px solid #ddd",
      padding: "12px",
      borderRadius: "8px",
      background: "#fff",
      width: "400px",
      boxSizing: "border-box",
    });
    this._root = root;

    const title = el("div", "cc-title");
    title.textContent = "Verify you are human";
    css(title, { fontWeight: 700, marginBottom: "8px" });
    root.appendChild(title);

    const stage = el("div", "cc-stage");
    this._stage = stage;
    root.appendChild(stage);

    const controls = el("div", "cc-controls");
    css(controls, { marginTop: "8px" });
    const refresh = el("button");
    refresh.textContent = "Refresh";
    refresh.type = "button";
    refresh.addEventListener("click", () => this.refresh());
    controls.appendChild(refresh);
    root.appendChild(controls);

    this._container.innerHTML = "";
    this._container.appendChild(root);

    this.refresh();
  };

  CrazyCaptcha.prototype.refresh = function () {
    // pick a random challenge type
    const types = ["canvas", "emoji", "math", "slider", "pattern"];
    const pick = randChoice(types);
    this._stage.innerHTML = "";
    this._state.challenge = pick;
    const fn = this["_render_" + pick];
    if (fn) fn.call(this, this._stage);
  };

  // VERIFY: returns Promise<boolean>
  CrazyCaptcha.prototype.verify = function () {
    const ch = this._state.challenge;
    if (!ch) return Promise.resolve(false);
    if (ch === "canvas") return Promise.resolve(this._verify_canvas());
    if (ch === "emoji") return Promise.resolve(this._verify_emoji());
    if (ch === "math") return Promise.resolve(this._verify_math());
    if (ch === "slider") return Promise.resolve(this._verify_slider());
    if (ch === "pattern") return Promise.resolve(this._verify_pattern());
    return Promise.resolve(false);
  };

  // ---------- challenge: canvas distorted text ----------
  CrazyCaptcha.prototype._render_canvas = function (root) {
    const canvas = el("canvas");
    canvas.width = 380;
    canvas.height = 80;
    css(canvas, { display: "block", border: "1px solid #eee" });
    root.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const text = Math.random().toString(36).slice(2, 8).toUpperCase();
    this._state.canvas_text = text;

    // draw background noise
    ctx.fillStyle = "#f7faff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.12 + ")";
      ctx.beginPath();
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // draw warped chars
    const charX = 20;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const fontSize = 28 + Math.random() * 18;
      ctx.save();
      ctx.font = Math.floor(fontSize) + "px serif";
      const tx = 30 + i * 55 + (Math.random() * 10 - 5);
      const ty = 40 + (Math.random() * 18 - 8);
      ctx.translate(tx, ty);
      ctx.rotate(Math.random() * 0.6 - 0.3);
      ctx.fillStyle = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
      ctx.fillText(ch, 0, 0);
      // ripple pixel distortion by drawing small rotated copies
      for (let j = 0; j < 6; j++) {
        ctx.globalAlpha = 0.04 + Math.random() * 0.06;
        ctx.fillText(ch, Math.random() * 6 - 3, Math.random() * 6 - 3);
      }
      ctx.restore();
    }
    // store a fingerprint (lowercase) for verification allowing simple human mistakes
    this._state.canvas_answer = text.toLowerCase();

    const input = el("input");
    input.placeholder = "Type the text you see";
    css(input, {
      display: "block",
      width: "80%",
      marginTop: "8px",
      padding: "6px",
    });
    root.appendChild(input);
    this._state.canvas_input = input;
  };
  CrazyCaptcha.prototype._verify_canvas = function () {
    const val = (this._state.canvas_input.value || "").trim().toLowerCase();
    const ok = val === this._state.canvas_answer;
    if (ok)
      this.emit("verified", {
        type: "canvas",
        token: Math.random().toString(36).slice(2),
      });
    return ok;
  };

  // ---------- challenge: emoji select ----------
  CrazyCaptcha.prototype._render_emoji = function (root) {
    // show a grid of emoji and ask user to click all cats (or chosen one)
    const pool = [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐵",
      "🐸",
      "🐙",
    ];
    const target = randChoice(["🐱", "🐶", "🦊", "🐵"]);
    this._state.emoji_target = target;
    const prompt = el("div");
    prompt.textContent = 'Click all "' + target + '" emojis';
    css(prompt, { marginBottom: "6px" });
    root.appendChild(prompt);
    const grid = el("div");
    css(grid, {
      display: "grid",
      gridTemplateColumns: "repeat(6,1fr)",
      gap: "6px",
    });
    root.appendChild(grid);
    this._state.emoji_selected = new Set();
    this._state.emoji_cells = [];
    // fill grid with random emojis
    for (let i = 0; i < 18; i++) {
      const e = el("button", "cc-emoji");
      e.type = "button";
      e.textContent = randChoice(pool);
      css(e, { fontSize: "20px", padding: "8px" });
      e.addEventListener("click", () => {
        if (e.classList.contains("sel")) {
          e.classList.remove("sel");
          this._state.emoji_selected.delete(i);
        } else {
          e.classList.add("sel");
          this._state.emoji_selected.add(i);
        }
      });
      grid.appendChild(e);
      this._state.emoji_cells.push(e);
    }
    // randomize so target appears 2-4 times
    const places = [];
    while (places.length < randChoice([2, 3, 4])) {
      const p = rnd(this._state.emoji_cells.length);
      if (!places.includes(p)) places.push(p);
    }
    for (const p of places) this._state.emoji_cells[p].textContent = target;
    // store correct indexes for verify
    this._state.emoji_answer = new Set(places);
  };
  CrazyCaptcha.prototype._verify_emoji = function () {
    const sel = this._state.emoji_selected || new Set();
    const ans = this._state.emoji_answer || new Set();
    // require sets equal
    if (sel.size !== ans.size) return false;
    for (const v of sel) if (!ans.has(v)) return false;
    this.emit("verified", {
      type: "emoji",
      token: Math.random().toString(36).slice(2),
    });
    return true;
  };

  // ---------- challenge: math ----------
  CrazyCaptcha.prototype._render_math = function (root) {
    const a = 1 + Math.floor(Math.random() * 12);
    const b = 1 + Math.floor(Math.random() * 12);
    const op = randChoice(["+", "-", "*"]);
    let q = a + op + b; // oops just symbolic
    const prompt = el("div");
    prompt.textContent = `Solve: ${a} ${op} ${b}`;
    css(prompt, { fontSize: "18px", marginBottom: "6px" });
    root.appendChild(prompt);
    const input = el("input");
    input.type = "number";
    input.placeholder = "Answer";
    css(input, { padding: "6px" });
    root.appendChild(input);
    this._state.math_input = input;
    let ans = 0;
    if (op === "+") ans = a + b;
    if (op === "-") ans = a - b;
    if (op === "*") ans = a * b;
    // randomly introduce a small tolerance for human errors? no exact
    this._state.math_answer = ans;
  };
  CrazyCaptcha.prototype._verify_math = function () {
    const v = Number(this._state.math_input.value);
    const ok = v === this._state.math_answer;
    if (ok)
      this.emit("verified", {
        type: "math",
        token: Math.random().toString(36).slice(2),
      });
    return ok;
  };

  // ---------- challenge: slider ----------
  CrazyCaptcha.prototype._render_slider = function (root) {
    const prompt = el("div");
    prompt.textContent = "Slide to match the secret position";
    css(prompt, { marginBottom: "6px" });
    root.appendChild(prompt);
    const bar = el("div");
    css(bar, {
      height: "36px",
      background: "#f2f2f2",
      display: "flex",
      alignItems: "center",
      padding: "6px",
      borderRadius: "6px",
    });
    const track = el("div");
    css(track, {
      flex: 1,
      height: "12px",
      background: "#ddd",
      position: "relative",
      borderRadius: "6px",
    });
    bar.appendChild(track);
    const knob = el("div");
    css(knob, {
      width: "26px",
      height: "26px",
      background: "#4a90e2",
      borderRadius: "50%",
      position: "absolute",
      left: "0px",
      top: "-7px",
      cursor: "pointer",
    });
    track.appendChild(knob);
    root.appendChild(bar);
    // secret target position between 10% and 90%
    const target = 10 + Math.random() * 80;
    this._state.slider_target = target;
    this._state.slider_value = 0;
    // simple drag logic
    let dragging = false;
    knob.addEventListener("pointerdown", (e) => {
      dragging = true;
      knob.setPointerCapture(e.pointerId);
    });
    document.addEventListener("pointerup", (e) => {
      if (dragging) {
        dragging = false;
        knob.releasePointerCapture && knob.releasePointerCapture(e.pointerId);
      }
    });
    document.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const rect = track.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      const pct = (x / rect.width) * 100;
      knob.style.left = (pct / 100) * (rect.width - 26) + "px";
      this._state.slider_value = pct;
    });
    const hint = el("div");
    hint.textContent = "Release when you think you matched it";
    css(hint, { fontSize: "12px", marginTop: "6px" });
    root.appendChild(hint);
  };
  CrazyCaptcha.prototype._verify_slider = function () {
    const val = this._state.slider_value || 0;
    const target = this._state.slider_target || 50;
    const ok = Math.abs(val - target) < 8;
    if (ok)
      this.emit("verified", {
        type: "slider",
        token: Math.random().toString(36).slice(2),
      });
    return ok;
  };

  // ---------- challenge: pattern (mini-drawing) ----------
  CrazyCaptcha.prototype._render_pattern = function (root) {
    const prompt = el("div");
    prompt.textContent = "Trace the pattern shown (connect the dots)";
    css(prompt, { marginBottom: "6px" });
    root.appendChild(prompt);
    const w = 360,
      h = 120;
    const c = el("canvas");
    c.width = w;
    c.height = h;
    css(c, { border: "1px solid #eee" });
    root.appendChild(c);
    const ctx = c.getContext("2d");
    // generate 4-6 dots
    const n = 4 + rnd(3);
    const dots = [];
    for (let i = 0; i < n; i++) {
      dots.push([
        40 + (i * (w - 80)) / (n - 1),
        40 + (Math.random() * 40 - 10),
      ]);
    }
    // draw dots and path
    ctx.fillStyle = "#000";
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d[0], d[1], 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dots[0][0], dots[0][1]);
    for (let i = 1; i < dots.length; i++) ctx.lineTo(dots[i][0], dots[i][1]);
    ctx.stroke();
    // we will ask user to click dots in order
    const dotsOverlay = el("div");
    css(dotsOverlay, {
      position: "relative",
      width: w + "px",
      height: h + "px",
      top: "-120px",
    });
    root.appendChild(dotsOverlay);
    this._state.pattern_dots = dots;
    this._state.pattern_selected = [];
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const btn = el("button");
      btn.type = "button";
      btn.textContent = "";
      css(btn, {
        position: "absolute",
        left: d[0] - 8 + "px",
        top: d[1] - 8 + "px",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: "rgba(0,0,0,0.6)",
        border: "none",
      });
      btn.addEventListener("click", () => {
        if (!btn.classList.contains("sel")) {
          btn.classList.add("sel");
          btn.style.background = "orange";
          this._state.pattern_selected.push(i);
        }
      });
      dotsOverlay.appendChild(btn);
    }
    this._state.pattern_answer = Array.from(
      { length: dots.length },
      (_, i) => i
    );
  };
  CrazyCaptcha.prototype._verify_pattern = function () {
    const sel = this._state.pattern_selected || [];
    const ans = this._state.pattern_answer || [];
    if (sel.length !== ans.length) return false;
    for (let i = 0; i < ans.length; i++) if (sel[i] !== ans[i]) return false;
    this.emit("verified", {
      type: "pattern",
      token: Math.random().toString(36).slice(2),
    });
    return true;
  };

  // expose
  global.CrazyCaptcha = CrazyCaptcha;
})(window);
