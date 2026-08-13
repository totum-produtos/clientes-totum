"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { CenarioProjecao } from "@/lib/planejamento/schema";

const CENARIO_COLOR: Record<string, string> = {
  conservador: "#9ca3af",
  realista: "#077ac7",
  agressivo: "#da2128",
};

export function ProjecaoChart({ cenarios }: { cenarios: CenarioProjecao[] }) {
  if (cenarios.length === 0) return null;

  const meses = cenarios[0]?.meses.map((m) => m.mes) || [];
  const data = meses.map((mes, i) => {
    const row: Record<string, string | number> = { mes };
    for (const cenario of cenarios) {
      row[cenario.nome] = cenario.meses[i]?.valor ?? 0;
    }
    return row;
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f192a" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {cenarios.map((cenario) => (
            <Line
              key={cenario.nome}
              type="monotone"
              dataKey={cenario.nome}
              stroke={CENARIO_COLOR[cenario.nome] || "#da2128"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
