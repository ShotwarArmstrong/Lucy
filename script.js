// Baby Lucy — script mínimo
// Este archivo no recolecta datos.
// No ejecuta tracking.
// No modifica comportamiento del usuario.

// Verificación de carga del mapa cognitivo
document.addEventListener("DOMContentLoaded", () => {
  const img = document.querySelector("img");

  if (!img || !img.complete) {
    console.warn("Mapa cognitivo no cargado.");
  }
});

// Bloqueo de edición accidental del meta-prompt
const prompts = document.querySelectorAll("pre");
prompts.forEach(p => {
  p.setAttribute("contenteditable", "false");
  p.setAttribute("spellcheck", "false");
});

// Señal silenciosa de integridad
console.info("Baby Lucy activa.");