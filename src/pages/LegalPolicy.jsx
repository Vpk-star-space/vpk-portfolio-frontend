import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe, Printer, PieChart, Store, AlertTriangle, Server, Info, ArrowLeft, Languages, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const meta = [
    { id: 'site', icon: Globe, color: '#3b82f6', url: 'subhamsnetworks.in', name: 'Subhams Networks' },
    { id: 'agent', icon: Printer, color: '#d97706', url: 'agent.subhamsnetworks.in', name: 'Subhams Secure Agent' },
    { id: 'pmms', icon: PieChart, color: '#16a34a', url: 'pmms.subhamsnetworks.in', name: 'Subhams PMMS' },
    { id: 'hub', icon: Store, color: '#db2777', url: 'hub.subhamsnetworks.in', name: 'Subhams Hub', beta: true },
];

const content = {
    en: {
        back: 'Back', langHint: 'తెలుగులో చదవడానికి ఈ బటన్ నొక్కండి', langBtn: 'తెలుగు',
        title: 'Privacy Policy & Terms of Service',
        subtitle: 'Last updated: October 2026 · Applies to all Subhams apps',
        pickTitle: 'Jump to a website', live: 'Live', beta: 'Beta',
        introTitle: 'Introduction',
        introText: 'This page covers every Subhams Networks app. We collect as little data as we can and keep it secure. By using our apps, you agree to these terms.',
        status: ['Status', 'Subhams Agent and PMMS are live. Subhams Hub is still in development, so expect frequent updates and changes.'],
        glanceTitle: 'At a glance', glanceHead: ['App', 'Login', 'Data we receive'],
        appsTitle: 'Rules for each app',
        apps: {
            site: { login: 'None', data: 'Messages you send in the contact chat', points: [
                ['No accounts', 'The main site needs no sign-up, Google login or account.'],
                ['No ad trackers', 'We run no analytics or advertising trackers. Our hosting providers may log technical data such as your IP address.'],
                ['Contact chat', 'Your messages go to the Administrator and are used only to reply to you.']] },
            agent: { login: 'Customers: none. Shops: Email or Google', data: 'A Job ID. Shops: account and ID ', points: [
                ['Customers', 'No sign-up or phone permission. The temporary name in you enter stays only on your device Untill if send it Shop in copies They Saw only recognize Purpose,Your name it only temporary in Your sending Shop.'],
                ['Uploads', 'Files are encrypted in transit and sent to the shop. Our servers do not store them; our database records only a Job ID in temporary only.'],
                ['10-minute auto-delete', 'Files are deleted from the shop queue within 10 minutes, printed or not.'],
                ['Shops', 'Owners register with Email or Google and  to verify the shop. Breaking the printing rules leads to permanent removal.']] },
            pmms: { login: 'Email or Google', data: 'Only numbers you enter yourself', points: [
                ['Your data', 'We do not sell or share your financial data, except with the providers below that store it for us.'],
                ['Manual entry only', 'PMMS is a closed system that processes only the figures you type in.'],
                ['Sign-in', 'Accounts use Email or Google login.']] },
            hub: { login: 'Google', data: 'Google profile details; your location while using the app', points: [
                ['Location', 'Used only to show nearby active shops. We do not track you in the background after you close the app, or build profiles from your movements.'],
                ['Sign-in', 'You log in with Google. We use basic profile details, such as name and email, only to run your account.'],
                ['Languages', 'English and Telugu.']] },
        },
        banTitle: 'Cross-app rules and account blocking',
        banText: 'Our apps share one account system. If you commit fraud or break the rules in any one app, we may block you in all of them, including future services.',
        banList: [['Account matching', 'To enforce a block, we match accounts by the email you signed in with.'],
            ['Appeals', 'If you think a block is a mistake, send a message to the Administrator and we will review it.']],
        infraTitle: 'Third-party services',
        infraText: 'We use these providers to run our apps. They process data for us under their own privacy policies:',
        providers: [['Google', 'Sign-in'], ['MongoDB, Neon DB', 'Database'], ['Render, Vercel', 'Hosting'], ['Brevo', 'Emails']],
        liabilityTitle: 'Limitation of liability and device security',
        liabilityText1: 'We protect our servers with industry-standard security. We cannot control your own device. If your phone, email or accounts are compromised by unknown files, malicious apps or hacks you installed, we are not responsible, to the extent permitted by law.',
        liabilityText2: 'We choose our providers carefully, but we cannot control outages or breaches at those providers. To the extent permitted by law, we are not liable for losses that originate there.',
        rightsTitle: 'Your rights and cookies',
        rights: [['Access, correction, deletion', 'Message the Administrator to see, fix or delete your data.'],
            ['Cookies and local storage', 'Used only to keep you signed in and to remember the temporary name in Agent.'],
            ['Children', 'Our apps are not meant for children.'],
            ['Changes', 'When we change this page, we update the date at the top.'],
            ['Governing law', 'These terms are governed by the laws of India.']],
        contactTitle: 'Questions about your privacy?', contactBtn: 'Message Administrator',
        footer: '© 2026 Subhams Networks. All rights reserved.',
    },
    te: {
        back: 'వెనుకకు', langHint: 'Read this page in English', langBtn: 'English',
        title: 'గోప్యతా విధానం & సేవా నిబంధనలు',
        subtitle: 'చివరిగా నవీకరించినది: అక్టోబర్ 2026 · అన్ని సుభమ్స్ యాప్‌లకు వర్తిస్తుంది',
        pickTitle: 'వెబ్‌సైట్‌కు వెళ్ళండి', live: 'అందుబాటులో', beta: 'బీటా',
        introTitle: 'పరిచయం',
        introText: 'ఈ పేజీ సుభమ్స్ నెట్‌వర్క్స్ యాప్‌లన్నింటికీ వర్తిస్తుంది. మేము వీలైనంత తక్కువ డేటాను సేకరిస్తాము మరియు దానిని సురక్షితంగా ఉంచుతాము. మా యాప్‌లను ఉపయోగించడం ద్వారా మీరు ఈ నిబంధనలకు అంగీకరిస్తున్నారు.',
        status: ['స్థితి', 'సుభమ్స్ ఏజెంట్ మరియు PMMS అందుబాటులో ఉన్నాయి. సుభమ్స్ హబ్ ఇంకా అభివృద్ధిలో ఉంది, కాబట్టి తరచుగా మార్పులు ఉండవచ్చు.'],
        glanceTitle: 'ఒక చూపులో', glanceHead: ['యాప్', 'లాగిన్', 'మేము స్వీకరించే డేటా'],
        appsTitle: 'ప్రతి యాప్‌కు నియమాలు',
        apps: {
            site: { login: 'లేదు', data: 'కాంటాక్ట్ చాట్‌లో మీరు పంపే సందేశాలు', points: [
                ['ఖాతాలు అవసరం లేదు', 'ప్రధాన సైట్‌కు సైన్-అప్, Google లాగిన్ లేదా ఖాతా అవసరం లేదు.'],
                ['ప్రకటన ట్రాకర్లు లేవు', 'మేము అనలిటిక్స్ లేదా ప్రకటన ట్రాకర్లను ఉపయోగించము. మా హోస్టింగ్ ప్రొవైడర్లు మీ IP చిరునామా వంటి సాంకేతిక డేటాను లాగ్ చేయవచ్చు.'],
                ['కాంటాక్ట్ చాట్', 'మీ సందేశాలు అడ్మినిస్ట్రేటర్‌కు వెళ్తాయి మరియు మీకు సమాధానం ఇవ్వడానికి మాత్రమే ఉపయోగిస్తాము.']] },
            agent: { login: 'కస్టమర్లు: లేదు. షాపులు: ఇమెయిల్ లేదా Google', data: 'జాబ్ ID. షాపులు: ఖాతా మరియు ID పత్రాలు', points: [
                ['కస్టమర్లు', 'సైన్-అప్ లేదా ఫోన్ అనుమతి అవసరం లేదు. మీరు నమోదు చేసే తాత్కాలిక పేరు మీ పరికరంలోనే ఉంటుంది.'],
                ['అప్‌లోడ్‌లు', 'ఫైల్‌లు గుప్తీకరించబడి షాప్‌కు పంపబడతాయి. మా సర్వర్‌లు వాటిని నిల్వ చేయవు; మా డేటాబేస్ కేవలం జాబ్ IDని నమోదు చేస్తుంది.'],
                ['10 నిమిషాల ఆటో-డిలీట్', 'ప్రింట్ అయినా కాకపోయినా, ఫైల్‌లు 10 నిమిషాలలోపు షాప్ క్యూ నుండి తొలగించబడతాయి.'],
                ['షాపులు', 'యజమానులు ఇమెయిల్ లేదా Google ద్వారా నమోదు చేసి, షాప్‌ను ధృవీకరించడానికి ID పత్రాలను అప్‌లోడ్ చేయాలి. ప్రింటింగ్ నియమాలను ఉల్లంఘిస్తే శాశ్వతంగా తొలగించబడతారు.']] },
            pmms: { login: 'ఇమెయిల్ లేదా Google', data: 'మీరు స్వయంగా నమోదు చేసే సంఖ్యలు మాత్రమే', points: [
                ['మీ డేటా', 'మేము మీ ఆర్థిక డేటాను విక్రయించము లేదా పంచుకోము; దానిని మా కోసం నిల్వ చేసే కింది ప్రొవైడర్లు మాత్రమే మినహాయింపు.'],
                ['మాన్యువల్ ఎంట్రీ మాత్రమే', 'PMMS అనేది మీరు టైప్ చేసే సంఖ్యలను మాత్రమే ప్రాసెస్ చేసే క్లోజ్డ్ సిస్టమ్.'],
                ['సైన్-ఇన్', 'ఖాతాలు ఇమెయిల్ లేదా Google లాగిన్‌ను ఉపయోగిస్తాయి.']] },
            hub: { login: 'Google', data: 'Google ప్రొఫైల్ వివరాలు; యాప్ వాడుతున్నప్పుడు మీ స్థానం', points: [
                ['స్థానం', 'సమీపంలోని యాక్టివ్ షాపులను చూపించడానికి మాత్రమే. యాప్ మూసిన తర్వాత నేపథ్యంలో ట్రాక్ చేయము, మీ కదలికల ఆధారంగా ప్రొఫైల్‌లు నిర్మించము.'],
                ['సైన్-ఇన్', 'మీరు Google ద్వారా లాగిన్ అవుతారు. పేరు, ఇమెయిల్ వంటి ప్రాథమిక ప్రొఫైల్ వివరాలను మీ ఖాతా నడపడానికి మాత్రమే ఉపయోగిస్తాము.'],
                ['భాషలు', 'ఇంగ్లీష్ మరియు తెలుగు.']] },
        },
        banTitle: 'యాప్‌ల మధ్య నియమాలు & ఖాతా నిలిపివేత',
        banText: 'మా యాప్‌లు ఒకే ఖాతా వ్యవస్థను పంచుకుంటాయి. మీరు ఏదైనా ఒక యాప్‌లో మోసం చేసినా లేదా నియమాలను ఉల్లంఘించినా, అన్ని యాప్‌లలో (భవిష్యత్ సేవలతో సహా) మిమ్మల్ని నిలిపివేయవచ్చు.',
        banList: [['ఖాతా సరిపోలిక', 'నిలిపివేతను అమలు చేయడానికి, మీరు లాగిన్ అయిన ఇమెయిల్ ద్వారా ఖాతాలను సరిపోల్చుతాము.'],
            ['అప్పీల్', 'నిలిపివేత పొరపాటు అని భావిస్తే, అడ్మినిస్ట్రేటర్‌కు సందేశం పంపండి; మేము సమీక్షిస్తాము.']],
        infraTitle: 'థర్డ్-పార్టీ సేవలు',
        infraText: 'మా యాప్‌లను నడపడానికి ఈ ప్రొవైడర్లను ఉపయోగిస్తాము. వారు తమ గోప్యతా విధానాల ప్రకారం మా తరపున డేటాను ప్రాసెస్ చేస్తారు:',
        providers: [['Google', 'లాగిన్'], ['MongoDB, Neon DB', 'డేటాబేస్'], ['Render, Vercel', 'హోస్టింగ్'], ['Brevo', 'ఇమెయిల్‌లు']],
        liabilityTitle: 'బాధ్యత పరిమితి & పరికర భద్రత',
        liabilityText1: 'మా సర్వర్‌లను పరిశ్రమ ప్రమాణాల భద్రతతో రక్షిస్తాము. మీ పరికరాన్ని మేము నియంత్రించలేము. మీరు ఇన్‌స్టాల్ చేసిన తెలియని ఫైల్‌లు, హానికరమైన యాప్‌లు లేదా హ్యాక్‌ల వల్ల మీ ఫోన్, ఇమెయిల్ లేదా ఖాతాలు రాజీపడితే, చట్టం అనుమతించిన మేరకు మేము బాధ్యత వహించము.',
        liabilityText2: 'మేము ప్రొవైడర్లను జాగ్రత్తగా ఎంచుకుంటాము, కానీ వారి వద్ద జరిగే అంతరాయాలు లేదా ఉల్లంఘనలను నియంత్రించలేము. చట్టం అనుమతించిన మేరకు, అక్కడ నుండి వచ్చే నష్టాలకు మేము బాధ్యులం కాము.',
        rightsTitle: 'మీ హక్కులు & కుకీలు',
        rights: [['యాక్సెస్, సవరణ, తొలగింపు', 'మీ డేటాను చూడటానికి, సరిచేయడానికి లేదా తొలగించడానికి అడ్మినిస్ట్రేటర్‌కు సందేశం పంపండి.'],
            ['కుకీలు & లోకల్ స్టోరేజ్', 'మిమ్మల్ని లాగిన్‌లో ఉంచడానికి మరియు ఏజెంట్‌లో తాత్కాలిక పేరును గుర్తుంచుకోవడానికి మాత్రమే ఉపయోగిస్తాము.'],
            ['పిల్లలు', 'మా యాప్‌లు పిల్లల కోసం కాదు.'],
            ['మార్పులు', 'ఈ పేజీని మార్చినప్పుడు పైన ఉన్న తేదీని నవీకరిస్తాము.'],
            ['చట్టం', 'ఈ నిబంధనలు భారత చట్టాలకు లోబడి ఉంటాయి.']],
        contactTitle: 'మీ గోప్యత గురించి సందేహాలు ఉన్నాయా?', contactBtn: 'అడ్మినిస్ట్రేటర్‌కు సందేశం పంపండి',
        footer: '© 2026 సుభమ్స్ నెట్‌వర్క్స్. అన్ని హక్కులు ప్రత్యేకించబడినవి.',
    },
};

