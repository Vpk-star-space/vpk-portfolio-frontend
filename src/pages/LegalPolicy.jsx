import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe, Printer, PieChart, Store, AlertTriangle, Server, Info, ArrowLeft, Languages, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✏️ Edit these in ONE place. Anything in [square brackets] below also needs your real details.
const CONFIG = {
    updated: 'October 2026',
    email: 'privacy@subhamsnetworks.in',   // TODO: your real contact email
    owner: '[Owner / business name]',      // TODO
    place: '[City, State, India]',         // TODO
};

// Add a `te` object here later (same keys as `en`). The language button appears only when it exists.
const content = {
    en: {
        back: 'Back',
        title: 'Privacy Policy & Terms of Service',
        subtitle: `Last updated: ${CONFIG.updated} · Applies to all Subhams apps`,
        introTitle: 'Introduction',
        introText: 'This page covers every Subhams Networks app. We aim to collect as little data as possible and to keep it secure. By using our apps, you agree to these terms.',
        introBox: ['Status', 'Subhams Agent and PMMS are live. Subhams Hub is still in development, so expect frequent updates and changes while we improve the local marketplace.'],
        glanceTitle: 'At a glance',
        glanceHead: ['App', 'Login', 'Data we receive', 'How long we keep it'],
        appsTitle: 'Rules for each app',
        banTitle: 'Cross-app rules and account blocking',
        banText: 'Our apps share one account system. If you commit fraud or break the rules in any one app, we may block you in all of them, including future services.',
        banList: [
            ['What we link', 'To enforce a block across apps, we match accounts by the email address you signed in with.'],
            ['Appeals', `If you think a block is a mistake, email ${CONFIG.email} and we will review it.`],
        ],
        infraTitle: 'Third-party services',
        infraText: 'We use these providers to run our apps. They process data for us under their own privacy policies:',
        providers: [
            ['Google', 'Sign-in'],
            ['MongoDB, Neon DB', 'Database'],
            ['Render, Vercel', 'Hosting'],
            ['Brevo', 'Emails'],
        ],
        liabilityTitle: 'Limitation of liability and device security',
        liabilityText1: 'We protect our servers with industry-standard security. We cannot control your own device. If your phone, email or accounts are compromised by unknown files, malicious apps or hacks you installed, we are not responsible, to the extent permitted by law.',
        liabilityText2: 'We choose our providers carefully, but we cannot control outages or breaches at those providers. To the extent permitted by law, we are not liable for losses that originate there.',
        rightsTitle: 'Your rights, cookies and contact',
        rights: [
            ['Access, correction and deletion', `Email ${CONFIG.email} and we will respond within [number] days.`],
            ['Cookies and local storage', 'We use browser storage only to keep you signed in and to remember the temporary name you enter in Agent.'],
            ['Children', 'Our apps are not meant for children under [age].'],
            ['Changes', 'When we change this page, we update the date at the top.'],
            ['Governing law', 'These terms are governed by the laws of India.'],
            ['Operator', `${CONFIG.owner}, ${CONFIG.place}`],
        ],
        contactTitle: 'Questions about your privacy?',
        contactBtn: 'Message Administrator',
        footer: '© 2026 Subhams Networks. All rights reserved.',
    },
};

const apps = [
    {
        id: 'site', icon: Globe, color: '#3b82f6', name: 'Subhams Networks', url: 'subhamsnetworks.in', status: 'Live',
        login: 'None', data: 'Messages you send in the contact chat', keep: '[add period]',
        points: [
            ['No accounts', 'The main site needs no sign-up, no Google login and no account.'],
            ['No analytics or ad trackers', 'We do not run analytics or advertising trackers. Our hosting providers may log technical data such as your IP address.'],
            ['Contact chat', 'Messages you send are delivered to the Administrator and used only to reply to you.'],
        ],
    },
    {
        id: 'agent', icon: Printer, color: '#d97706', name: 'Subhams Secure Agent', url: 'agent.subhamsnetworks.in', status: 'Live',
        login: 'Customers: none. Shops: Email or Google', data: 'Job ID; shop account and ID documents', keep: 'Customer files: removed within 10 minutes. Shop ID: [add period]',
        points: [
            ['Customers', 'No sign-up or phone permission. The temporary name you enter stays only on your device.'],
            ['Uploads', 'Documents and photos are encrypted in transit and sent to the shop. Our servers do not store your files; our database only records a Job ID.'],
            ['10-minute auto-delete', "Files are deleted from the shop's queue within 10 minutes, whether printed or not."],
            ['Shops', 'Owners register with Email or Google and upload [type of ID document]. We use it only to [verify the shop]. It is seen by [who], kept for [how long], and deleted when [condition].'],
            ['Shop violations', 'Breaking the printing rules leads to permanent removal.'],
        ],
    },
    {
        id: 'pmms', icon: PieChart, color: '#16a34a', name: 'Subhams PMMS', url: 'pmms.subhamsnetworks.in', status: 'Live',
        login: 'Email or Google', data: 'Only the numbers you enter yourself', keep: 'Until you delete your account [confirm]',
        points: [
            ['Your data stays yours', 'We do not sell your financial data or share it with anyone, apart from the providers listed below that store it for us.'],
            ['Manual entry only', 'PMMS processes only the figures you type in. It does not connect to your bank.'],
            ['Sign-in', 'Accounts use Email or Google login.'],
        ],
    },
    {
        id: 'hub', icon: Store, color: '#db2777', name: 'Subhams Hub', url: 'hub.subhamsnetworks.in', status: 'Beta',
        login: 'Google', data: 'Name and email from Google; your location while you use the app', keep: '[add period]',
        points: [
            ['Location', 'We ask for your location only to show nearby active shops. We do not track it in the background after you close the app, and we do not build profiles from your movements.'],
            ['Sign-in', 'You log in with Google. We receive your basic profile details (name, email) and use them only to run your account. [confirm exact details]'],
            ['Languages', 'Available in English and Telugu.'],
        ],
    },
];

