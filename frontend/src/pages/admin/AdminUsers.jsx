import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { api, STORAGE_BASE_URL } from "../../lib/api";
import { getSpesialisasiLabel } from "../../lib/constants";

const AdminUsers = () => {
  const { user: me, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 6;
  const [suspendModal, setSuspendModal] = useState({
    isOpen: false,
    user: null,
    reason: "",
    isSubmitting: false,
  });
  const [unsuspendModal, setUnsuspendModal] = useState({
    isOpen: false,
    user: null,
    isSubmitting: false,
  });
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const [notifData, setNotifData] = useState({
    pendingCount: 0,
    pendingPsikolog: [],
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data.users || []);
        setNotifData({
          pendingCount: res.data.pendingCount || 0,
          pendingPsikolog: res.data.pendingPsikolog || [],
        });
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  const handleSuspend = async (id, name, isSuspended) => {
    if (!isSuspended) {
      setSuspendModal({
        isOpen: true,
        user: { id, name },
        reason: "",
        isSubmitting: false,
      });
    } else {
      setUnsuspendModal({
        isOpen: true,
        user: { id, name },
        isSubmitting: false,
      });
    }
  };

  const confirmUnsuspend = async () => {
    const { user } = unsuspendModal;
    setUnsuspendModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await api.post(`/admin/user/${user.id}/suspend`, { action: "unsuspend" });
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, is_suspended: false, suspended_reason: null }
            : u,
        ),
      );
      setUnsuspendModal({ isOpen: false, user: null, isSubmitting: false });
    } catch (e) {
      alert(e.response?.data?.message || "Failed to unsuspend");
      setUnsuspendModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const confirmSuspend = async () => {
    const { user, reason } = suspendModal;
    const cleanReason = reason.trim();
    if (!cleanReason) {
      alert("Alasan wajib diisi untuk menangguhkan akun.");
      return;
    }

    setSuspendModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await api.post(`/admin/user/${user.id}/suspend`, {
        action: "suspend",
        reason: cleanReason,
      });
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, is_suspended: true, suspended_reason: cleanReason }
            : u,
        ),
      );
      setSuspendModal({
        isOpen: false,
        user: null,
        reason: "",
        isSubmitting: false,
      });
    } catch (e) {
      alert(e.response?.data?.message || "Failed to suspend");
      setSuspendModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Skeleton handler handles loading state below

  // Filter users dynamically
  const filteredUsers = users.filter((u) => {
    const searchMatch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const params = new URLSearchParams(location.search);
    return searchMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Derived statistics
  const totalActive = users.filter(
    (u) => !u.is_suspended && !u.is_admin && u.role !== "psikolog",
  ).length;
  const totalPsikolog = users.filter((u) => u.role === "psikolog").length;
  const totalSuspended = users.filter((u) => u.is_suspended).length;

  return (
    <div
      className="bg-background text-on-background selection:bg-primary-container h-screen w-full flex overflow-hidden font-plus-jakarta"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                .font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>

      {/* SideNavBar */}
      <aside className="h-screen w-64 docked left-0 flex flex-col h-full border-r border-teal-100/10 bg-teal-50 dark:bg-slate-950 font-plus-jakarta text-base shrink-0">
        <div className="px-6 py-8">
          <h1 className="text-lg font-black text-teal-900 dark:text-teal-50">
            The Sanctuary
          </h1>
          <p className="text-xs text-teal-700/60 dark:text-teal-300/40 uppercase tracking-widest mt-1">
            Admin Console
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-[#A46477] font-bold border-r-4 border-[#A46477] bg-teal-100/20 active:translate-x-1 duration-150 rounded-l-lg group"
          >
            <span className="material-symbols-outlined">groups</span>
            <span>Kelola Pengguna</span>
          </Link>
          <Link
            to="/admin/verifications"
            className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">verified_user</span>
            <span>Verifikasi</span>
          </Link>
          <Link
            to="/admin/appeals"
            className="flex items-center gap-3 px-4 py-3 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 dark:hover:bg-teal-800/20 transition-all rounded-lg group"
          >
            <span className="material-symbols-outlined">mail</span>
            <span>Kotak Surat Banding</span>
          </Link>
        </nav>
        <div className="px-4 py-6 border-t border-teal-100/10">
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-[#A46477] text-white py-3 rounded-full font-bold text-sm mb-6 shadow-lg shadow-[#A46477]/20 active:scale-95 transition-transform"
          >
            Kembali ke Aplikasi
          </button>
          <div className="space-y-1">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-teal-700/60 dark:text-teal-300/40 hover:bg-teal-100/40 transition-all rounded-lg text-sm"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-x-hidden overflow-y-auto">
        {/* Organic Background Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl -z-10"></div>

        {/* TopNavBar */}
        <header className="w-full docked top-0 flex justify-between items-center px-8 py-3 bg-teal-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-teal-100/20 sticky z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600/70 text-sm">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-teal-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-teal-600/50"
                placeholder="Cari nama, email..."
                type="text"
              />
            </div>
            </div>
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 rounded-full hover:bg-teal-100/50 text-teal-700 dark:text-teal-300 transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {notifData?.pendingCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-50 dark:border-slate-900"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-teal-50 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-teal-900 dark:text-teal-100">Notifikasi</h3>
                    {notifData?.pendingCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{notifData.pendingCount} Baru</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {!notifData || notifData.pendingCount === 0 || !notifData.pendingPsikolog ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        Tidak ada notifikasi baru
                      </div>
                    ) : (
                      notifData.pendingPsikolog.slice(0, 5).map(p => (
                        <div key={p.id} onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-3 border-b last:border-0 border-teal-50 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{p.name} <span className="font-normal text-slate-500">mendaftar sebagai Psikolog.</span></p>
                          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 uppercase">Menunggu Verifikasi</p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifData?.pendingCount > 0 && (
                    <div onClick={() => {navigate('/admin/verifications'); setShowNotif(false)}} className="px-4 py-2 bg-teal-50 dark:bg-slate-800 text-center text-xs font-bold text-teal-700 dark:text-teal-400 cursor-pointer hover:bg-teal-100 dark:hover:bg-slate-700 transition-colors">
                      Lihat Semua Verifikasi
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-teal-100/20 pl-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-teal-900 dark:text-teal-50">{me?.name || 'Admin Utama'}</p>
              </div>
              {me?.profile_image ? (
                <img alt="Administrator Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shadow-sm" src={`${STORAGE_BASE_URL}/${me.profile_image}`} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center text-teal-800 font-bold shadow-sm">
                  {me?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="p-8 w-full max-w-7xl mx-auto animate-pulse transition-all">
            <div className="mb-12">
              <div className="h-10 bg-teal-100/50 rounded-lg w-1/4 mb-4"></div>
              <div className="h-4 bg-teal-100/30 rounded w-2/3"></div>
            </div>
            <div className="bg-teal-50/50 rounded-lg p-8 shadow-sm h-96 border border-teal-100/10"></div>
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="h-32 bg-teal-100/30 rounded-lg"></div>
              <div className="h-32 bg-teal-100/30 rounded-lg"></div>
              <div className="h-32 bg-teal-100/30 rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="p-8 w-full">
            {/* Header Section */}
            <div className="mb-12 flex justify-between items-end">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">
                  Kelola Pengguna
                </h2>
                <p className="text-on-surface-variant text-lg opacity-80 font-medium leading-relaxed">
                  Daftar semua pengguna yang terdaftar di platform Curhatin.
                  Kelola akses, status verifikasi, dan peran untuk menjaga
                  keamanan ekosistem.
                </p>
              </div>
            </div>

            {/* Bento Grid User Table */}
            <div className="bg-surface-container-low/60 backdrop-blur-md rounded-lg p-8 shadow-sm border border-outline-variant/10">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant/20">
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        ID
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        Pengguna
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        Email
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        Peran
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        Status
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em]">
                        Terdaftar
                      </th>
                      <th className="pb-6 pt-2 px-4 font-bold text-xs uppercase tracking-[0.1em] text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {paginatedUsers.map((u) => (
                      <tr
                        key={u.id}
                        className={`group transition-colors ${u.is_suspended ? "bg-error-container/5 hover:bg-error-container/10" : "hover:bg-white/40"}`}
                      >
                        <td
                          className={`py-4 px-4 text-sm font-mono ${u.is_suspended ? "text-error" : "text-teal-800"}`}
                        >
                          #USR-{u.id.toString().padStart(4, "0")}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            {u.profile_image ? (
                              <img
                                src={`${STORAGE_BASE_URL}/${u.profile_image}`}
                                alt={u.name}
                                className={`w-10 h-10 rounded-full object-cover shadow-sm ${u.is_suspended ? "grayscale" : ""}`}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-secondary-container flex flex-shrink-0 items-center justify-center text-on-secondary-container font-bold shadow-sm">
                                <span
                                  className="material-symbols-outlined"
                                  data-icon="person"
                                >
                                  person
                                </span>
                              </div>
                            )}
                            <div>
                              <p
                                className={`font-bold ${u.is_suspended ? "text-on-surface-variant line-through" : "text-on-surface"}`}
                              >
                                {u.name}
                              </p>
                              <p className="text-xs text-on-surface-variant italic">
                                ({u.role === "psikolog" ? "psikolog" : "anonim"})
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className={`py-4 px-4 text-sm font-medium ${u.is_suspended ? "text-on-surface-variant/60" : "text-on-surface-variant"}`}
                        >
                          {u.email}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {u.is_admin ? (
                            <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs font-bold">
                              Admin
                            </span>
                          ) : u.role === "psikolog" ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold border border-primary-container">
                                Psikolog
                              </span>
                              <span className="text-[9px] font-bold text-[#A46477] uppercase px-1">
                                {getSpesialisasiLabel(u.spesialisasi)}
                              </span>
                              {u.no_rekening && (
                                <span className="text-[9px] font-bold text-amber-600 uppercase px-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">payments</span>
                                  {u.nama_bank} - {u.no_rekening}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`bg-surface-container-highest text-on-surface px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30 ${u.is_suspended ? "opacity-50" : ""}`}
                            >
                              Anonim
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {u.is_suspended ? (
                            <div className="flex items-start gap-1.5 text-error flex-col">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="material-symbols-outlined text-sm"
                                  data-icon="warning"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  warning
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  Ditangguhkan
                                </span>
                              </div>
                              <span
                                className="text-[10px] text-error/70 line-clamp-1 max-w-[150px] leading-tight"
                                title={u.suspended_reason}
                              >
                                {u.suspended_reason || "Banned"}
                              </span>
                            </div>
                          ) : u.is_admin ? (
                            <div className="flex items-center gap-1.5 text-primary">
                              <span
                                className="material-symbols-outlined text-sm"
                                data-icon="verified"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                verified
                              </span>
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Super Admin
                              </span>
                            </div>
                          ) : u.role === "psikolog" ? (
                            u.is_rejected ? (
                              <div className="flex items-start gap-1.5 text-red-600 flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="material-symbols-outlined text-sm"
                                    style={{
                                      fontVariationSettings: "'FILL' 1",
                                    }}
                                  >
                                    cancel
                                  </span>
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Ditolak
                                  </span>
                                </div>
                                {u.rejected_reason && (
                                  <span
                                    className="text-[10px] text-red-400 line-clamp-1 max-w-[150px] leading-tight"
                                    title={u.rejected_reason}
                                  >
                                    {u.rejected_reason}
                                  </span>
                                )}
                              </div>
                            ) : u.is_verified ? (
                              <div className="flex items-center gap-1.5 text-primary">
                                <span
                                  className="material-symbols-outlined text-sm"
                                  data-icon="task_alt"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  task_alt
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  Terverifikasi
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-yellow-600">
                                <span
                                  className="material-symbols-outlined text-sm"
                                  data-icon="pending"
                                >
                                  pending
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  Pending
                                </span>
                              </div>
                            )
                          ) : u.is_premium ? (
                            <div className="flex items-center gap-1.5 text-[#8b6508]">
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                workspace_premium
                              </span>
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Premium
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                              <span
                                className="material-symbols-outlined text-sm"
                                data-icon="check_circle"
                              >
                                check_circle
                              </span>
                              <span className="text-xs font-bold uppercase tracking-wider">
                                Dasar
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-on-surface-variant/70 whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            {me?.is_admin &&
                              me.id !== u.id &&
                              !(
                                u.role === "psikolog" &&
                                (!u.is_verified || u.is_rejected)
                              ) && (
                                <>
                                  {u.is_suspended ? (
                                    <button
                                      onClick={() =>
                                        handleSuspend(u.id, u.name, true)
                                      }
                                      className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                                      title="Buka Penangguhan"
                                    >
                                      <span
                                        className="material-symbols-outlined text-lg"
                                        data-icon="lock_open"
                                      >
                                        lock_open
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleSuspend(u.id, u.name, false)
                                      }
                                      className="p-2 hover:bg-error/10 hover:text-error rounded-full transition-colors"
                                      title="Tangguhkan Akun"
                                    >
                                      <span
                                        className="material-symbols-outlined text-lg"
                                        data-icon="block"
                                      >
                                        block
                                      </span>
                                    </button>
                                  )}
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-10 text-center text-on-surface-variant font-medium"
                        >
                          Tidak ada data pengguna yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination/Footer */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant font-medium">
                  Menampilkan {filteredUsers.length === 0 ? 0 : startIndex + 1}-
                  {Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length} pengguna
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      data-icon="chevron_left"
                    >
                      chevron_left
                    </span>
                  </button>
                  <button className="min-w-10 h-10 px-3 flex items-center justify-center rounded-full bg-primary text-on-primary font-bold">
                    {safeCurrentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages || filteredUsers.length === 0}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      data-icon="chevron_right"
                    >
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* System Stats Bar */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Total Anonim & Premium
                  </p>
                  <p className="text-2xl font-extrabold text-on-surface">
                    {totalActive}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="group">
                    group
                  </span>
                </div>
              </div>
              <div className="bg-tertiary/5 p-6 rounded-lg border border-tertiary/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-1">
                    Total Psikolog
                  </p>
                  <p className="text-2xl font-extrabold text-on-surface">
                    {totalPsikolog}
                  </p>
                </div>
                <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center text-tertiary">
                  <span
                    className="material-symbols-outlined"
                    data-icon="psychology"
                  >
                    psychology
                  </span>
                </div>
              </div>
              <div className="bg-error/5 p-6 rounded-lg border border-error/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-error mb-1">
                    Akun Ditangguhkan
                  </p>
                  <p className="text-2xl font-extrabold text-on-surface">
                    {totalSuspended}
                  </p>
                </div>
                <div className="w-12 h-12 bg-error-container/20 rounded-full flex items-center justify-center text-error">
                  <span className="material-symbols-outlined" data-icon="block">
                    block
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suspend Modal */}
        {suspendModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() =>
                !suspendModal.isSubmitting &&
                setSuspendModal({
                  isOpen: false,
                  user: null,
                  reason: "",
                  isSubmitting: false,
                })
              }
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  data-icon="warning"
                >
                  warning
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Tangguhkan Akun
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Anda akan menangguhkan akun{" "}
                <strong className="text-teal-700 dark:text-teal-300">
                  {suspendModal.user?.name} ({suspendModal.user?.role === "psikolog" ? "psikolog" : "anonim"})
                </strong>
                . Silakan berikan alasan penangguhan yang jelas.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Alasan Penangguhan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={suspendModal.reason}
                  onChange={(e) =>
                    setSuspendModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none h-32"
                  placeholder="Contoh: Terdeteksi melakukan spam atau melanggar pedoman komunitas..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() =>
                    setSuspendModal({
                      isOpen: false,
                      user: null,
                      reason: "",
                      isSubmitting: false,
                    })
                  }
                  disabled={suspendModal.isSubmitting}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmSuspend}
                  disabled={
                    suspendModal.isSubmitting || !suspendModal.reason.trim()
                  }
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 min-w-[140px]"
                >
                  {suspendModal.isSubmitting ? (
                    <>
                      <span
                        className="material-symbols-outlined text-sm animate-spin"
                        data-icon="progress_activity"
                      >
                        progress_activity
                      </span>
                      Memproses...
                    </>
                  ) : (
                    <>Tangguhkan</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unsuspend Modal */}
        {unsuspendModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() =>
                !unsuspendModal.isSubmitting &&
                setUnsuspendModal({
                  isOpen: false,
                  user: null,
                  isSubmitting: false,
                })
              }
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  data-icon="lock_open"
                >
                  lock_open
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Buka Penangguhan Akun
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Apakah Anda yakin ingin mengembalikan akses untuk akun{" "}
                <strong className="text-teal-700 dark:text-teal-300">
                  {unsuspendModal.user?.name} ({unsuspendModal.user?.role === "psikolog" ? "psikolog" : "anonim"})
                </strong>
                ? Pengguna akan dapat kembali menggunakan layanan di platform
                ini.
              </p>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() =>
                    setUnsuspendModal({
                      isOpen: false,
                      user: null,
                      isSubmitting: false,
                    })
                  }
                  disabled={unsuspendModal.isSubmitting}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmUnsuspend}
                  disabled={unsuspendModal.isSubmitting}
                  className="px-6 py-2.5 rounded-full text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 min-w-[140px]"
                >
                  {unsuspendModal.isSubmitting ? (
                    <>
                      <span
                        className="material-symbols-outlined text-sm animate-spin"
                        data-icon="progress_activity"
                      >
                        progress_activity
                      </span>
                      Memproses...
                    </>
                  ) : (
                    <>Buka Akses</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
