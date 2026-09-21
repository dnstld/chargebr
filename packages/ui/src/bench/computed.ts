// Normaliza uma cor pelo próprio navegador, para comparar com valor computado
// sem depender de conversão própria. Serve a qualquer história que precise
// afirmar que a cor resolvida é a de um token no tema corrente.
export function resolveColor(value: string): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}