const css = `
.lg{--bg:#f8fafc;--card:#fff;--text:#1e293b;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--soft:#eff6ff;--warn:#fef2f2;--warnline:#fecaca;
background:var(--bg);color:var(--text);min-height:100vh;font-family:'Inter',system-ui,sans-serif;line-height:1.7;padding-bottom:40px}
@media(prefers-color-scheme:dark){.lg{--bg:#0b1120;--card:#111a2e;--text:#e2e8f0;--muted:#94a3b8;--line:#1e2a44;--brand:#60a5fa;--soft:#14213d;--warn:#2a1318;--warnline:#5b2430}}
.lg *{box-sizing:border-box}
.lg header{background:#0f172a;padding:12px 16px;position:sticky;top:0;z-index:100}
.lg .bar{max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px}
.lg .btn{display:flex;align-items:center;gap:6px;background:transparent;border:0;color:#cbd5e1;cursor:pointer;font-weight:600;font-size:14px;padding:6px 0}
.lg .btn.pill{border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:20px;padding:6px 12px}
.lg .brand{display:flex;align-items:center;gap:8px;color:#fff;font-size:16px;font-weight:800;letter-spacing:.5px;margin:0}
.lg main{max-width:820px;margin:0 auto;padding:0 16px}
.lg .hero{padding:32px 0 8px}
.lg h2{font-size:clamp(24px,5vw,34px);line-height:1.2;margin:0 0 8px}
.lg .sub{color:var(--muted);margin:0;font-size:14px}
.lg nav.toc{display:flex;gap:8px;overflow-x:auto;padding:16px 0;scrollbar-width:none}
.lg nav.toc a{white-space:nowrap;color:var(--brand);border:1px solid var(--line);background:var(--card);border-radius:20px;padding:4px 12px;font-size:13px;text-decoration:none}
.lg section,.lg article{scroll-margin-top:72px}
.lg h3{display:flex;align-items:center;gap:8px;font-size:20px;margin:36px 0 10px}
.lg p{margin:0 0 12px}
.lg .note{background:var(--soft);border-left:4px solid var(--brand);border-radius:8px;padding:12px 14px;margin-top:12px}
.lg .scroll{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.lg table{border-collapse:collapse;width:100%;min-width:620px;font-size:14px}
.lg th,.lg td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.lg th{color:var(--muted);font-weight:600}
.lg tr:last-child td{border-bottom:0}
.lg article{background:var(--card);border:1px solid var(--line);border-left-width:5px;border-radius:12px;padding:18px 18px 8px;margin-bottom:16px}
.lg .ah{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lg .ah h4{margin:0;font-size:18px}
.lg .badge{font-size:12px;font-weight:700;padding:2px 10px;border-radius:12px;background:#dcfce7;color:#166534}
.lg .badge.beta{background:#fef3c7;color:#92400e}
.lg .url{display:inline-block;color:var(--muted);font-size:13px;margin:2px 0 10px;text-decoration:none}
.lg ul{padding-left:20px;margin:0 0 10px}
.lg li{margin-bottom:8px}
.lg .warn{background:var(--warn);border:1px solid var(--warnline);border-radius:12px;padding:18px 18px 8px;margin-top:36px}
.lg .warn h3{margin-top:0}
.lg .tags{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:12px 0 20px}
.lg .tags div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.lg .tags span{display:block;color:var(--muted);font-size:13px}
.lg .contact{text-align:center;margin-top:40px;padding:28px 16px;background:var(--soft);border-radius:16px}
.lg .contact h3{justify-content:center;margin:0 0 12px}
.lg .contact a.mail{display:inline-flex;align-items:center;gap:6px;color:var(--brand);margin:0 0 14px;font-weight:600}
.lg .cta{display:inline-flex;align-items:center;gap:8px;background:#2563eb;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:700;cursor:pointer;font-size:15px}
.lg .cta:focus-visible,.lg .btn:focus-visible,.lg nav a:focus-visible{outline:3px solid #facc15;outline-offset:2px}
.lg footer{text-align:center;color:var(--muted);font-size:13px;margin-top:28px}
@media print{.lg header,.lg nav.toc,.lg .contact{display:none}.lg{background:#fff}}
`;

