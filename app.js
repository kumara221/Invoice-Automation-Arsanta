const { jsPDF } = window.jspdf;

const adminSelect = document.getElementById("adminSelect");
const invoiceDateInput = document.getElementById("invoiceDate");
const customerOrderInput = document.getElementById("customerOrder");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const customerUniversityInput = document.getElementById("customerUniversity");
const invoiceNoPreview = document.getElementById("invoiceNoPreview");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const paidToggle = document.getElementById("paidToggle");

const invoiceNoText = document.getElementById("invoice-no");
const invoiceDateText = document.getElementById("invoice-date-text");
const customerNameText = document.getElementById("customer-name-text");
const customerPhoneText = document.getElementById("customer-phone-text");
const customerUniversityText = document.getElementById("customer-university-text");
const invoiceItemsBody = document.getElementById("invoice-items-body");
const paymentInfoLines = document.getElementById("payment-info-lines");
const totalPaymentText = document.getElementById("total-payment");
const paidStamp = document.getElementById("paid-stamp");
const invoiceElement = document.getElementById("invoice");
const previewScale = document.querySelector(".preview-scale");

document
  .getElementById("downloadUnpaidBtn")
  .addEventListener("click", () => downloadPDF("unpaid"));

document
  .getElementById("downloadPaidBtn")
  .addEventListener("click", () => downloadPDF("paid"));

addItemBtn.addEventListener("click", () => addItemRow());
paidToggle.addEventListener("change", renderAll);

[
  adminSelect,
  invoiceDateInput,
  customerOrderInput,
  customerNameInput,
  customerPhoneInput,
  customerUniversityInput
].forEach((el) => el.addEventListener("input", renderAll));

init();

function init() {
  populateAdminOptions();
  setDefaultDate();
  addItemRow({ itemId: "package-60", qty: 1 });
  renderAll();
}

function populateAdminOptions() {
  Object.keys(APP_CONFIG.admins).forEach((adminName) => {
    const option = document.createElement("option");
    option.value = adminName;
    option.textContent = adminName;
    adminSelect.appendChild(option);
  });

  adminSelect.value = "Reza";
}

function setDefaultDate() {
  const today = new Date();
  invoiceDateInput.value = today.toISOString().split("T")[0];
}

function addItemRow(defaults = {}) {
  const row = document.createElement("div");
  row.className = "item-row";

  row.innerHTML = `
    <div class="item-row-top">
      <div class="field-group">
        <label>Item</label>
        <select class="item-select"></select>
      </div>
      <button type="button" class="remove-item-btn">Hapus</button>
    </div>

    <div class="item-row-fields"></div>
  `;

  itemsContainer.appendChild(row);

  const itemSelect = row.querySelector(".item-select");
  APP_CONFIG.itemOptions.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    itemSelect.appendChild(option);
  });

  itemSelect.value = defaults.itemId || APP_CONFIG.itemOptions[0].id;

  itemSelect.addEventListener("change", () => {
    buildItemFields(row, itemSelect.value, {});
    renderAll();
  });

  row.querySelector(".remove-item-btn").addEventListener("click", () => {
    row.remove();
    renderAll();
  });

  buildItemFields(row, itemSelect.value, defaults);
  attachRowListeners(row);
  renderAll();
}

function buildItemFields(row, itemId, defaults = {}) {
  const itemConfig = APP_CONFIG.itemOptions.find((item) => item.id === itemId);
  const fieldsWrap = row.querySelector(".item-row-fields");

  if (itemConfig.type === "fixed_adjustment") {
    fieldsWrap.className = "item-row-fields adjustment";
    fieldsWrap.innerHTML = `
      <div class="field-group">
        <label>Amount</label>
        <input
          type="text"
          class="item-fixed-amount"
          value="-${formatRupiah(itemConfig.fixedAmount || 0)}"
          readonly
        />
      </div>
    `;
  } else if (itemConfig.type === "adjustment") {
    fieldsWrap.className = "item-row-fields adjustment";
    fieldsWrap.innerHTML = `
      <div class="field-group">
        <label>Amount</label>
        <input
          type="number"
          class="item-adjustment-amount"
          min="0"
          value="${defaults.amount || ""}"
          placeholder="25000"
        />
      </div>
    `;
  } else {
    fieldsWrap.className = "item-row-fields simple";
    fieldsWrap.innerHTML = `
      <div class="field-group">
        <label>Nama Item</label>
        <input
          type="text"
          class="item-name"
          value="${itemConfig.label}"
          readonly
        />
      </div>

      <div class="field-group qty-field">
        <label>Qty</label>
        <input
          type="number"
          class="item-qty"
          min="1"
          value="${defaults.qty || 1}"
        />
      </div>
    `;
  }

  attachRowListeners(row);
}

function attachRowListeners(row) {
  row.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", renderAll);
    el.addEventListener("change", renderAll);
  });
}

