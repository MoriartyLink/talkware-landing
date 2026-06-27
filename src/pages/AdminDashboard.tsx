import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Edit2, LogOut, LayoutDashboard, Calendar, Trophy, Users as UsersIcon, Upload, Save, X, ExternalLink } from "lucide-react";

type Tab = 'events' | 'highlights' | 'co_creators' | 'volunteers';

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
  
  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

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
    const [ev, hi, co, vo] = await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('highlights').select('*').order('num', { ascending: false }),
      supabase.from('co_creators').select('*').order('created_at', { ascending: true }),
      supabase.from('volunteers').select('*').order('created_at', { ascending: true })
    ]);
    if (ev.data) setEvents(ev.data);
    if (hi.data) setHighlights(hi.data);
    if (co.data) setCoCreators(co.data);
    if (vo.data) setVolunteers(vo.data);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = () => supabase.auth.signOut();

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let table = activeTab;
    
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
            <Trophy className="w-5 h-5" /> Highlights
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
              onClick={() => { setIsEditing('new'); setFormData({}); }}
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
              <button onClick={() => setIsEditing(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-5 h-5" /></button>
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
                </>
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

              <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTab === 'events' && events.map(ev => (
              <div key={ev.id} className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest">{ev.type}</span>
                    <h4 className="font-bold text-lg">{ev.title}</h4>
                  </div>
                  <p className="text-white/40 text-sm">{ev.date}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setIsEditing(ev.id); setFormData(ev); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete('events', ev.id)} className="p-2 hover:bg-red-400/20 rounded-lg text-white/60 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}

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

            {activeTab === 'co_creators' && coCreators.map(co => (
              <div key={co.id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-4">
                  <img src={co.image_url} className="w-12 h-12 rounded-full object-cover" alt="" />
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

            {activeTab === 'volunteers' && volunteers.map(vo => (
              <div key={vo.id} className="glass p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-4">
                  {vo.image_url ? (
                    <img src={vo.image_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold">?</div>
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
          </div>
        )}
      </main>
    </div>
  );
}