const LegalPolicy = () => {
    const [lang, setLang] = useState('en');
    const navigate = useNavigate();
    const t = content[lang] || content.en;
    const hasOtherLang = Object.keys(content).length > 1;

    // Jump to #agent, #pmms, #hub... when opened from another app; otherwise start at the top
    useEffect(() => {
        const id = window.location.hash.slice(1);
        const el = id && document.getElementById(id);
        if (el) el.scrollIntoView();
        else window.scrollTo(0, 0);
    }, []);

    const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

    const toc = [['glance', 'At a glance'], ...apps.map(a => [a.id, a.name.replace('Subhams ', '')]), ['rules', 'Blocking'], ['providers', 'Providers'], ['rights', 'Your rights']];

    return (
        <div className="lg">
            <style>{css}</style>

            <header>
                <div className="bar">
                    <button className="btn" onClick={goBack}><ArrowLeft size={18} /> {t.back}</button>
                    <h1 className="brand"><ShieldCheck size={24} color="#facc15" /> SUBHAMS NETWORKS</h1>
                    {hasOtherLang
                        ? <button className="btn pill" onClick={() => setLang(lang === 'en' ? 'te' : 'en')}><Languages size={16} /> {lang === 'en' ? 'తెలుగు' : 'English'}</button>
                        : <span style={{ width: 60 }} />}
                </div>
            </header>

            <main>
                <div className="hero">
                    <h2>{t.title}</h2>
                    <p className="sub">{t.subtitle}</p>
                </div>

                <nav className="toc" aria-label="Sections">
                    {toc.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
                </nav>

                <section>
                    <h3><Info size={20} color="#2563eb" /> {t.introTitle}</h3>
                    <p>{t.introText}</p>
                    <div className="note"><strong>{t.introBox[0]}:</strong> {t.introBox[1]}</div>
                </section>

                <section id="glance">
                    <h3>{t.glanceTitle}</h3>
                    <div className="scroll">
                        <table>
                            <thead><tr>{t.glanceHead.map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>
                                {apps.map(a => (
                                    <tr key={a.id}>
                                        <td><a href={`#${a.id}`}>{a.name}</a></td>
                                        <td>{a.login}</td>
                                        <td>{a.data}</td>
                                        <td>{a.keep}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3>{t.appsTitle}</h3>
                    {apps.map(a => {
                        const Icon = a.icon;
                        return (
                            <article key={a.id} id={a.id} style={{ borderLeftColor: a.color }}>
                                <div className="ah">
                                    <Icon size={24} color={a.color} />
                                    <h4>{a.name}</h4>
                                    <span className={`badge${a.status === 'Beta' ? ' beta' : ''}`}>{a.status}</span>
                                </div>
                                <a className="url" href={`https://${a.url}`}>{a.url}</a>
                                <ul>{a.points.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                            </article>
                        );
                    })}
                </section>

                <section id="rules" className="warn">
                    <h3><AlertTriangle size={22} color="#dc2626" /> {t.banTitle}</h3>
                    <p>{t.banText}</p>
                    <ul>{t.banList.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                </section>

                <section id="providers">
                    <h3><Server size={20} color="#2563eb" /> {t.infraTitle}</h3>
                    <p>{t.infraText}</p>
                    <div className="tags">{t.providers.map(([n, p]) => <div key={n}><strong>{n}</strong><span>{p}</span></div>)}</div>
                    <h4 style={{ margin: '0 0 6px' }}>{t.liabilityTitle}</h4>
                    <p>{t.liabilityText1}</p>
                    <p>{t.liabilityText2}</p>
                </section>

                <section id="rights">
                    <h3>{t.rightsTitle}</h3>
                    <ul>{t.rights.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                </section>

                <section className="contact">
                    <h3>{t.contactTitle}</h3>
                    <a className="mail" href={`mailto:${CONFIG.email}`}><Mail size={16} /> {CONFIG.email}</a>
                    <div><button className="cta" onClick={() => navigate('/#contact')}><MessageSquare size={18} /> {t.contactBtn}</button></div>
                </section>

                <footer><p>{t.footer}</p></footer>
            </main>
        </div>
    );
};

export default LegalPolicy;
