"use client";

import React from "react";

export function PrintPatientButton({ patient }: { patient: any }) {
  function printPatientRecord() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const escapeHtml = (unsafe: string) => (unsafe || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    const formatDate = (date: any) => {
      if (!date) return "--";
      return new Date(date).toLocaleDateString("pt-BR");
    };

    const latestRecord = patient.bodyRecords?.[0];

    const appointmentsHtml = patient.appointments && patient.appointments.length > 0 
      ? `<table>
          <thead><tr><th>Data/Hora</th><th>Tipo</th><th>Status</th></tr></thead>
          <tbody>
            ${patient.appointments.map((appt: any) => `
              <tr>
                <td>${new Date(appt.startsAt).toLocaleString("pt-BR")}</td>
                <td>${escapeHtml(appt.type)}</td>
                <td>${escapeHtml(appt.status)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      : "<p>Nenhuma consulta encontrada.</p>";

    const mealPlansHtml = patient.mealPlans && patient.mealPlans.length > 0
      ? `<table>
          <thead><tr><th>Nome do Plano</th><th>Data de Criação</th><th>Calorias (meta)</th></tr></thead>
          <tbody>
            ${patient.mealPlans.map((plan: any) => `
              <tr>
                <td>${escapeHtml(plan.name)}</td>
                <td>${formatDate(plan.createdAt)}</td>
                <td>${plan.targetCalories ? plan.targetCalories + " kcal" : "--"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      : "<p>Nenhum plano alimentar prescrito.</p>";

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Prontuário - ${escapeHtml(patient.name)}</title>
          <style>
            body { color: #1e293b; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; padding: 32px; max-width: 800px; margin: 0 auto; }
            h1 { color: #0284c7; font-size: 24px; margin: 0 0 8px; border-bottom: 2px solid #e0f2fe; padding-bottom: 12px; }
            h2 { color: #0369a1; font-size: 16px; margin: 24px 0 12px; border-bottom: 1px solid #e0f2fe; padding-bottom: 6px; }
            p { margin: 6px 0; }
            .grid { display: flex; gap: 16px; margin-bottom: 24px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; background: #f8fafc; flex: 1; }
            .card strong { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: bold; color: #475569; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>Prontuário do Paciente</h1>
          
          <div class="grid">
            <div class="card">
              <strong>Dados Pessoais</strong>
              <p>Nome: ${escapeHtml(patient.name)}</p>
              <p>Email: ${escapeHtml(patient.email || "Não informado")}</p>
              <p>Telefone: ${escapeHtml(patient.phone || "Não informado")}</p>
              <p>Objetivo: ${escapeHtml(patient.goal || "Não informado")}</p>
            </div>
            ${latestRecord ? `
            <div class="card">
              <strong>Última Avaliação</strong>
              <p>Data: ${formatDate(latestRecord.date)}</p>
              <p>Peso: ${latestRecord.weight ? latestRecord.weight + " kg" : "--"}</p>
              <p>Altura: ${latestRecord.height ? latestRecord.height + " cm" : "--"}</p>
            </div>
            ` : ""}
          </div>

          <h2>Próximas Consultas</h2>
          ${appointmentsHtml}

          <h2>Planos Alimentares</h2>
          ${mealPlansHtml}

          <p style="color:#94a3b8;font-size:10px;margin-top:48px;text-align:center;">
            Gerado pelo ClinOS - Sistema Operacional de Clínicas
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    window.setTimeout(() => printWindow.print(), 400);
  }

  return (
    <button className="text-button" type="button" onClick={printPatientRecord}>
      Imprimir Resumo
    </button>
  );
}
