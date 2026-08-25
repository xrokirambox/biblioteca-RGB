import React, { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Plus, Save, Trash2, Edit3, Loader2, Users as UsersIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ProfilePhotoUploader } from "./ProfilePhotoUploader";
import { toast } from "sonner";

const ROLES = [
  { id: "admin", label: "Administrador" },
  { id: "rector", label: "Rector" },
  { id: "docente", label: "Docente" },
];

const formatApiError = (detail, fallback) => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || "Datos inválidos").join(". ");
  return fallback;
};

const UserForm = ({ initial, onSubmit, onCancel, submitting, canChangeRole, isRector }) => {
  const [form, setForm] = useState(
    initial ? { email: initial.email, name: initial.name || "", role: initial.role, password: "" }
            : { email: "", name: "", role: isRector ? "docente" : "rector", password: "" }
  );
  useEffect(() => {
    if (initial) setForm({ email: initial.email, name: initial.name || "", role: initial.role, password: "" });
  }, [initial]);
  const isEdit = !!initial;
  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#020b04]/40 border border-[#c9a227]/15 rounded-lg mb-6"
      data-testid="user-form"
    >
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Correo *</label>
        <input data-testid="user-form-email" type="email" value={form.email} onChange={handle("email")} required disabled={isEdit}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] disabled:opacity-60" />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Nombre</label>
        <input data-testid="user-form-name" value={form.name} onChange={handle("name")}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">Rol</label>
        <select data-testid="user-form-role" value={form.role} onChange={handle("role")} disabled={isEdit && !canChangeRole}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] disabled:opacity-60">
          {ROLES.filter((r) => !isRector || r.id === "docente" || (isEdit && r.id === initial.role)).map((r) => <option key={r.id} value={r.id} className="bg-[#051a09]">{r.label}</option>)}
        </select>
        {isEdit && !canChangeRole && (
          <div className="font-dm-sans text-[10px] text-[#a3b3a6] mt-1">Solo admin puede cambiar roles</div>
        )}
      </div>
      <div>
        <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">
          {isEdit ? "Nueva contraseña (opcional)" : "Contraseña *"}
        </label>
        <input data-testid="user-form-password" type="password" value={form.password} onChange={handle("password")}
          required={!isEdit} minLength="12" placeholder={isEdit ? "Dejar vacío para no cambiar" : "Mínimo 12 caracteres"}
          className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white placeholder:text-[#a3b3a6]/50 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]" />
      </div>
      <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} data-testid="user-form-cancel"
            className="px-4 py-2.5 rounded-sm border border-[#a3b3a6]/40 text-[#a3b3a6] hover:border-[#a3b3a6] font-dm-sans text-xs tracking-widest uppercase">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting} data-testid="user-form-submit"
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-sm font-dm-sans text-xs tracking-widest uppercase disabled:opacity-60">
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Guardar
        </button>
      </div>
    </form>
  );
};

const RoleBadge = ({ role }) => {
  const isAdmin = role === "admin";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-dm-sans tracking-widest uppercase border ${
      isAdmin ? "border-[#c9a227]/60 text-[#c9a227] bg-[#c9a227]/10" : "border-[#a3b3a6]/40 text-[#a3b3a6]"
    }`}>
      {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
      {role}
    </span>
  );
};

export const UsersManager = () => {
  const { user, canChangeRoles, canDeleteUsers, isRector } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users`);
      setUsers(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo cargar usuarios");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (form) => {
    if (!form.email || !form.password) return toast.error("Correo y contraseña son obligatorios");
    if (form.password.length < 12) return toast.error("La contraseña debe tener al menos 12 caracteres");
    setBusy(true);
    try {
      const res = await api.post(`/users`, form);
      setUsers((u) => [...u, res.data]);
      toast.success("Usuario creado");
      setMode("list");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail, "No se pudo crear el usuario"));
    } finally { setBusy(false); }
  };

  const handleUpdate = async (form) => {
    setBusy(true);
    try {
      const payload = { name: form.name };
      if (canChangeRoles) payload.role = form.role;
      if (form.password) payload.password = form.password;
      const res = await api.put(`/users/${editing.id}`, payload);
      setUsers((u) => u.map((x) => (x.id === editing.id ? res.data : x)));
      toast.success("Usuario actualizado");
      setMode("list"); setEditing(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar");
    } finally { setBusy(false); }
  };

  const handleDelete = async (u) => {
    if (u.id === user?.id) return toast.error("No puedes eliminarte a ti mismo");
    if (!window.confirm(`¿Eliminar al usuario ${u.email}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setUsers((arr) => arr.filter((x) => x.id !== u.id));
      toast.success("Usuario eliminado");
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo eliminar");
    }
  };

  const handlePhotoUpdate = async (photoUrl) => {
    if (!editing) return;
    setBusy(true);
    try {
      const res = await api.put(`/users/${editing.id}`, { profile_photo_url: photoUrl });
      setUsers((u) => u.map((x) => (x.id === editing.id ? res.data : x)));
      setEditing(res.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo actualizar foto");
    } finally { setBusy(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="font-cinzel text-lg text-[#f4f1e1]">Usuarios del sistema</div>
          <div className="font-dm-sans text-[10px] tracking-[0.25em] uppercase text-[#a3b3a6]">{users.length} cuentas</div>
        </div>
        {mode === "list" && (
          <button onClick={() => setMode("create")} data-testid="users-create-btn"
            className="btn-gold w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 rounded-sm font-dm-sans text-xs tracking-widest uppercase">
            <Plus className="w-3.5 h-3.5" /> Nuevo usuario
          </button>
        )}
      </div>

      {mode === "create" && (
        <UserForm onSubmit={handleCreate} onCancel={() => setMode("list")} submitting={busy} canChangeRole={canChangeRoles} isRector={isRector} />
      )}
      {mode === "edit" && editing && (
        <>
          <UserForm initial={editing} onSubmit={handleUpdate} onCancel={() => { setMode("list"); setEditing(null); }}
            submitting={busy} canChangeRole={canChangeRoles} isRector={isRector} />
          <ProfilePhotoUploader user={editing} onPhotoUpdate={handlePhotoUpdate} uploading={busy} />
        </>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#c9a227]"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 font-cormorant text-xl text-[#a3b3a6]">No hay usuarios.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#c9a227]/15" data-testid="users-list">
          <table className="w-full text-sm font-dm-sans">
            <thead className="bg-[#020b04]/60 text-[#c9a227] uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-[#f4f1e1]">
              {users.map((u) => (
                <tr key={u.id} data-testid={`user-row-${u.id}`} className="border-t border-[#c9a227]/10 hover:bg-[#c9a227]/5">
                  <td className="px-4 py-3">
                    {u.email}
                    {u.id === user?.id && <span className="ml-2 text-[10px] tracking-widest uppercase text-[#c9a227]">(tú)</span>}
                  </td>
                  <td className="px-4 py-3 text-[#a3b3a6]">{u.name || "—"}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-[#a3b3a6] text-xs">{(u.created_at || "").slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {(user?.id === u.id || !isRector || u.role === "docente") && <button onClick={() => { setEditing(u); setMode("edit"); }} data-testid={`user-edit-${u.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#c9a227]/50 text-[#c9a227] hover:bg-[#c9a227]/10 text-[10px] tracking-widest uppercase">
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>}
                      {canDeleteUsers && u.id !== user?.id && (
                        <button onClick={() => handleDelete(u)} data-testid={`user-delete-${u.id}`}
                          className="p-2 rounded-sm border border-red-900/50 text-red-400/80 hover:bg-red-950/50" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
