import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Compass,
  CalendarDays,
  Clock,
  Users,
  Loader2,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ============================================================
// CONFIGURACIÓN GENERAL — editá estos valores a gusto
// ============================================================
const NOMBRE_INSTITUTO = "Brújula Educativa";
// Número de WhatsApp de administración, con código de país, SIN "+" ni espacios.
// Ejemplo Argentina: 54 9 11 1234-5678 -> "5491112345678"
const NUMERO_WHATSAPP = "5492804646665";

const HORA_APERTURA = 8; // 08:00
const HORA_CIERRE = 22; // 22:00 (última reserva de profesional termina a esta hora)

const AULAS = [
  { id: "norte", nombre: "Norte", capacidad: "3 personas" },
  { id: "sur", nombre: "Sur", capacidad: "4 personas" },
  { id: "este", nombre: "Este", capacidad: "4 personas" },
  { id: "oeste", nombre: "Oeste", capacidad: "6 personas" },
  { id: "sum", nombre: "S.U.M.", capacidad: "8 o más personas" },
];

const ROLES = [
  { id: "profesor", label: "Profesor", detalle: "Bloques de 1 hora" },
  { id: "profesional", label: "Profesional", detalle: "Bloques de 3 horas" },
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ============================================================
// HELPERS DE FECHA / HORA
// ============================================================
function inicioDelDia(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatoISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function formatoLegible(d) {
  const texto = d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatoHora(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function mismoDia(a, b) {
  return a && b && formatoISO(a) === formatoISO(b);
}

// ============================================================
// COMPONENTE: Mini calendario visual (sin librerías externas)
// ============================================================
function MiniCalendario({ fechaSeleccionada, onSeleccionar }) {
  const hoy = inicioDelDia(new Date());
  const [mesVisible, setMesVisible] = useState(
    new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1)
  );

  const celdas = useMemo(() => {
    const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    // Lunes = 0 ... Domingo = 6
    const offset = (primerDiaMes.getDay() + 6) % 7;
    const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();

    const lista = [];
    for (let i = 0; i < offset; i++) lista.push(null);
    for (let dia = 1; dia <= diasEnMes; dia++) {
      lista.push(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia));
    }
    return lista;
  }, [mesVisible]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-parchment text-ink-soft"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display font-semibold text-ink">
          {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-parchment text-ink-soft"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-ink-soft py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, idx) => {
          if (!dia) return <div key={`vacio-${idx}`} />;
          const esPasado = dia < hoy;
          const esSeleccionado = mismoDia(dia, fechaSeleccionada);
          const esHoy = mismoDia(dia, hoy);

          return (
            <button
              type="button"
              key={formatoISO(dia)}
              disabled={esPasado}
              onClick={() => onSeleccionar(dia)}
              className={[
                "aspect-square rounded-lg text-sm font-medium transition-colors",
                esPasado
                  ? "text-line cursor-not-allowed"
                  : esSeleccionado
                  ? "bg-ink text-parchment"
                  : esHoy
                  ? "border border-brass text-ink hover:bg-parchment"
                  : "text-ink hover:bg-parchment",
              ].join(" ")}
            >
              {dia.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: Selector de aula, en lista
// ============================================================
function SelectorAulas({ aulaId, onSeleccionar }) {
  return (
    <div className="flex flex-col gap-2 max-w-sm mx-auto">
      {AULAS.map((aula) => {
        const activa = aulaId === aula.id;
        return (
          <button
            type="button"
            key={aula.id}
            onClick={() => onSeleccionar(aula.id)}
            className={[
              "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
              activa
                ? "border-brass bg-ink text-parchment"
                : "border-line bg-surface text-ink hover:border-brass",
            ].join(" ")}
          >
            <span className="font-display font-semibold">{aula.nombre}</span>
            <span className={`text-xs flex items-center gap-1 ${activa ? "text-parchment/80" : "text-ink-soft"}`}>
              <Users size={12} /> {aula.capacidad}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// COMPONENTE: Comprobante final, listo para captura de pantalla
// ============================================================
function Comprobante({ datos, onNuevaReserva }) {
  const mensaje =
    `Hola! Envío el comprobante de reserva de aula.\n\n` +
    `Instituto: ${NOMBRE_INSTITUTO}\n` +
    `Código: ${datos.codigo}\n` +
    `Nombre: ${datos.nombre}\n` +
    `Rol: ${datos.rol === "profesor" ? "Profesor" : "Profesional"}\n` +
    `Aula: ${datos.aulaNombre}\n` +
    `Fecha: ${datos.fechaLegible}\n` +
    `Horario: ${formatoHora(datos.horaInicio)} a ${formatoHora(datos.horaFin)}`;

  const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-moss mb-3" size={40} />
        <p className="font-display text-xl font-semibold text-ink mb-1">{NOMBRE_INSTITUTO}</p>
        <p className="text-ink-soft text-sm mb-6">Comprobante de reserva</p>

        <div className="text-left space-y-3 border-t border-b border-line py-5 mb-5">
          <FilaComprobante etiqueta="Reservado por" valor={datos.nombre} />
          <FilaComprobante etiqueta="Rol" valor={datos.rol === "profesor" ? "Profesor" : "Profesional"} />
          <FilaComprobante etiqueta="Aula" valor={datos.aulaNombre} />
          <FilaComprobante etiqueta="Fecha" valor={datos.fechaLegible} />
          <FilaComprobante
            etiqueta="Horario"
            valor={`${formatoHora(datos.horaInicio)} a ${formatoHora(datos.horaFin)}`}
          />
        </div>

        <p className="font-mono text-lg tracking-wide text-brass-dark mb-6">{datos.codigo}</p>

        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-moss text-white font-medium py-3 hover:opacity-90 transition-opacity mb-3"
        >
          <MessageCircle size={18} />
          Enviar comprobante por WhatsApp a Administración
        </a>

        <button
          type="button"
          onClick={onNuevaReserva}
          className="text-sm text-ink-soft hover:text-ink underline underline-offset-2"
        >
          Hacer otra reserva
        </button>
      </div>
    </div>
  );
}

function FilaComprobante({ etiqueta, valor }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-soft">{etiqueta}</span>
      <span className="font-medium text-ink text-right">{valor}</span>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState(null);
  const [fecha, setFecha] = useState(inicioDelDia(new Date()));
  const [aulaId, setAulaId] = useState(null);
  const [slotElegido, setSlotElegido] = useState(null); // { inicio, fin }
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [comprobante, setComprobante] = useState(null);

  const fechaISO = formatoISO(fecha);

  // Escuchamos en tiempo real las reservas del aula + fecha elegidas
  useEffect(() => {
    if (!aulaId) {
      setReservasDelDia([]);
      return;
    }
    const q = query(
      collection(db, "reservas"),
      where("aula", "==", aulaId),
      where("fecha", "==", fechaISO)
    );
    const unsub = onSnapshot(q, (snap) => {
      setReservasDelDia(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [aulaId, fechaISO]);

  // Cada vez que cambia aula, fecha o rol, se pierde el horario elegido
  useEffect(() => {
    setSlotElegido(null);
  }, [aulaId, fechaISO, rol]);

  const horasOcupadas = useMemo(() => {
    const set = new Set();
    reservasDelDia.forEach((r) => {
      for (let h = r.horaInicio; h < r.horaFin; h++) set.add(h);
    });
    return set;
  }, [reservasDelDia]);

  const slotsDisponibles = useMemo(() => {
    if (!rol) return [];
    if (rol === "profesor") {
      const lista = [];
      for (let h = HORA_APERTURA; h < HORA_CIERRE; h++) {
        if (!horasOcupadas.has(h)) lista.push({ inicio: h, fin: h + 1 });
      }
      return lista;
    }
    // profesional: bloques de 3 horas continuas
    const lista = [];
    for (let h = HORA_APERTURA; h + 3 <= HORA_CIERRE; h++) {
      const libre = [h, h + 1, h + 2].every((x) => !horasOcupadas.has(x));
      if (libre) lista.push({ inicio: h, fin: h + 3 });
    }
    return lista;
  }, [rol, horasOcupadas]);

  const listoParaConfirmar =
    nombre.trim().length > 0 && rol && aulaId && slotElegido && !enviando;

  async function confirmarReserva() {
    setError("");
    if (!listoParaConfirmar) return;

    // Chequeo de colisión de último momento contra los datos en vivo
    const colision = reservasDelDia.some(
      (r) => r.horaInicio < slotElegido.fin && r.horaFin > slotElegido.inicio
    );
    if (colision) {
      setError("Ese horario se acaba de ocupar. Elegí otro, por favor.");
      return;
    }

    setEnviando(true);
    try {
      const aula = AULAS.find((a) => a.id === aulaId);
      const codigo = `#BE-${Math.floor(1000 + Math.random() * 9000)}`;
      const datos = {
        aula: aulaId,
        aulaNombre: aula.nombre,
        fecha: fechaISO,
        fechaLegible: formatoLegible(fecha),
        horaInicio: slotElegido.inicio,
        horaFin: slotElegido.fin,
        nombre: nombre.trim(),
        rol,
        codigo,
      };

      await addDoc(collection(db, "reservas"), {
        ...datos,
        creadoEn: serverTimestamp(),
      });

      setComprobante(datos);
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar la reserva. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function nuevaReserva() {
    setComprobante(null);
    setNombre("");
    setRol(null);
    setAulaId(null);
    setSlotElegido(null);
    setError("");
  }

  if (comprobante) {
    return (
      <div className="min-h-screen py-10 px-4">
        <Comprobante datos={comprobante} onNuevaReserva={nuevaReserva} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-3 mb-8">
          <Compass className="text-brass compass-idle" size={30} strokeWidth={1.75} />
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink leading-tight">
              {NOMBRE_INSTITUTO}
            </h1>
            <p className="text-ink-soft text-sm">Reservá tu aula en un minuto, sin registrarte</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* 1. Nombre */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <label className="block text-sm font-medium text-ink mb-2" htmlFor="nombre">
              Nombre y apellido
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Marina Torres"
              className="w-full rounded-xl border border-line bg-parchment/40 px-4 py-2.5 text-ink placeholder:text-ink-soft/60 focus:bg-white"
            />
          </section>

          {/* 2. Rol */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-2">Rol</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRol(r.id)}
                  className={[
                    "rounded-xl border px-4 py-3 text-left transition-colors",
                    rol === r.id
                      ? "border-brass bg-ink text-parchment"
                      : "border-line hover:border-brass text-ink",
                  ].join(" ")}
                >
                  <p className="font-medium">{r.label}</p>
                  <p className={`text-xs ${rol === r.id ? "text-parchment/80" : "text-ink-soft"}`}>
                    {r.detalle}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* 3. Fecha */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-2 flex items-center gap-1.5">
              <CalendarDays size={15} /> Fecha
            </p>
            <MiniCalendario fechaSeleccionada={fecha} onSeleccionar={setFecha} />
          </section>

          {/* 4. Aula */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-3 text-center">Aula</p>
            <SelectorAulas aulaId={aulaId} onSeleccionar={setAulaId} />
          </section>

          {/* 5. Horarios disponibles */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm font-medium text-ink mb-3 flex items-center gap-1.5">
              <Clock size={15} /> Horarios disponibles
            </p>

            {!rol || !aulaId ? (
              <p className="text-sm text-ink-soft">Elegí un rol y un aula para ver los horarios libres.</p>
            ) : slotsDisponibles.length === 0 ? (
              <p className="text-sm text-needle">No quedan horarios libres para esa combinación. Probá otra fecha o aula.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slotsDisponibles.map((slot) => {
                  const activo = slotElegido && slotElegido.inicio === slot.inicio;
                  return (
                    <button
                      type="button"
                      key={slot.inicio}
                      onClick={() => setSlotElegido(slot)}
                      className={[
                        "rounded-lg border px-2 py-2 text-xs sm:text-sm font-medium transition-colors",
                        activo
                          ? "border-brass bg-brass text-white"
                          : "border-line text-ink hover:border-brass",
                      ].join(" ")}
                    >
                      {formatoHora(slot.inicio)}–{formatoHora(slot.fin)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {error && (
            <p className="text-sm text-needle bg-needle/10 border border-needle/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* 6. Confirmar */}
          <button
            type="button"
            disabled={!listoParaConfirmar}
            onClick={confirmarReserva}
            className={[
              "w-full rounded-xl py-3.5 font-medium text-base flex items-center justify-center gap-2 transition-opacity",
              listoParaConfirmar
                ? "bg-ink text-parchment hover:opacity-90"
                : "bg-line text-ink-soft cursor-not-allowed",
            ].join(" ")}
          >
            {enviando && <Loader2 className="animate-spin" size={18} />}
            {enviando ? "Guardando reserva…" : "Confirmar reserva"}
          </button>

          <p className="text-center text-xs text-ink-soft pb-4">
            ¿Sos parte de administración?{" "}
            <a href="/admin" className="underline hover:text-ink">
              Ingresar al panel
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
