import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Edit2, LogOut, LayoutDashboard, Calendar, Trophy, Users as UsersIcon, Upload, Save, X, ExternalLink, User, Image, Video, Sparkles, Zap, Gamepad2, Archive, ArchiveRestore } from "lucide-react";

type Tab = 'events' | 'highlights' | 'co_creators' | 'volunteers' | 'founders';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>('events');
  
  // Data state
  const [events, setEvents] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [coCreators, setCoCreators] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [founders, setFounders] = useState<any[]>([]);
  
  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  // Event detail management state
  const [eventMedia, setEventMedia] = useState<any[]>([]);
  const [eventSections, setEventSections] = useState<any[]>([]);
  const [newMediaItem, setNewMediaItem] = useState({ media_type: 'photo', url: '', title: '', caption: '' });
  const [newSectionItem, setNewSectionItem] = useState({ section_type: 'highlight', title: '', subtitle: '', description: '', icon: '' });
  const [loadingDetails, setLoadingDetails] = useState(false);
  // showArchived removed - 'archived' column doesn't exist in the database

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    try {
      const [ev, hi, co, vo, fo] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('highlights').select('*').order('num', { ascending: false }),
        supabase.from('co_creators').select('*').order('created_at', { ascending: true }),
        supabase.from('volunteers').select('*').order('created_at', { ascending: true }),
        supabase.from('founding_team').select('*').order('sort_order', { ascending: true })
      ]);

      if (ev.data && ev.data.length > 0) setEvents(ev.data);
      if (hi.data && hi.data.length > 0) setHighlights(hi.data);
      if (co.data && co.data.length > 0) setCoCreators(co.data);
      if (vo.data && vo.data.length > 0) setVolunteers(vo.data);
      if (fo.data && fo.data.length > 0) setFounders(fo.data);

      // Log any individual query errors
      [ev, hi, co, vo, fo].forEach((result, index) => {
        if (result.error) {
          console.error(`Error fetching data from query ${index}:`, result.error);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please check the browser console for details.');
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = () => supabase.auth.signOut();

  const getTableName = (tab: Tab) => tab === 'founders' ? 'founding_team' : tab;

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleArchive = async (eventId: string, archived: boolean) => {
    const { error } = await supabase.from('events').update({ archived: !archived }).eq('id', eventId);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleToggleFounders = async (id: string, current: boolean) => {
    const { error } = await supabase.from('founding_team').update({ active: !current }).eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let table = getTableName(activeTab);

    // Clean up formData before saving
    const dataToSave = { ...formData };
    delete dataToSave.id;
    delete dataToSave.created_at;

    const { error } = isEditing && isEditing !== 'new'
      ? await supabase.from(table).update(dataToSave).eq('id', isEditing)
      : await supabase.from(table).insert([dataToSave]);
    
    if (error) {
      console.error('Error saving:', error);
      alert(error.message);
    } else {
      setIsEditing(null);
      setFormData({});
      setEventMedia([]);
      setEventSections([]);
      fetchData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
    } else {
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
    }
    setUploading(false);
  };

  // Event detail management functions
  async function fetchEventDetails(eventId: string) {
    setLoadingDetails(true);
    const [mediaRes, sectionsRes] = await Promise.all([
      supabase.from('event_media').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
      supabase.from('event_sections').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
    ]);
    if (mediaRes.data) setEventMedia(mediaRes.data);
    if (sectionsRes.data) setEventSections(sectionsRes.data);
    setLoadingDetails(false);
  }

  async function addMedia(eventId: string) {
    if (!newMediaItem.url.trim()) return;
    const { error } = await supabase.from('event_media').insert([{
      event_id: eventId,
      media_type: newMediaItem.media_type,
      url: newMediaItem.url,
      title: newMediaItem.title || null,
      caption: newMediaItem.caption || null,
      sort_order: eventMedia.length + 1,
    }]);
    if (error) { alert(error.message); } else {
      setNewMediaItem({ media_type: 'photo', url: '', title: '', caption: '' });
      fetchEventDetails(eventId);
    }
  }

  async function deleteMedia(mediaId: string, eventId: string) {
    if (!confirm('Delete this media item?')) return;
    const { error } = await supabase.from('event_media').delete().eq('id', mediaId);
    if (error) { alert(error.message); } else { fetchEventDetails(eventId); }
  }

  async function addSection(eventId: string) {
    if (!newSectionItem.title.trim()) return;
    const { error } = await supabase.from('event_sections').insert([{
      event_id: eventId,
      section_type: newSectionItem.section_type,
      title: newSectionItem.title,
      subtitle: newSectionItem.subtitle || null,
      description: newSectionItem.description || null,
      icon: newSectionItem.icon || null,
      sort_order: eventSections.length + 1,
    }]);
    if (error) { alert(error.message); } else {
      setNewSectionItem({ section_type: 'highlight', title: '', subtitle: '', description: '', icon: '' });
      fetchEventDetails(eventId);
    }
  }

  async function deleteSection(sectionId: string, eventId: string) {
    if (!confirm('Delete this section item?')) return;
    const { error } = await supabase.from('event_sections').delete().eq('id', sectionId);
    if (error) { alert(error.message); } else { fetchEventDetails(eventId); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/40 text-sm">Manage Talkware Community Hub</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="admin@talkware.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-8 h-8" alt="Logo" />
          <span className="font-display font-bold tracking-tighter uppercase">Admin Hub</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('events'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'events' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Calendar className="w-5 h-5" /> Events
          </button>
          <button 
            onClick={() => { setActiveTab('highlights'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'highlights' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Trophy className="w-5 h-5" /> Past Events
          </button>
          <button 
            onClick={() => { setActiveTab('co_creators'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'co_creators' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <UsersIcon className="w-5 h-5" /> Co-creators
          </button>
          <button 
            onClick={() => { setActiveTab('volunteers'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'volunteers' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <UsersIcon className="w-5 h-5" /> Volunteers
          </button>
          <button 
            onClick={() => { setActiveTab('founders'); setIsEditing(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'founders' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60'}`}
          >
            <UsersIcon className="w-5 h-5" /> Founding Team
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 w-full transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold capitalize">{activeTab.replace('_', ' ')}</h2>
            <p className="text-white/40 text-sm">Manage your website content dynamically.</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => { setIsEditing('new'); setFormData({}); setEventMedia([]); setEventSections([]); }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              <Plus className="w-5 h-5" /> Add New
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="max-w-2xl glass p-8 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">{isEditing === 'new' ? 'Create' : 'Edit'} {activeTab}</h3>
              <button onClick={() => { setIsEditing(null); setFormData({}); setEventMedia([]); setEventSections([]); }} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Title</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Date/Time</label>
                      <input type="text" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" placeholder="May 23, 2026 • 1:00 PM" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Type</label>
                      <select value={formData.type || 'Meetup'} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
                        <option value="Meetup">Meetup</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Location</label>
                    <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" placeholder="e.g., Shadow Cafe, 107 64" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Speaker (Optional)</label>
                    <input type="text" value={formData.speaker || ''} onChange={e => setFormData({...formData, speaker: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Registration Link</label>
                    <input type="url" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Description</label>
                    <textarea rows={4} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                  </div>

                  {/* Event Media Management */}
                  {isEditing && isEditing !== 'new' && (
                    <div className="pt-6 border-t border-white/10 space-y-8">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-white/60" /> Event Details
                      </h4>

                      <div>
                        <h5 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Image className="w-4 h-4" /> Media (Photos &amp; Videos)
                        </h5>
                        {loadingDetails ? (
                          <p className="text-white/40 text-sm">Loading...</p>
                        ) : eventMedia.length > 0 ? (
                          <div className="grid gap-2 mb-4">
                            {eventMedia.map((m) => (
                              <div key={m.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-2 border border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                  {m.media_type === 'photo' ? <Image className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                                  <span className="text-xs text-white/60 truncate">{m.url}</span>
                                  {m.title && <span className="text-xs text-white/40 hidden sm:inline truncate">— {m.title}</span>}
                                </div>
                                <button onClick={() => deleteMedia(m.id, isEditing)} className="p-1 hover:bg-red-400/20 rounded-lg text-white/40 hover:text-red-400 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/30 text-sm mb-4">No media added yet.</p>
                        )}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Type</label>
                            <select value={newMediaItem.media_type} onChange={e => setNewMediaItem({...newMediaItem, media_type: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30">
                              <option value="photo">Photo</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div className="flex-[2] min-w-[180px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">URL</label>
                            <input type="url" value={newMediaItem.url} onChange={e => setNewMediaItem({...newMediaItem, url: e.target.value})}
                              placeholder="https://example.com/photo.jpg"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Title</label>
                            <input type="text" value={newMediaItem.title} onChange={e => setNewMediaItem({...newMediaItem, title: e.target.value})}
                              placeholder="Optional"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <button type="button" onClick={() => addMedia(isEditing)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>

                      {/* Event Sections Management */}
                      <div>
                        <h5 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Sections (Past Events, Activities, Games, Wins)
                        </h5>
                        {loadingDetails ? (
                          <p className="text-white/40 text-sm">Loading...</p>
                        ) : eventSections.length > 0 ? (
                          <div className="grid gap-2 mb-4">
                            {eventSections.map((s) => (
                              <div key={s.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-2 border border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                  {s.section_type === 'highlight' ? <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    : s.section_type === 'activity' ? <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    : s.section_type === 'game' ? <Gamepad2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    : <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                  <span className="text-xs text-white/60 truncate">{s.title}</span>
                                  {s.subtitle && <span className="text-xs text-white/40 hidden sm:inline truncate">— {s.subtitle}</span>}
                                </div>
                                <button onClick={() => deleteSection(s.id, isEditing)} className="p-1 hover:bg-red-400/20 rounded-lg text-white/40 hover:text-red-400 flex-shrink-0 ml-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-white/30 text-sm mb-4">No sections added yet.</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Type</label>
                            <select value={newSectionItem.section_type} onChange={e => setNewSectionItem({...newSectionItem, section_type: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30">
                              <option value="highlight">Highlight</option>
                              <option value="activity">Activity</option>
                              <option value="game">Game</option>
                              <option value="win">Win</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Title</label>
                            <input type="text" value={newSectionItem.title} onChange={e => setNewSectionItem({...newSectionItem, title: e.target.value})}
                              placeholder="Section title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <button type="button" onClick={() => addSection(isEditing)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 justify-center">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Subtitle (Optional)</label>
                            <input type="text" value={newSectionItem.subtitle} onChange={e => setNewSectionItem({...newSectionItem, subtitle: e.target.value})}
                              placeholder="Subtitle" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Description (Optional)</label>
                            <input type="text" value={newSectionItem.description} onChange={e => setNewSectionItem({...newSectionItem, description: e.target.value})}
                              placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Icon (Optional)</label>
                            <input type="text" value={newSectionItem.icon} onChange={e => setNewSectionItem({...newSectionItem, icon: e.target.value})}
                              placeholder="e.g., star, zap, trophy" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Linked Past Events in Event Editor */}
              {isEditing && isEditing !== 'new' && (
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-white/60" /> Linked Past Events
                  </h4>
                  {highlights.filter(h => h.event_id === isEditing).length > 0 ? (
                    <div className="grid gap-2">
                      {highlights.filter(h => h.event_id === isEditing).map(hl => (
                        <div key={hl.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-bold text-white/40">{hl.num}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{hl.title}</p>
                              <p className="text-xs text-white/40">{hl.date} • {hl.place}</p>
                            </div>
                          </div>
                          <button onClick={() => { setActiveTab('highlights'); setIsEditing(hl.id); setFormData(hl); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white flex-shrink-0"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm">No highlights linked to this event yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'highlights' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Number (e.g., 01)</label>
                      <input type="text" value={formData.num || ''} onChange={e => setFormData({...formData, num: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Date</label>
                      <input type="text" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Time</label>
                      <input type="text" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Place</label>
                      <input type="text" value={formData.place || ''} onChange={e => setFormData({...formData, place: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Associated Event (Optional)</label>
                    <select value={formData.event_id || ''} onChange={e => setFormData({...formData, event_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30">
                      <option value="">-- Select Event --</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Highlight Text</label>
                    <textarea rows={3} value={formData.highlight || ''} onChange={e => setFormData({...formData, highlight: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-24 aspect-video rounded-xl object-cover border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'highlights')} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'co_creators' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Role</label>
                    <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Profile Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'co-creators')} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'volunteers' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Role</label>
                    <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Profile Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'volunteers')} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'founders' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Role</label>
                    <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase">Profile Image</label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                      )}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40">
                          <Upload className="w-5 h-5" />
                          {uploading ? 'Uploading...' : 'Click to Upload'}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'founders')} />
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      id="founders-active" 
                      type="checkbox" 
                      checked={!!formData.active} 
                      onChange={e => setFormData({...formData, active: e.target.checked})}                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
                    />
                    <label htmlFor="founders-active" className="text-sm text-white/60">Active</label>
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === 'events' && events.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No events found. Add one to get started.</p>
            )}
            {activeTab === 'events' && events.map(ev => (
              <div key={ev.id} className={`glass p-6 rounded-2xl flex items-center justify-between border transition-all group ${ev.archived ? 'border-white/5 opacity-60' : 'border-white/5 hover:border-white/20'}`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest">{ev.type}</span>
                    <h4 className="font-bold text-lg">{ev.title}</h4>
                    {ev.archived && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold uppercase tracking-widest text-white/40">Archived</span>}
                  </div>
                  <p className="text-white/40 text-sm">{ev.date}{ev.location ? ` • ${ev.location}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(ev.id); setFormData(ev); fetchEventDetails(ev.id); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleArchive(ev.id, ev.archived)} className={`p-2 hover:bg-white/10 rounded-lg ${ev.archived ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/60 hover:text-white'}`} title={ev.archived ? 'Unarchive' : 'Archive'}>
                    {ev.archived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete('events', ev.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'highlights' && highlights.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No highlights found. Add one to get started.</p>
            )}
            {activeTab === 'highlights' && highlights.map(hi => (
              <div key={hi.id} className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-display font-black text-white/10">{hi.num}</span>
                  {hi.image_url && <img src={hi.image_url} className="w-16 aspect-video rounded-lg object-cover" alt="" />}
                  <div>
                    <h4 className="font-bold text-lg mb-1">{hi.title}</h4>
                    <p className="text-white/40 text-xs">{hi.date} • {hi.place}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(hi.id); setFormData(hi); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('highlights', hi.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'co_creators' && coCreators.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No co-creators found. Add one to get started.</p>
            )}
            {activeTab === 'co_creators' && coCreators.map(co => (
              <div key={co.id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-4">
                  {co.image_url ? (
                    <img src={co.image_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40"><User className="w-5 h-5" /></div>
                  )}
                  <div>
                    <h4 className="font-bold">{co.name}</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{co.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(co.id); setFormData(co); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('co_creators', co.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'founders' && founders.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No founding team members found. Add one to get started.</p>
            )}
            {activeTab === 'founders' && founders.map(f => (
              <div 
                key={f.id} 
                onClick={() => handleToggleFounders(f.id, f.active)}                className={`glass p-4 rounded-2xl flex items-center justify-between border transition-all group cursor-pointer ${!f.active ? 'border-white/5 opacity-60' : 'border-white/5 hover:border-white/20'}`}              >
                <div className="flex items-center gap-4">
                  {f.image_url ? (
                    <img src={f.image_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40"><User className="w-5 h-5" /></div>
                  )}
                  <div>
                    <h4 className="font-bold">{f.name}</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{f.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => e.stopPropagation()} >
                  <button onClick={() => { setIsEditing(f.id); setFormData(f); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('founding_team', f.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

            {activeTab === 'volunteers' && volunteers.map(vo => (
              <div key={vo.id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-4">
                  {vo.image_url ? (
                    <img src={vo.image_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40"><User className="w-5 h-5" /></div>
                  )}
                  <div>
                    <h4 className="font-bold">{vo.name}</h4>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{vo.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(vo.id); setFormData(vo); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('volunteers', vo.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            {activeTab === 'volunteers' && volunteers.length === 0 && (
              <p className="text-white/40 text-sm py-8 text-center">No volunteers found. Add one to get started.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
