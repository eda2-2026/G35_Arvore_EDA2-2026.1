(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function createSvgElement(tag, attrs = {}) {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  function formatCpf(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function truncateText(value, maxLength) {
    const text = String(value || "");
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
  }

  function patientFromNode(node) {
    return {
      cpf: node.cpf,
      nome: node.nome,
      idade: node.idade,
      prontuario: node.prontuario,
      cor: node.cor,
    };
  }

  function flattenInOrder(root) {
    const output = [];

    function visit(node) {
      if (!node) return;
      visit(node.esquerdo);
      output.push(patientFromNode(node));
      visit(node.direito);
    }

    visit(root);
    return output;
  }

  function summarize(root) {
    const summary = {
      total: 0,
      red: 0,
      black: 0,
      height: 0,
      leaves: 0,
      averageDepth: 0,
      rootCpf: root ? root.cpf : null,
    };

    let depthSum = 0;

    function visit(node, depth) {
      if (!node) return 0;

      summary.total += 1;
      depthSum += depth;

      if (node.cor === "VERMELHO") {
        summary.red += 1;
      } else {
        summary.black += 1;
      }

      const leftHeight = visit(node.esquerdo, depth + 1);
      const rightHeight = visit(node.direito, depth + 1);

      if (!node.esquerdo && !node.direito) {
        summary.leaves += 1;
      }

      return Math.max(leftHeight, rightHeight) + 1;
    }

    summary.height = visit(root, 1);
    summary.averageDepth = summary.total ? depthSum / summary.total : 0;
    return summary;
  }

  function render(container, root, options = {}) {
    if (!container) return;

    container.innerHTML = "";

    if (!root) {
      const empty = document.createElement("div");
      empty.className = "tree-empty";
      empty.innerHTML = "<strong>Arvore vazia</strong><span>Nenhum CPF foi indexado ainda.</span>";
      container.appendChild(empty);
      return;
    }

    const nodes = [];
    const links = [];
    let order = 0;
    let maxDepth = 1;

    function layout(node, depth) {
      if (!node) return null;

      const left = layout(node.esquerdo, depth + 1);
      const entry = {
        data: node,
        depth,
        order: order,
        left,
        right: null,
        x: 0,
        y: 0,
      };

      order += 1;
      maxDepth = Math.max(maxDepth, depth);
      nodes.push(entry);

      const right = layout(node.direito, depth + 1);
      entry.right = right;

      if (left) links.push({ from: entry, to: left });
      if (right) links.push({ from: entry, to: right });

      return entry;
    }

    layout(root, 1);

    const compact = nodes.length > 18;
    const nodeRadius = compact ? 19 : 24;
    const gapX = compact ? 92 : 138;
    const gapY = compact ? 96 : 118;
    const marginX = compact ? 48 : 70;
    const marginTop = 54;
    const marginBottom = compact ? 54 : 76;
    const width = Math.max(container.clientWidth || 780, (nodes.length - 1) * gapX + marginX * 2);
    const height = Math.max(360, (maxDepth - 1) * gapY + marginTop + marginBottom);

    nodes.forEach((node) => {
      node.x = marginX + node.order * gapX;
      node.y = marginTop + (node.depth - 1) * gapY;
    });

    const svg = createSvgElement("svg", {
      class: "tree-svg",
      viewBox: `0 0 ${width} ${height}`,
      width,
      height,
      role: "img",
      "aria-label": "Visualizacao da arvore rubro-negra de pacientes",
    });

    const linkLayer = createSvgElement("g", { class: "tree-links" });
    links.forEach((link) => {
      linkLayer.appendChild(
        createSvgElement("line", {
          class: "tree-link",
          x1: link.from.x,
          y1: link.from.y + nodeRadius,
          x2: link.to.x,
          y2: link.to.y - nodeRadius,
        }),
      );
    });
    svg.appendChild(linkLayer);

    const nodeLayer = createSvgElement("g", { class: "tree-nodes" });
    nodes.forEach((node) => {
      const patient = patientFromNode(node.data);
      const isRed = patient.cor === "VERMELHO";
      const isFocus = options.focusCpf && patient.cpf === options.focusCpf;
      const group = createSvgElement("g", {
        class: `tree-node${isFocus ? " is-focus" : ""}`,
        transform: `translate(${node.x}, ${node.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${patient.nome}, CPF ${formatCpf(patient.cpf)}`,
      });

      const title = createSvgElement("title");
      title.textContent = `${patient.nome} | CPF ${formatCpf(patient.cpf)} | ${patient.cor}`;
      group.appendChild(title);

      group.appendChild(
        createSvgElement("circle", {
          r: nodeRadius,
          fill: isRed ? "#d9435f" : "#222a33",
          stroke: isFocus ? "#d9961a" : "#ffffff",
          "stroke-width": isFocus ? 5 : 3,
        }),
      );

      const mainLabel = createSvgElement("text", {
        class: "node-main-label",
        x: 0,
        y: 5,
        "text-anchor": "middle",
      });
      mainLabel.textContent = patient.cpf.slice(-3);
      group.appendChild(mainLabel);

      if (!compact) {
        const nameLabel = createSvgElement("text", {
          class: "node-name",
          x: 0,
          y: nodeRadius + 22,
          "text-anchor": "middle",
        });
        nameLabel.textContent = truncateText(patient.nome, 16);
        group.appendChild(nameLabel);
      }

      const cpfLabel = createSvgElement("text", {
        class: "node-cpf",
        x: 0,
        y: nodeRadius + (compact ? 18 : 39),
        "text-anchor": "middle",
      });
      cpfLabel.textContent = compact ? patient.cpf.slice(-4) : formatCpf(patient.cpf);
      group.appendChild(cpfLabel);

      const selectNode = () => {
        if (typeof options.onNodeSelect === "function") {
          options.onNodeSelect(patient);
        }
      };

      group.addEventListener("click", selectNode);
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode();
        }
      });

      nodeLayer.appendChild(group);
    });

    svg.appendChild(nodeLayer);
    container.appendChild(svg);
  }

  window.TreeTools = {
    flattenInOrder,
    formatCpf,
    render,
    summarize,
  };
})();
