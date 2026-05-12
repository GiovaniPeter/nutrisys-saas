"use client";

export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <button className="text-button" type="button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
