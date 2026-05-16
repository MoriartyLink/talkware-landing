-- Seed Events
INSERT INTO public.events (title, date, type, location, description, link)
VALUES 
('How To Pitch Your Project?', 'May 23, 2026 • 1:00 PM', 'Meetup', 'Location : To Be Announced (Mandalay)', 'To Be Announced', 'https://docs.google.com/forms/d/e/1FAIpQLScH7nV55e6NhJSEPM7Fcn3J4z8IbVS1yNPdRJGXNhW_oy3VoA/viewform?usp=dialog'),
('The Flutter-based simple loyalty application', 'May 18, 2026 • 7:30 PM', 'Training', 'Online', 'Master the basics of Flutter by building a practical loyalty application from scratch. (90 Days Duration)', 'https://docs.google.com/forms/d/e/1FAIpQLSccpXrLVNgKMq5goHXwKozXAuxIPCAbQ0808n003u6LTo45fg/viewform?usp=header');

-- Seed Highlights
INSERT INTO public.highlights (num, title, date, place, time, image_url, highlight)
VALUES 
('01', '1st Talkware Meetup', 'Nov 2, 2025', 'Shadow Cafe, 107 64', '1:00 – 3:00 PM', '/assets/events/img-000.png', 'Where it all began — the first gathering of builders and thinkers.'),
('02', 'The Role of Business in Digital Era', 'Dec 1, 2025', 'Manner Cafe', '1:00 – 3:00 PM', '/assets/events/img-001.png', 'Introduced the Design Framework. The community found its rhythm.'),
('03', 'Let''s Talk About Lean Model', 'Jan 11, 2026', 'The Cups Cafe', '1:00 – 3:00 PM', '/assets/events/img-005.png', 'Rebranded into Pockraft. A pivotal moment for the community''s identity.'),
('04', 'Project to Product', 'Feb 8, 2026', 'The Capulus Cafe', '1:00 – 3:30 PM', '/assets/events/img-008.png', 'Sir AKKT joined as Custodian. Introduced the Problem statement ,Featured project showcases and deep discussions.'),
('05', 'High Value Freelancer', 'March 8, 2026', 'The Manner Cafe', '1:00 – 3:30 PM', '/assets/events/img-013.png', 'Sir Thiha as Guest Speaker.New Talkware Co-creators joined. Planned NewWorld Program & Talkware Protocol.'),
('06', 'Find Your Team Build Your Idea', 'Apr 19, 2026', 'The Cups Cafe', '1:00 – 3:30 PM', '/assets/events/img-014.jpg', 'Sir AKKT as Guest Speaker. Introduced the Solution ,Product Builder''s Stack ');

-- Seed Founding Members (into co_creators or you can leave them static)
-- I'll seed them so they can be edited if needed
INSERT INTO public.co_creators (name, role, image_url)
VALUES 
('Khant Min Nyo (Lucius)', 'Community Leader, Business Strategist, Front-end Developer', '/assets/founders/individual/khant_min_nyo.png'),
('Min Thu Khaing', 'Head of Planning, Backend Developer', '/assets/founders/individual/min_thu_khaing.png'),
('Sai Wanna Htun', 'Head of Project, Backend Developer', '/assets/founders/individual/sai_wanna_htun.png'),
('Han Thi Moe (De Dee)', 'Head of Creative Design, Frontend Developer', '/assets/founders/individual/han_thi_moe.png'),
('Shoon Lae Lae Htun', 'Head of Engagement & Marketing', '/assets/founders/individual/shoon_lae_lae_htun.png');
