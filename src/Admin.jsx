import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { Compass, Lock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// ============================================================
// PIN de acceso al panel. Es solo una traba de interfaz: no es
// una autenticación real de Firebase. Ver README.md, sección
// "Sobre la seguridad del panel de administración".
// ============================================================
const ADMIN_PIN = "1234";

const HORA_APERTURA = 8;
const HORA_CIERRE = 22;

const AULAS = [
  { id: "norte", nombre: "Norte" },
  { id: "sur", nombre: "Sur" },
  { id: "este", nombre: "Este" },
  { id: "oeste", nombre: "Oeste" },
  { id: "sum", nombre: "S.U.M." },
];

function formatoISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function formatoLegibleCorto(d) {
  const texto = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatoHora(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function PantallaPin({ onIngresar }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function intentar(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onIngresar();
    } else {
      setError("PIN incorrecto.");
      setPin("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={intentar} className="w-full max-w-xs rounded-2xl border border-line bg-surface p-6 text-center">
        <Lock className="mx-auto text-brass mb-3" size={28} />
        <p className="font-display text-lg font-semibold text-ink mb-1">Panel de administración</p>
        <p className="text-ink-soft text-sm mb-5">Brújula Educativa</p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          autoFocus
          className="w-full text-center tracking-widest rounded-xl border border-line px-4 py-2.5 mb-3 focus:bg-parchment/40"
        />
        {error && <p className="text-needle text-sm mb-3">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-ink text-parchment font-medium py-2.5 hover:opacity-90">
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [reservas, setReservas] = useState([]);

  const fechaISO = formatoISO(fecha);

  useEffect(() => {
    if (!autenticado) return;
    const q = query(collection(db, "reservas"), where("fecha", "==", fechaISO));
    const unsub = onSnapshot(q, (snap) => {
      setReservas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [autenticado, fechaISO]);

  const horas = useMemo(() => {
    const lista = [];
    for (let h = HORA_APERTURA; h < HORA_CIERRE; h++) lista.push(h);
    return lista;
  }, []);

  function reservaEnCelda(aulaId, hora) {
    return reservas.find((r) => r.aula === aulaId && hora >= r.horaInicio && hora < r.horaFin);
  }

  async function liberarReserva(id) {
    if (!window.confirm("¿Liberar este turno? Esta acción no se puede deshacer.")) return;
    await deleteDoc(doc(db, "reservas", id));
  }

  if (!autenticado) return <PantallaPin onIngresar={() => setAutenticado(true)} />;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <Compass className="text-brass" size={26} strokeWidth={1.75} />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">Panel de administración</h1>
            <p className="text-ink-soft text-sm">Se actualiza en tiempo real</p>
          </div>
        </header>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            className="p-2 rounded-lg border border-line hover:bg-surface"
            onClick={() => setFecha(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-display font-semibold text-ink">{formatoLegibleCorto(fecha)}</p>
            <input
              type="date"
              value={fechaISO}
              onChange={(e) => setFecha(new Date(e.target.value + "T00:00:00"))}
              className="text-xs text-ink-soft border-none bg-transparent"
            />
          </div>
          <button
            className="p-2 rounded-lg border border-line hover:bg-surface"
            onClick={() => setFecha(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-surface text-left text-ink-soft font-medium p-3 border-b border-line">
                  Hora
                </th>
                {AULAS.map((a) => (
                  <th key={a.id} className="text-center text-ink font-display font-semibold p-3 border-b border-line">
                    {a.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((h) => (
                <tr key={h} className="border-b border-line last:border-b-0">
                  <td className="sticky left-0 bg-surface p-3 font-mono text-ink-soft">{formatoHora(h)}</td>
                  {AULAS.map((a) => {
                    const r = reservaEnCelda(a.id, h);
                    return (
                      <td key={a.id} className="p-2 text-center align-middle">
                        {r ? (
                          <div className="rounded-lg bg-ink text-parchment px-2 py-1.5 flex flex-col gap-1">
                            <span className="text-xs font-medium truncate">{r.nombre}</span>
                            <span className="text-[10px] text-parchment/70 capitalize">{r.rol}</span>
                            <button
                              onClick={() => liberarReserva(r.id)}
                              className="mx-auto mt-0.5 text-parchment/80 hover:text-needle"
                              title="Liberar turno"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-line">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-ink-soft mt-6">
          <a href="/" className="underline hover:text-ink">
            Volver a la pantalla de reserva
          </a>
        </p>
      </div>
    </div>
  );
}