function getInvoiceNumber() {
  const dateValue = invoiceDateInput.value;
  const orderValue = String(customerOrderInput.value || "").trim();

  if (!dateValue || !orderValue) return "-";

  const date = new Date(dateValue);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `AC-${month}${year}${orderValue}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });
}

function formatRupiah(num) {
  return Number(num || 0).toLocaleString("id-ID");
}

function collectItems() {
  const rows = [...itemsContainer.querySelectorAll(".item-row")];

  return rows.map((row) => {
    const itemId = row.querySelector(".item-select").value;
    const itemConfig = APP_CONFIG.itemOptions.find((item) => item.id === itemId);

    if (itemConfig.type === "fixed_adjustment") {
      return {
        label: itemConfig.label,
        qty: "",
        price: "",
        amount: -Math.abs(itemConfig.fixedAmount || 0)
      };
    }

    if (itemConfig.type === "adjustment") {
      const rawAmount = Number(
        row.querySelector(".item-adjustment-amount")?.value || 0
      );

      return {
        label: itemConfig.label,
        qty: "",
        price: "",
        amount: -Math.abs(rawAmount)
      };
    }

    const qty = Number(row.querySelector(".item-qty")?.value || 0);
    const price = Number(itemConfig.defaultPrice || 0);
    const amount = qty * price;

    return {
      label: itemConfig.label,
      qty,
      price,
      amount
    };
  });
}

function renderItems(items) {
  invoiceItemsBody.innerHTML = "";

  items.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.label}</td>
      <td>${item.qty === "" ? "" : item.qty}</td>
      <td>${item.price === "" ? "" : formatRupiah(item.price)}</td>
      <td>${item.amount < 0 ? `- ${formatRupiah(Math.abs(item.amount))}` : formatRupiah(item.amount)}</td>
    `;

    invoiceItemsBody.appendChild(tr);
  });
}

function renderPaymentInfo() {
  const selectedAdmin = adminSelect.value;
  const adminData = APP_CONFIG.admins[selectedAdmin];
  const paymentInfo = adminData.paymentInfo;

  paymentInfoLines.innerHTML = "";

  if (paymentInfo.type === "qris_with_text") {
    const wrapper = document.createElement("div");
    wrapper.className = "payment-info-qris-layout";

    const qrisBlock = document.createElement("div");
    qrisBlock.className = "qris-block";

    const qrisImg = document.createElement("img");
    qrisImg.src = paymentInfo.qrisImage;
    qrisImg.alt = paymentInfo.qrisLabel || "QRIS";
    qrisImg.className = "qris-image";
    qrisImg.setAttribute("crossorigin", "anonymous");

    const qrisLabel = document.createElement("div");
    qrisLabel.className = "qris-label";
    qrisLabel.textContent = paymentInfo.qrisLabel || "QRIS";

    qrisBlock.appendChild(qrisImg);
    qrisBlock.appendChild(qrisLabel);

    const textBlock = document.createElement("div");
    textBlock.className = "payment-text-block";

    paymentInfo.lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      textBlock.appendChild(p);
    });

    wrapper.appendChild(qrisBlock);
    wrapper.appendChild(textBlock);

    paymentInfoLines.appendChild(wrapper);
    return;
  }

  paymentInfo.lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    paymentInfoLines.appendChild(p);
  });
}

function renderAll() {
  const invoiceNo = getInvoiceNumber();
  const items = collectItems();
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  invoiceNoPreview.value = invoiceNo;
  invoiceNoText.textContent = invoiceNo;
  invoiceDateText.textContent = formatDate(invoiceDateInput.value);

  customerNameText.textContent = customerNameInput.value || "-";
  customerPhoneText.textContent = customerPhoneInput.value || "-";
  customerUniversityText.textContent = customerUniversityInput.value || "-";

  renderItems(items);
  renderPaymentInfo();

  totalPaymentText.textContent = formatRupiah(total);

  if (paidToggle.checked) {
    paidStamp.classList.remove("hidden");
  } else {
    paidStamp.classList.add("hidden");
  }
}

async function downloadPDF(type) {
  try {
    if (type === "unpaid") {
      paidStamp.classList.add("hidden");
    } else {
      paidStamp.classList.remove("hidden");
    }

    const originalTransform = previewScale.style.transform;
    const originalWidth = previewScale.style.width;
    const originalHeight = previewScale.style.height;

    previewScale.style.transform = "none";
    previewScale.style.width = "1750px";
    previewScale.style.height = "2000px";

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(invoiceElement, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#f7f7f7"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.8);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [1750, 2000]
    });

    pdf.addImage(imgData, "JPEG", 0, 0, 1750, 2000, undefined, "FAST");

    const finalInvoiceNo = getInvoiceNumber() === "-" ? "invoice" : getInvoiceNumber();
    pdf.save(`${finalInvoiceNo}-${type}.pdf`);

    previewScale.style.transform = originalTransform;
    previewScale.style.width = originalWidth;
    previewScale.style.height = originalHeight;

    if (paidToggle.checked && type === "unpaid") {
      paidStamp.classList.remove("hidden");
    }
  } catch (error) {
    console.error(error);
    alert("Gagal generate PDF.");
  }
}