const css = `
.lg{--bg:#f8fafc;--card:#fff;--text:#1e293b;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--soft:#eff6ff;--warn:#fef2f2;--warnline:#fecaca;--tlbg:#fef9c3;--tltext:#713f12;--tlline:#fde047;
background:var(--bg);color:var(--text);min-height:100vh;font-family:'Inter',system-ui,sans-serif;line-height:1.7;padding-bottom:40px}
.lg[lang=te]{font-family:'Noto Sans Telugu','Inter',system-ui,sans-serif;line-height:1.95}
@media(prefers-color-scheme:dark){.lg{--bg:#0b1120;--card:#111a2e;--text:#e2e8f0;--muted:#94a3b8;--line:#1e2a44;--brand:#60a5fa;--soft:#14213d;--warn:#2a1318;--warnline:#5b2430;--tlbg:#3a2f0b;--tltext:#fde68a;--tlline:#78650f}}
.lg *{box-sizing:border-box}
.lg header{background:#0f172a;height:56px;padding:0 16px;position:sticky;top:0;z-index:100;display:flex;align-items:center}
.lg .bar{width:100%;max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px}
.lg .btn{display:flex;align-items:center;gap:6px;background:transparent;border:0;color:#cbd5e1;cursor:pointer;font-weight:600;font-size:14px;padding:6px 0;font-family:inherit}
.lg .btn.pill{border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:20px;padding:6px 12px}
.lg .brand{display:flex;align-items:center;gap:8px;color:#fff;font-size:16px;font-weight:800;letter-spacing:.5px;margin:0}
.lg main{max-width:820px;margin:0 auto;padding:0 16px}
.lg .hero{margin-top:16px;padding:28px 22px;border-radius:16px;color:#fff;background:linear-gradient(135deg,#0f172a,#1e3a8a)}
.lg h2{font-size:clamp(24px,5.5vw,34px);line-height:1.25;margin:0 0 8px}
.lg .sub{color:#cbd5e1;margin:0;font-size:14px}
.lg .tl{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--tlbg);color:var(--tltext);border:1px solid var(--tlline);border-radius:12px;padding:12px 14px;margin-top:14px;font-weight:600}
.lg .tl button{background:#0f172a;color:#fff;border:0;border-radius:10px;padding:9px 16px;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit}
.lg .pick{position:sticky;top:56px;z-index:90;background:var(--bg);padding:12px 0 10px;margin-top:6px}
.lg .pick p{margin:0 0 8px;font-size:13px;color:var(--muted)}
.lg .chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.lg .chip{flex:none;display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:22px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.lg .chip i{width:10px;height:10px;border-radius:50%;background:var(--c)}
.lg .chip.on{background:var(--c);border-color:var(--c);color:#fff}
.lg .chip.on i{background:#fff}
.lg section,.lg article{scroll-margin-top:140px}
.lg h3{display:flex;align-items:center;gap:8px;font-size:20px;margin:34px 0 10px}
.lg p{margin:0 0 12px}
.lg .note{background:var(--soft);border-left:4px solid var(--brand);border-radius:8px;padding:12px 14px;margin-top:12px}
.lg .scroll{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.lg table{border-collapse:collapse;width:100%;min-width:480px;font-size:14px}
.lg th,.lg td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.lg th{color:var(--muted);font-weight:600}
.lg tr:last-child td{border-bottom:0}
.lg tr.on td{background:color-mix(in srgb,var(--c) 14%,transparent)}
.lg td button{background:none;border:0;padding:0;color:var(--brand);font-weight:600;cursor:pointer;text-align:left;font-family:inherit;font-size:inherit}
.lg article{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--c);border-radius:12px;padding:18px 18px 8px;margin-bottom:16px;transition:box-shadow .25s,background .25s}
.lg article.on{background:color-mix(in srgb,var(--c) 7%,var(--card));box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 40%,transparent);animation:pulse .9s ease-out 1}
@keyframes pulse{from{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 60%,transparent)}to{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 40%,transparent)}}
@media(prefers-reduced-motion:reduce){.lg article.on{animation:none}.lg *{scroll-behavior:auto}}
.lg .ah{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lg .ah h4{margin:0;font-size:18px}
.lg .badge{font-size:12px;font-weight:700;padding:2px 10px;border-radius:12px;background:#dcfce7;color:#166534}
.lg .badge.beta{background:#fef3c7;color:#92400e}
.lg .url{display:inline-block;color:var(--muted);font-size:13px;margin:2px 0 10px;text-decoration:none}
.lg ul{padding-left:20px;margin:0 0 10px}
.lg li{margin-bottom:8px}
.lg .warn{background:var(--warn);border:1px solid var(--warnline);border-radius:12px;padding:18px 18px 8px;margin-top:34px}
.lg .warn h3{margin-top:0}
.lg .tags{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:12px 0 20px}
.lg .tags div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.lg .tags span{display:block;color:var(--muted);font-size:13px}
.lg .contact{text-align:center;margin-top:40px;padding:28px 16px;background:var(--soft);border-radius:16px}
.lg .contact h3{justify-content:center;margin:0 0 14px}
.lg .cta{display:inline-flex;align-items:center;gap:8px;background:#2563eb;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-weight:700;cursor:pointer;font-size:15px;font-family:inherit}
.lg button:focus-visible,.lg a:focus-visible{outline:3px solid #facc15;outline-offset:2px}
.lg footer{text-align:center;color:var(--muted);font-size:13px;margin-top:28px}
@media print{.lg header,.lg .pick,.lg .tl,.lg .contact{display:none}.lg{background:#fff}}
`;

