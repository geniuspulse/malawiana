"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Megaphone, Plus, Trash2, Edit2, X, Power,
  Code, Image as ImageIcon, Link as LinkIcon, Globe, Info, ChevronDown, ChevronUp
} from "lucide-react";

interface Ad {
  id: string;
  name: string;
  placement: "header" | "sidebar" | "in-article" | "footer" | "popup";
  type: "image" | "script" | "html" | "link";
  content: string;
  destination_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  notes?: string;
  impressions: number;
  clicks: number;
  created_at: string;
}

const PLACEMENTS = [
  { value: "header",     label: "Header",      desc: "Top of every page" },
  { value: "in-article", label: "In-Article",  desc: "Between content sections" },
  { value: "sidebar",    label: "Sidebar",     desc: "Side panel (desktop)" },
  { value: "footer",     label: "Footer",      desc: "Bottom of page" },
  { value: "popup",      label: "Popup",       desc: "Overlay (popunder)" },
];

const TYPES = [
  { value: "script", label: "Script / Adsterra", icon: <Code size={14} />, desc: "Paste any <script> tag or HTML+script snippet" },
  { value: "image",  label: "Image Banner",      icon: <ImageIcon size={14} />, desc: "Image URL + click destination" },
  { value: "link",   label: "Text Link",         icon: <LinkIcon size={14} />, desc: "Sponsored text link" },
  { value: "html",   label: "Raw HTML",          icon: <Globe size={14} />, desc: "Any custom HTML block" },
];

const ADSTERRA_GUIDE = [
  { label: "Popunder / Social Bar", hint: 'Single <script src="..."> tag — no container div', safe: true },
  { label: "Native Banner (invoke.js)", hint: 'Has <script async ... invoke.js> + <div id="container-...">', safe: false, note: "Banner — check if you want to use" },
  { label: "Direct Link", hint: "Just a URL — use type Link", safe: true },
];

function empty(): Partial<Ad> {
  return { name: "", placement: "in-article", type: "script", content: "", destination_url: "", is_active: true, notes: "" };
}

export default function AdsManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [form, setForm] = useState<Partial<Ad>>(empty());
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase.from("malawiana_ads").select("*").order("created_at", { ascending: false });
    if (e) setError(e.message);
    setAds((data as Ad[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const openNew = () => { setEditingAd(null); setForm(empty()); setIsOpen(true); };
  const openEdit = (ad: Ad) => { setEditingAd(ad); setForm({ ...ad }); setIsOpen(true); };
  const closePanel = () => { setIsOpen(false); setEditingAd(null); setForm(empty()); };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.content?.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      placement: form.placement,
      type: form.type,
      content: form.content,
      destination_url: form.destination_url || null,
      is_active: form.is_active ?? true,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes || null,
    };
    if (editingAd) {
      await supabase.from("malawiana_ads").update(payload).eq("id", editingAd.id);
    } else {
      await supabase.from("malawiana_ads").insert({ ...payload, impressions: 0, clicks: 0 });
    }
    setSaving(false);
    closePanel();
    fetchAds();
  };

  const toggleActive = async (ad: Ad) => {
    await supabase.from("malawiana_ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    fetchAds();
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await supabase.from("malawiana_ads").delete().eq("id", id);
    fetchAds();
  };

  const f = (key: keyof Ad, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  // Detect if pasted content looks like a banner (has invoke.js + container div)
  const isBannerSnippet = (content: string) =>
    content.includes("invoke.js") && content.includes('id="container-');

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Megaphone size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ad Management</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Adsterra snippets & ad placements</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Info size={14} /> Guide {showGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} /> Add Ad
          </button>
        </div>
      </div>

      {/* Adsterra Guide */}
      {showGuide && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">Adsterra Snippet Types</p>
          <div className="space-y-2">
            {ADSTERRA_GUIDE.map(g => (
              <div key={g.label} className={`flex items-start gap-3 p-3 rounded-xl ${g.safe ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'}`}>
                <span className={`text-lg mt-0.5`}>{g.safe ? "✅" : "⚠️"}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{g.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{g.hint}</p>
                  {g.note && <p className="text-xs text-amber-600 mt-0.5">{g.note}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Use <strong>type: Script / Adsterra</strong> for all Adsterra snippets. The renderer safely executes the scripts in the browser.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Ad List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No ads yet. Add your first Adsterra snippet above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-start gap-4">
              
              {/* Status dot */}
              <button onClick={() => toggleActive(ad)} title={ad.is_active ? "Disable" : "Enable"}
                className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${ad.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                <Power size={14} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{ad.name}</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{ad.placement}</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{ad.type}</span>
                  {!ad.is_active && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">Paused</span>}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono truncate max-w-md">
                  {ad.content.slice(0, 80)}{ad.content.length > 80 ? '…' : ''}
                </p>
                {ad.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{ad.notes}</p>}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(ad)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteAd(ad.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          {/* Panel */}
          <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {editingAd ? "Edit Ad" : "New Ad"}
              </h2>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Ad Name *</label>
                <input value={form.name || ""} onChange={e => f("name", e.target.value)}
                  placeholder="e.g. Adsterra Popunder"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Ad Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => f("type", t.value as Ad["type"])}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${form.type === t.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}>
                      {t.icon}
                      <div>
                        <p className="text-xs font-semibold">{t.label}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Placement *</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {PLACEMENTS.map(p => (
                    <button key={p.value} type="button" onClick={() => f("placement", p.value as Ad["placement"])}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-colors ${form.placement === p.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <span className={`text-sm font-medium ${form.placement === p.value ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>{p.label}</span>
                      <span className="text-xs text-gray-400">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content / Snippet */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  {form.type === "script" || form.type === "html" ? "Snippet / Code *" : form.type === "image" ? "Image URL *" : "URL *"}
                </label>
                <textarea value={form.content || ""} onChange={e => f("content", e.target.value)} rows={6}
                  placeholder={
                    form.type === "script"
                      ? '<script src="https://pl30548466..."></script>'
                      : form.type === "image" ? "https://example.com/banner.jpg"
                      : "https://example.com/..."
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors resize-y" />
                
                {/* Banner warning */}
                {isBannerSnippet(form.content || "") && (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ This looks like a <strong>native banner snippet</strong> (invoke.js + container div). Make sure this is the one you want to use.
                  </div>
                )}
              </div>

              {/* Destination URL (for image/link types) */}
              {(form.type === "image" || form.type === "link") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Destination URL</label>
                  <input value={form.destination_url || ""} onChange={e => f("destination_url", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes (optional)</label>
                <input value={form.notes || ""} onChange={e => f("notes", e.target.value)}
                  placeholder="e.g. Popunder — Adsterra account #1"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
                  <input type="date" value={form.start_date || ""} onChange={e => f("start_date", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
                  <input type="date" value={form.end_date || ""} onChange={e => f("end_date", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</p>
                  <p className="text-xs text-gray-400">Ad will be shown on the site immediately</p>
                </div>
                <button onClick={() => f("is_active", !form.is_active)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            {/* Save */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
              <button onClick={handleSave} disabled={saving || !form.name?.trim() || !form.content?.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {saving ? "Saving…" : editingAd ? "Update Ad" : "Create Ad"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
