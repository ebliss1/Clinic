const catalog = [
  {brand:"Dolo 650", molecule:"Paracetamol", strength:"650 mg", form:"Tablet"},
  {brand:"Crocin", molecule:"Paracetamol", strength:"500 mg", form:"Tablet"},
  {brand:"Calpol", molecule:"Paracetamol", strength:"250 mg", form:"Suspension"},
  {brand:"Paracetamol IP", molecule:"Paracetamol", strength:"500 mg", form:"Tablet"},
  {brand:"Ibuprofen (sample)", molecule:"Ibuprofen", strength:"200 mg", form:"Tablet"},
  {brand:"Cetirizine (sample)", molecule:"Cetirizine", strength:"10 mg", form:"Tablet"}
];
let selected = [{...catalog[0], dosage:"1-0-1", duration:"3 Days"}];

const $ = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

function renderCatalog() {
  const q = $("medicineSearch").value.trim().toLowerCase();
  const items = catalog.filter(m => `${m.brand} ${m.molecule} ${m.strength} ${m.form}`.toLowerCase().includes(q));
  $("medicineCatalog").innerHTML = items.map(m => `<tr>
    <td><strong>${escapeHtml(m.brand)}</strong></td><td>${escapeHtml(m.molecule)}</td>
    <td>${escapeHtml(m.strength)}</td><td>${escapeHtml(m.form)}</td>
    <td class="add-cell"><button class="btn blue" data-add="${escapeHtml(m.brand)}">Add</button></td>
  </tr>`).join("") || `<tr><td colspan="5">No sample medicine found. Use “Add Custom Medicine”.</td></tr>`;
}
function renderSelected() {
  $("selectedMedicines").innerHTML = selected.map((m,i) => `<tr>
    <td>${i+1}</td><td>${escapeHtml(m.brand)}</td><td>${escapeHtml(m.molecule)}</td><td>${escapeHtml(m.strength)}</td>
    <td><input aria-label="Dosage for ${escapeHtml(m.brand)}" data-dose="${i}" value="${escapeHtml(m.dosage)}" class="inline-edit"></td>
    <td><input aria-label="Duration for ${escapeHtml(m.brand)}" data-duration="${i}" value="${escapeHtml(m.duration)}" class="inline-edit duration-edit"></td>
    <td><button class="remove-btn" data-remove="${i}" aria-label="Remove ${escapeHtml(m.brand)}">✖</button></td>
  </tr>`).join("") || `<tr><td colspan="7">No medicines selected yet.</td></tr>`;
  renderPaper();
}
function renderPaper() {
  $("paperMedicineRows").innerHTML = selected.map((m,i) => `<tr><td>${i+1}</td><td>${escapeHtml(m.brand)}</td><td>${escapeHtml(m.molecule)}</td><td>${escapeHtml(m.strength)}</td><td>${escapeHtml(m.dosage)}</td><td>${escapeHtml(m.duration)}</td></tr>`).join("") || `<tr><td colspan="6">No medicines selected</td></tr>`;
  const lines = $("notes").value.split(/\n|(?<=\.)\s+/).map(s=>s.trim()).filter(Boolean);
  $("paperInstructions").innerHTML = lines.map(line=>`<li>${escapeHtml(line)}</li>`).join("");
}
function addMedicine(brand) {
  const m = catalog.find(item => item.brand === brand);
  if (!m) return;
  if (selected.some(item => item.brand === brand)) {
    $("saveMessage").textContent = "That medicine is already selected.";
    return;
  }
  selected.push({...m, dosage:"1-0-1", duration:"3 Days"});
  renderSelected();
  $("saveMessage").textContent = "";
}
$("medicineSearch").addEventListener("input", renderCatalog);
$("medicineCatalog").addEventListener("click", e => {
  const button = e.target.closest("[data-add]");
  if (button) addMedicine(button.dataset.add);
});
$("selectedMedicines").addEventListener("click", e => {
  const button = e.target.closest("[data-remove]");
  if (button) { selected.splice(Number(button.dataset.remove),1); renderSelected(); }
});
$("selectedMedicines").addEventListener("input", e => {
  if (e.target.dataset.dose !== undefined) selected[Number(e.target.dataset.dose)].dosage = e.target.value;
  if (e.target.dataset.duration !== undefined) selected[Number(e.target.dataset.duration)].duration = e.target.value;
  renderPaper();
});
$("notes").addEventListener("input", renderPaper);
$("addCustom").addEventListener("click", () => {
  const brand = prompt("Enter sample brand / medicine name:");
  if (!brand || !brand.trim()) return;
  const molecule = prompt("Enter molecule / generic name (doctor to verify):");
  if (!molecule || !molecule.trim()) return;
  const strength = prompt("Enter strength and unit, e.g. 500 mg:");
  if (!strength || !strength.trim()) return;
  const form = prompt("Enter dosage form, e.g. Tablet / Capsule / Syrup:", "Tablet") || "Tablet";
  const m = {brand:brand.trim(), molecule:molecule.trim(), strength:strength.trim(), form:form.trim()};
  catalog.unshift(m);
  $("medicineSearch").value = brand.trim();
  renderCatalog();
});
$("saveBtn").addEventListener("click", () => {
  $("saveMessage").textContent = "Demo saved in this page session only; no database is connected.";
});
$("printBtn").addEventListener("click", () => {
  renderPaper();
  window.print();
});
$("viewHistory").addEventListener("click", () => alert("Demo only: patient visit history can be added after requirements are confirmed."));
$("patientSearch").addEventListener("change", () => {
  const q = $("patientSearch").value.trim();
  if (q && !/ramesh|ebt0001|9840561234/i.test(q)) alert("This prototype contains only one fictional sample patient: S. Ramesh.");
});
document.querySelectorAll(".tabs button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("selected"));
  button.classList.add("selected");
  ["consultationPanel","prescriptionPanel","billingPanel"].forEach(id => $(id).hidden = id !== button.dataset.panel);
}));
document.querySelectorAll("nav a[data-tab]").forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  document.querySelectorAll("nav a").forEach(a=>a.classList.remove("active"));
  link.classList.add("active");
  if (link.dataset.tab === "Prescriptions") document.querySelector('[data-panel="prescriptionPanel"]').click();
  else if (link.dataset.tab === "Consultation") document.querySelector('[data-panel="consultationPanel"]').click();
  else if (link.dataset.tab === "Billing") document.querySelector('[data-panel="billingPanel"]').click();
  else if (link.dataset.tab !== "Patient Registration") alert(`${link.dataset.tab} is a visual demo menu item; this module is not connected yet.`);
}));
function setDate() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB").replaceAll("/","-");
  const time = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
  $("currentDate").textContent = `${date}   ${time}`;
  $("paperDate").textContent = date;
  $("printedDate").textContent = `${date} ${time}`;
}
setDate();
renderCatalog();
renderSelected();
