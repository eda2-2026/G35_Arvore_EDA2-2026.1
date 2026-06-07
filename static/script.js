(() => {
  const demoPatients = [
    {
      cpf: "52998224725",
      nome: "Ana Ribeiro",
      idade: 34,
      prontuario: "Hipertensao controlada. Alergia a dipirona registrada.",
    },
    {
      cpf: "11458963780",
      nome: "Bruno Carvalho",
      idade: 46,
      prontuario: "Historico de asma. Ultima consulta com queixa respiratoria leve.",
    },
    {
      cpf: "80244193012",
      nome: "Carla Monteiro",
      idade: 29,
      prontuario: "Acompanhamento pos-operatorio. Sem intercorrencias recentes.",
    },
    {
      cpf: "31877465009",
      nome: "Diego Almeida",
      idade: 58,
      prontuario: "Diabetes tipo 2. Monitoramento glicemico semanal.",
    },
    {
      cpf: "64011987531",
      nome: "Elisa Nascimento",
      idade: 41,
      prontuario: "Paciente internada no setor clinico. Exames laboratoriais em revisao.",
    },
    {
      cpf: "27190438655",
      nome: "Fabio Teixeira",
      idade: 62,
      prontuario: "Cardiopatia previa. Uso continuo de anticoagulante.",
    },
    {
      cpf: "95301642877",
      nome: "Gabriela Souza",
      idade: 23,
      prontuario: "Triagem de urgencia. Suspeita de virose sem sinais de gravidade.",
    },
    {
      cpf: "48723091644",
      nome: "Helena Duarte",
      idade: 37,
      prontuario: "Gestante em acompanhamento. Pressao arterial dentro da faixa esperada.",
    },
    {
      cpf: "73569018420",
      nome: "Igor Martins",
      idade: 51,
      prontuario: "Pneumonia tratada recentemente. Retorno solicitado em 15 dias.",
    },
    {
      cpf: "19684570233",
      nome: "Joana Lima",
      idade: 19,
      prontuario: "Vacinas atualizadas. Sem alergias conhecidas.",
    },
    {
      cpf: "88420753166",
      nome: "Lucas Ferreira",
      idade: 44,
      prontuario: "Observacao por infeccao hospitalar descartada em cultura.",
    },
  ];

  const state = {
    focusedCpf: null,
    selectedPatient: null,
    tree: null,
    toastTimer: null,
  };

  const dom = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindElements();
    bindEvents();
    refreshTree();
  });

  function bindElements() {
    dom.searchForm = document.querySelector("#searchForm");
    dom.searchInput = document.querySelector("#cpfSearch");
    dom.searchButton = document.querySelector("#searchButton");
    dom.demoButton = document.querySelector("#demoButton");
    dom.patientForm = document.querySelector("#patientForm");
    dom.cpfInput = document.querySelector("#cpfInput");
    dom.nameInput = document.querySelector("#nameInput");
    dom.ageInput = document.querySelector("#ageInput");
    dom.recordInput = document.querySelector("#recordInput");
    dom.createButton = document.querySelector("#createButton");
    dom.clearFormButton = document.querySelector("#clearFormButton");
    dom.patientResult = document.querySelector("#patientResult");
    dom.treeCanvas = document.querySelector("#treeCanvas");
    dom.patientList = document.querySelector("#patientList");
    dom.toast = document.querySelector("#toast");
    dom.statTotal = document.querySelector("#statTotal");
    dom.statHeight = document.querySelector("#statHeight");
    dom.statRed = document.querySelector("#statRed");
    dom.statBlack = document.querySelector("#statBlack");
    dom.complexityBadge = document.querySelector("#complexityBadge");
  }

  function bindEvents() {
    [dom.searchInput, dom.cpfInput].forEach(attachCpfMask);

    dom.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const cpf = onlyDigits(dom.searchInput.value);
      searchPatient(cpf);
    });

    dom.patientForm.addEventListener("submit", handleCreatePatient);
    dom.clearFormButton.addEventListener("click", () => dom.patientForm.reset());
    dom.demoButton.addEventListener("click", loadDemoPatients);

    dom.patientList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-search-cpf]");
      if (!button) return;

      const cpf = button.getAttribute("data-search-cpf");
      dom.searchInput.value = TreeTools.formatCpf(cpf);
      searchPatient(cpf);
    });

    dom.patientResult.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-cpf]");
      if (!button) return;

      const cpf = button.getAttribute("data-copy-cpf");
      try {
        await navigator.clipboard.writeText(TreeTools.formatCpf(cpf));
        showToast("CPF copiado para a area de transferencia.", "success");
      } catch {
        showToast(`CPF: ${TreeTools.formatCpf(cpf)}`, "success");
      }
    });
  }

  function attachCpfMask(input) {
    input.addEventListener("input", () => {
      input.value = TreeTools.formatCpf(input.value);
    });
  }

  async function handleCreatePatient(event) {
    event.preventDefault();

    const payload = {
      cpf: onlyDigits(dom.cpfInput.value),
      nome: dom.nameInput.value.trim(),
      idade: Number(dom.ageInput.value),
      prontuario: dom.recordInput.value.trim(),
    };

    const validationError = validatePatient(payload);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setBusy(dom.createButton, true);

    try {
      const response = await requestJson("/api/paciente", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      state.focusedCpf = response.dados.cpf;
      state.selectedPatient = response.dados;
      renderPatient(response.dados, "Paciente cadastrado");
      dom.searchInput.value = TreeTools.formatCpf(response.dados.cpf);
      dom.patientForm.reset();
      showToast(response.mensagem || "Paciente cadastrado com sucesso.", "success");
      await refreshTree();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBusy(dom.createButton, false);
    }
  }

  async function searchPatient(cpf) {
    if (cpf.length !== 11) {
      showToast("Informe um CPF com 11 digitos.", "error");
      return;
    }

    setBusy(dom.searchButton, true);

    try {
      const response = await requestJson(`/api/paciente/${cpf}`);
      state.focusedCpf = response.dados.cpf;
      state.selectedPatient = response.dados;
      dom.searchInput.value = TreeTools.formatCpf(response.dados.cpf);
      renderPatient(response.dados, "Paciente encontrado");
      await refreshTree();
    } catch (error) {
      showToast(error.message, "error");
      renderEmptyPatient("Paciente nao encontrado", "Confira o CPF ou cadastre um novo prontuario.");
    } finally {
      setBusy(dom.searchButton, false);
    }
  }

  async function loadDemoPatients() {
    setBusy(dom.demoButton, true);

    let created = 0;
    let skipped = 0;

    try {
      for (const patient of demoPatients) {
        try {
          await requestJson("/api/paciente", {
            method: "POST",
            body: JSON.stringify(patient),
          });
          created += 1;
        } catch (error) {
          if (error.status === 409) {
            skipped += 1;
          } else {
            throw error;
          }
        }
      }

      const message = created
        ? `${created} pacientes demo adicionados ao indice.`
        : `${skipped} pacientes demo ja estavam no indice.`;
      showToast(message, "success");
      await refreshTree();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setBusy(dom.demoButton, false);
    }
  }

  async function refreshTree() {
    try {
      const response = await requestJson("/api/arvore/estrutura");
      state.tree = response.arvore;
      renderStats();
      renderIndexList();
      drawTree();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function drawTree() {
    TreeTools.render(dom.treeCanvas, state.tree, {
      focusCpf: state.focusedCpf,
      onNodeSelect: (patient) => {
        state.focusedCpf = patient.cpf;
        state.selectedPatient = patient;
        dom.searchInput.value = TreeTools.formatCpf(patient.cpf);
        renderPatient(patient, "Paciente selecionado");
        drawTree();
      },
    });
  }

  function renderStats() {
    const summary = TreeTools.summarize(state.tree);
    dom.statTotal.textContent = String(summary.total);
    dom.statHeight.textContent = String(summary.height);
    dom.statRed.textContent = String(summary.red);
    dom.statBlack.textContent = String(summary.black);

    dom.complexityBadge.textContent = summary.total
      ? `Busca em ate ${summary.height} niveis`
      : "Aguardando dados";
  }

  function renderIndexList() {
    const patients = TreeTools.flattenInOrder(state.tree);

    if (!patients.length) {
      dom.patientList.innerHTML =
        '<div class="empty-state"><strong>Nenhum CPF cadastrado</strong><span>O indice ordenado aparecera aqui.</span></div>';
      return;
    }

    dom.patientList.innerHTML = patients
      .map(
        (patient) => `
          <div class="index-row">
            <div>
              <strong>${escapeHtml(patient.nome)}</strong>
              <span>${TreeTools.formatCpf(patient.cpf)}</span>
            </div>
            <button type="button" data-search-cpf="${escapeHtml(patient.cpf)}">Abrir</button>
          </div>
        `,
      )
      .join("");
  }

  function renderPatient(patient, label) {
    const isRed = patient.cor === "VERMELHO";
    dom.patientResult.classList.remove("empty-state");
    dom.patientResult.innerHTML = `
      <article class="patient-profile">
        <header>
          <div>
            <span class="eyebrow">${escapeHtml(label)}</span>
            <h3>${escapeHtml(patient.nome)}</h3>
          </div>
          <span class="color-pill">
            <span class="color-dot ${isRed ? "red" : "black"}"></span>
            ${isRed ? "No vermelho" : "No preto"}
          </span>
        </header>

        <dl class="patient-fields">
          <div>
            <dt>CPF</dt>
            <dd>${TreeTools.formatCpf(patient.cpf)}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>${escapeHtml(patient.idade)} anos</dd>
          </div>
        </dl>

        <div class="record-box">
          <span>Historico clinico</span>
          <p>${escapeHtml(patient.prontuario)}</p>
        </div>

        <div class="copy-row">
          <button class="text-link" type="button" data-copy-cpf="${escapeHtml(patient.cpf)}">
            Copiar CPF
          </button>
        </div>
      </article>
    `;
  }

  function renderEmptyPatient(title, message) {
    dom.patientResult.classList.add("empty-state");
    dom.patientResult.innerHTML = `
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    `;
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data && data.mensagem ? data.mensagem : `Erro HTTP ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  function validatePatient(patient) {
    if (patient.cpf.length !== 11) return "Informe um CPF com 11 digitos.";
    if (!patient.nome) return "Informe o nome completo do paciente.";
    if (!Number.isInteger(patient.idade) || patient.idade < 0 || patient.idade > 150) {
      return "Informe uma idade valida entre 0 e 150.";
    }
    if (!patient.prontuario) return "Informe o prontuario do paciente.";
    return "";
  }

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 11);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setBusy(button, isBusy) {
    button.disabled = isBusy;
    button.classList.toggle("is-loading", isBusy);
  }

  function showToast(message, type = "success") {
    clearTimeout(state.toastTimer);
    dom.toast.textContent = message;
    dom.toast.className = `toast ${type}`;
    dom.toast.hidden = false;

    state.toastTimer = setTimeout(() => {
      dom.toast.hidden = true;
    }, 3600);
  }
})();
