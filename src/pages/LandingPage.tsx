import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Calendar, Users, Zap, Globe, Github, Trophy, Rocket, Mail, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";

const REGISTER_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc36OmsSG-1iLlA2_THVL3JKlGkR0-JWfd1IyrEOyZtPKjfnw/viewform?usp=header";
const COMMUNITY_URL = "https://t.me/talkware";

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'Meetup' | 'Training';
  location?: string;
  speaker?: string;
  description: string;
  link: string;
}

interface Highlight {
  id: string;
  num: string;
  title: string;
  date: string;
  place: string;
  time: string;
  image_url: string;
  highlight: string;
}

interface CoCreator {
  id: string;
  name: string;
  role: string;
  image_url: string;
}

interface Volunteer {
  id: string;
  name: string;
  role: string;
  image_url: string;
}

const FOUNDING_MEMBERS = [
  {
    name: "Khant Min Nyo (Lucius)",
    role: "Community Leader, Business Strategist, Front-end Developer",
    image: "/assets/founders/individual/khant_min_nyo.png"
  },
  {
    name: "Min Thu Khaing",
    role: "Head of Planning, Backend Developer",
    image: "/assets/founders/individual/min_thu_khaing.png"
  },
  {
    name: "Sai Wanna Htun",
    role: "Head of Project, Backend Developer",
    image: "/assets/founders/individual/sai_wanna_htun.png"
  },
  {
    name: "Han Thi Moe (De Dee)",
    role: "Head of Creative Design, Frontend Developer",
    image: "/assets/founders/individual/han_thi_moe.png"
  },
  {
    name: "Shoon Lae Lae Htun",
    role: "Head of Engagement & Marketing",
    image: "/assets/founders/individual/shoon_lae_lae_htun.png"
  }
];

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [coCreators, setCoCreators] = useState<CoCreator[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, highlightsData, creatorsData, volunteersData] = await Promise.all([
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('highlights').select('*').order('num', { ascending: true }),
          supabase.from('co_creators').select('*').order('created_at', { ascending: true }),
          supabase.from('volunteers').select('*').order('created_at', { ascending: true })
        ]);

        if (eventsData.data && eventsData.data.length > 0) setEvents(eventsData.data as Event[]);
        if (highlightsData.data && highlightsData.data.length > 0) setHighlights(highlightsData.data as Highlight[]);
        if (creatorsData.data && creatorsData.data.length > 0) setCoCreators(creatorsData.data as CoCreator[]);
        if (volunteersData.data && volunteersData.data.length > 0) setVolunteers(volunteersData.data as Volunteer[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Fallback data if DB is empty
  const displayEvents = events.length > 0 ? events : [
    {
      id: '1',
      title: "How To Pitch Your Project?",
      date: "May 23, 2026 • 1:00 PM",
      type: "Meetup" as const,
      location: "Location : To Be Announced (Mandalay)",
      description: "To Be Announced",
      link: "https://docs.google.com/forms/d/e/1FAIpQLScH7nV55e6NhJSEPM7Fcn3J4z8IbVS1yNPdRJGXNhW_oy3VoA/viewform?usp=dialog"
    },
    {
      id: '2',
      title: "The Flutter-based simple loyalty application",
      date: "May 18, 2026 • 7:30 PM",
      type: "Training" as const,
      speaker: "Sir Aung Ko Ko Thet",
      description: "Master the basics of Flutter by building a practical loyalty application from scratch. (90 Days Duration)",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSccpXrLVNgKMq5goHXwKozXAuxIPCAbQ0808n003u6LTo45fg/viewform?usp=header"
    }
  ];

  const displayHighlights = highlights.length > 0 ? highlights : [
    {
      id: 'h1',
      num: "01",
      title: "1st Talkware Meetup",
      date: "Nov 2, 2025",
      place: "Shadow Cafe, 107 64",
      time: "1:00 – 3:00 PM",
      image_url: "/assets/events/img-000.png",
      highlight: "Where it all began — the first gathering of builders and thinkers.",
    },
    {
      id: 'h2',
      num: "02",
      title: "The Role of Business in Digital Era",
      date: "Dec 1, 2025",
      place: "Manner Cafe",
      time: "1:00 – 3:00 PM",
      image_url: "/assets/events/img-001.png",
      highlight: "Introduced the Design Framework. The community found its rhythm.",
    },
    {
      id: 'h3',
      num: "03",
      title: "Let's Talk About Lean Model",
      date: "Jan 11, 2026",
      place: "The Cups Cafe",
      time: "1:00 – 3:00 PM",
      image_url: "/assets/events/img-005.png",
      highlight: "Rebranded into Pockraft. A pivotal moment for the community's identity.",
    },
    {
      id: 'h4',
      num: "04",
      title: "Project to Product",
      date: "Feb 8, 2026",
      place: "The Capulus Cafe",
      time: "1:00 – 3:30 PM",
      image_url: "/assets/events/img-008.png",
      highlight: "Sir AKKT joined as Custodian. Introduced the Problem statement ,Featured project showcases and deep discussions.",
    },
    {
      id: 'h5',
      num: "05",
      title: "High Value Freelancer",
      date: "March 8, 2026",
      place: "The Manner Cafe",
      time: "1:00 – 3:30 PM",
      image_url: "/assets/events/img-013.png",
      highlight: "Sir Thiha as Guest Speaker.New Talkware Co-creators joined. Planned NewWorld Program & Talkware Protocol.",
    },
    {
      id: 'h6',
      num: "06",
      title: "Find Your Team Build Your Idea",
      date: "Apr 19, 2026",
      place: "The Cups Cafe",
      time: "1:00 – 3:30 PM",
      image_url: "/assets/events/img-014.jpg",
      highlight: "Sir AKKT as Guest Speaker. Introduced the Solution ,Product Builder's Stack ",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Talkware Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl tracking-tighter uppercase">Talkware</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#mission" className="hover:text-white transition-colors">Home</a>
            <a href="#events" className="hover:text-white transition-colors">Announcements</a>
            <a href="#highlights" className="hover:text-white transition-colors">Highlights</a>
            <a href="#story" className="hover:text-white transition-colors">Our Story</a>
          </div>
          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95"
          >
            Join Community
          </a>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" />
              <span>Community Program by Pockraft Studio</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.9] tracking-tighter mb-8 text-gradient">
              TALKWARE <br /> COMMUNITY
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 font-light leading-relaxed mb-12">
              A community where developers stop building useless tools and start building real products with the right idea makers
            </motion.p>

            <motion.div variants={itemVariants} className="flex justify-center">
              <a
                href="#events"
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all group"
              >
                Register for Events
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Our Mission</h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  To operate as an interchange where isolated developers and idea-only founders connect to build products transparently
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-2xl">
                    <Users className="w-8 h-8 mb-4 text-white" />
                    <h3 className="font-bold mb-2">Inclusive Network</h3>
                    <p className="text-sm text-white/50">Connecting creators from all walks of life to build something meaningful.</p>
                  </div>
                  <div className="p-6 glass rounded-2xl">
                    <Globe className="w-8 h-8 mb-4 text-white" />
                    <h3 className="font-bold mb-2">Builder Ecosystem</h3>
                    <p className="text-sm text-white/50">Acting as the discovery layer to find talent, build teams, and launch impact-driven ideas</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square rounded-3xl overflow-hidden"
              >
                <img
                  src="/assets/events/img-004.png"
                  alt="Talkware Community Team"
                  className="w-full h-full object-cover transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Atmosphere</p>
                  <p className="text-xl font-display font-bold">Collaborative Energy</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section id="events" className="py-24 px-6 bg-white text-black rounded-3xl md:rounded-[5rem] my-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Upcoming Events</h2>
              <p className="text-black/60 max-w-2xl mx-auto text-lg">
                Don't miss out on our next gathering. Secure your spot today and be part of the conversation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {displayEvents.map((event, i) => (
                <div key={event.id || i} className="p-8 border border-black/10 rounded-3xl hover:border-black/30 transition-colors group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {event.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-black/40">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2 group-hover:translate-x-1 transition-transform">{event.title}</h3>
                  {event.speaker && (
                    <p className="text-sm font-bold text-black/40 mb-4 tracking-tight uppercase">Guest Speaker: {event.speaker}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-black/40 mb-4">
                      <Globe className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <p className="text-black/60 mb-8 leading-relaxed">{event.description}</p>
                  <a
                    href={event.link || REGISTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold hover:underline"
                  >
                    Register Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-12 py-6 bg-black text-white font-bold text-xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
              >
                Join the Community
              </a>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section id="highlights" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Highlights</h2>
                <p className="text-white/60 max-w-xl">From our very first meetup to a growing movement — here's how the Talkware community has evolved.</p>
              </div>
              <div className="text-sm text-white/40 font-mono">{displayHighlights.length} meetups &amp; counting</div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayHighlights.map((event, i) => (
                <motion.div
                  key={event.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 glass rounded-2xl group hover:bg-white/[0.06] transition-colors relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-4 right-4 text-5xl font-display font-black text-white/[0.04] group-hover:text-white/[0.08] transition-colors select-none">
                    {event.num}
                  </div>
                  <div className="aspect-video mb-6 rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">{event.date} • {event.time}</p>
                  <h3 className="font-display font-bold text-lg mb-2">{event.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/40 mb-4">
                    <Globe className="w-3 h-3" />
                    <span>{event.place}</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">{event.highlight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section id="story" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Our Story</h2>
                <div className="space-y-6 text-white/60 text-lg leading-relaxed">
                  <p>
                    Talkware's journey began at the <span className="text-white font-bold">Venture Base Hackathon </span> as <span className="text-white font-bold">VentureOps Team</span> ,
                    where our founders realized that Mandalay's junior developers needed a supportive ecosystem
                    that didn't yet exist locally — a place to bridge the gap between learning and impact.
                  </p>
                </div>
              </motion.div>
              <div className="flex justify-center">
                <div className="relative rounded-3xl overflow-hidden glass aspect-4/3 w-full max-w-sm">
                  <img
                    src="/assets/founders/venturebase2.png"
                    alt="Hackathon Victory"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founding Team & Co-creators */}
        <section id="founders" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gradient">Founding Team</h2>
              <p className="text-white/60 max-w-2xl mx-auto">The core team behind Talkware, dedicated to building a vibrant creator ecosystem in Mandalay.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-24">
              {FOUNDING_MEMBERS.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl overflow-hidden group flex flex-col"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-end">
                    <h3 className="font-display font-bold text-sm mb-1">{member.name}</h3>
                    <p className="text-[10px] text-white/40 leading-tight uppercase font-bold tracking-wider">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">Co-creators</h2>
            </div>

            {coCreators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {coCreators.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl overflow-hidden group flex flex-col"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={creator.image_url}
                        alt={creator.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-end">
                      <h3 className="font-display font-bold text-sm mb-1">{creator.name}</h3>
                      <p className="text-[10px] text-white/40 leading-tight uppercase font-bold tracking-wider">{creator.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 glass rounded-[3rem] border border-white/5">
                <p className="text-white/40 uppercase tracking-widest text-sm font-bold">Coming Soon</p>
              </div>
            )}

            {/* Volunteers */}
            <div className="text-center mb-16 mt-24">
              <h2 className="text-3xl font-display font-bold mb-4">Volunteers</h2>
              <p className="text-white/60 max-w-2xl mx-auto text-sm">The dedicated volunteers who help make Talkware events and operations possible.</p>
            </div>

            {volunteers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {volunteers.map((volunteer, i) => (
                  <motion.div
                    key={volunteer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl overflow-hidden group flex flex-col text-center"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={volunteer.image_url || "/logo.png"}
                        alt={volunteer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-bold text-xs mb-0.5">{volunteer.name}</h3>
                      <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">{volunteer.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 glass rounded-[3rem] border border-white/5">
                <p className="text-white/40 uppercase tracking-widest text-sm font-bold">Coming Soon</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="Talkware Logo" className="w-8 h-8 object-contain" />
                <span className="font-display font-bold text-xl tracking-tighter uppercase">Talkware</span>
              </div>
              <p className="text-white/40 max-w-sm mb-8">
                A community where developers stop building useless tools and start building real products with the right idea makers
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com/orgs/talkware-mm/" target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-full text-white/40 hover:text-white transition-all"><Github className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold mb-6 uppercase tracking-wider text-sm">Community</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="#mission" className="hover:text-white transition-colors">Our Mission</a></li>
                <li><a href="#highlights" className="hover:text-white transition-colors">Highlights</a></li>
                <li><a href="#story" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#founders" className="hover:text-white transition-colors">The Team</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold mb-6 uppercase tracking-wider text-sm">Contact</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><a href="mailto:team.talkware@gmail.com" className="hover:text-white transition-colors">team.talkware@gmail.com</a></li>
                <li><a href="tel:+959792470107" className="hover:text-white transition-colors">+95 979 247 010 7</a></li>
                <li><a href="tel:+959789910866" className="hover:text-white transition-colors">+959 789 910 866</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/20 text-xs">
              © 2026 Talkware Community. All rights reserved.
            </p>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
