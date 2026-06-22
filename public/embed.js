(function () {
  var script = document.currentScript;
  var baseUrl = script && script.getAttribute("data-base");
  if (!baseUrl && script && script.src) {
    try {
      var url = new URL(script.src);
      baseUrl = url.origin;
    } catch (e) {
      baseUrl = "";
    }
  }
  baseUrl = baseUrl || window.location.origin;

  var targetId =
    (script && script.getAttribute("data-target")) || "syntra-capture";
  if (!document.getElementById(targetId)) {
    var legacy = document.getElementById("imobicrm-capture");
    if (legacy) targetId = "imobicrm-capture";
  }

  var mode = (script && script.getAttribute("data-mode")) || "iframe";
  var propertyCode = script && script.getAttribute("data-property");
  var container = document.getElementById(targetId);

  if (!container) {
    container = document.createElement("div");
    container.id = targetId;
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  if (mode === "iframe") {
    var iframe = document.createElement("iframe");
    var src = baseUrl + "/captura";
    if (propertyCode) src += "?imovel=" + encodeURIComponent(propertyCode);
    iframe.src = src + (propertyCode ? "&" : "?") + "embed=1";
    iframe.title = "Formulário de captação Syntra Imóveis";
    iframe.style.width = "100%";
    iframe.style.minHeight = "520px";
    iframe.style.border = "0";
    iframe.loading = "lazy";
    container.appendChild(iframe);
    return;
  }

  container.innerHTML =
    '<form id="syntra-form" style="font-family:Arial,sans-serif;max-width:420px">' +
    '<div style="margin-bottom:12px"><label>Nome *</label><br><input name="name" required style="width:100%;padding:8px"></div>' +
    '<div style="margin-bottom:12px"><label>Telefone *</label><br><input name="phone" required style="width:100%;padding:8px"></div>' +
    '<div style="margin-bottom:12px"><label>E-mail</label><br><input name="email" type="email" style="width:100%;padding:8px"></div>' +
    '<div style="margin-bottom:12px"><label>Interesse</label><br><input name="interest" style="width:100%;padding:8px"></div>' +
    '<label style="display:block;margin-bottom:12px;font-size:12px"><input type="checkbox" name="lgpd" required> Aceito a política de privacidade (LGPD)</label>' +
    '<button type="submit" style="width:100%;padding:10px;background:#2563eb;color:#fff;border:0;border-radius:6px;cursor:pointer">Quero ser contactado</button>' +
    '<p id="syntra-msg" style="margin-top:12px;font-size:13px"></p></form>';

  var form = document.getElementById("syntra-form");
  var msg = document.getElementById("syntra-msg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.textContent = "Enviando...";
    fetch(baseUrl + "/api/public/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value || undefined,
        interest: form.interest.value || undefined,
        propertyCode: propertyCode || undefined,
        lgpdConsent: form.lgpd.checked,
      }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || "Erro ao enviar");
          msg.textContent = "Cadastro realizado! Entraremos em contato em breve.";
          form.reset();
        });
      })
      .catch(function (err) {
        msg.textContent = err.message || "Erro ao enviar formulário";
      });
  });
})();