const LegalPolicy = () => {
    const [lang, setLang] = useState('en');
    const [active, setActive] = useState(null);
    const navigate = useNavigate();
    const t = content[lang];

    const jump = (id, smooth = true) => {
        setActive(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    };
    const pick = (id) => { jump(id); window.history.replaceState(null, '', '#' + id); };

    // Opening /legal#agent from another app jumps to and highlights that app
    useEffect(() => {
        const fromHash = () => {
            const id = window.location.hash.slice(1);
            if (meta.some(m => m.id === id)) { jump(id, false); return true; }
            return false;
        };
        if (!fromHash()) window.scrollTo(0, 0);
        window.addEventListener('hashchange', fromHash);
        return () => window.removeEventListener('hashchange', fromHash);
    }, []);

    const toggleLang = () => setLang(lang === 'en' ? 'te' : 'en');
    const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

    return (
        <div className="lg" lang={lang}>
            <style>{css}</style>

            <header>
                <div className="bar">
                    <button className="btn" onClick={goBack}><ArrowLeft size={18} /> {t.back}</button>
                    <h1 className="brand"><ShieldCheck size={24} color="#facc15" /> SUBHAMS NETWORKS</h1>
                    <button className="btn pill" onClick={toggleLang}><Languages size={16} /> {t.langBtn}</button>
                </div>
            </header>

            <main>
                <div className="hero">
                    <h2>{t.title}</h2>
                    <p className="sub">{t.subtitle}</p>
                </div>

                <div className="tl">
                    <span>{t.langHint}</span>
                    <button onClick={toggleLang}><Languages size={16} /> {t.langBtn}</button>
                </div>

                <div className="pick">
                    <p>{t.pickTitle}</p>
                    <div className="chips">
                        {meta.map(m => (
                            <button key={m.id} className={`chip${active === m.id ? ' on' : ''}`} style={{ '--c': m.color }} onClick={() => pick(m.id)}>
                                <i /> {m.url}
                            </button>
                        ))}
                    </div>
                </div>

                <section>
                    <h3><Info size={20} color="#2563eb" /> {t.introTitle}</h3>
                    <p>{t.introText}</p>
                    <div className="note"><strong>{t.status[0]}:</strong> {t.status[1]}</div>
                </section>

                <section>
                    <h3>{t.glanceTitle}</h3>
                    <div className="scroll">
                        <table>
                            <thead><tr>{t.glanceHead.map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>
                                {meta.map(m => (
                                    <tr key={m.id} className={active === m.id ? 'on' : ''} style={{ '--c': m.color }}>
                                        <td><button onClick={() => pick(m.id)}>{m.name}</button></td>
                                        <td>{t.apps[m.id].login}</td>
                                        <td>{t.apps[m.id].data}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3>{t.appsTitle}</h3>
                    {meta.map(m => {
                        const Icon = m.icon;
                        return (
                            <article key={m.id} id={m.id} className={active === m.id ? 'on' : ''} style={{ '--c': m.color }}>
                                <div className="ah">
                                    <Icon size={24} color={m.color} />
                                    <h4>{m.name}</h4>
                                    <span className={`badge${m.beta ? ' beta' : ''}`}>{m.beta ? t.beta : t.live}</span>
                                </div>
                                <a className="url" href={`https://${m.url}`}>{m.url}</a>
                                <ul>{t.apps[m.id].points.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                            </article>
                        );
                    })}
                </section>

                <section className="warn">
                    <h3><AlertTriangle size={22} color="#dc2626" /> {t.banTitle}</h3>
                    <p>{t.banText}</p>
                    <ul>{t.banList.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                </section>

                <section>
                    <h3><Server size={20} color="#2563eb" /> {t.infraTitle}</h3>
                    <p>{t.infraText}</p>
                    <div className="tags">{t.providers.map(([n, p]) => <div key={n}><strong>{n}</strong><span>{p}</span></div>)}</div>
                    <h4 style={{ margin: '0 0 6px' }}>{t.liabilityTitle}</h4>
                    <p>{t.liabilityText1}</p>
                    <p>{t.liabilityText2}</p>
                </section>

                <section>
                    <h3>{t.rightsTitle}</h3>
                    <ul>{t.rights.map(([b, x]) => <li key={b}><strong>{b}:</strong> {x}</li>)}</ul>
                </section>

                <section className="contact">
                    <h3>{t.contactTitle}</h3>
                    <button className="cta" onClick={() => navigate('/#contact')}><MessageSquare size={18} /> {t.contactBtn}</button>
                </section>

                <footer><p>{t.footer}</p></footer>
            </main>
        </div>
    );
};

export default LegalPolicy;
