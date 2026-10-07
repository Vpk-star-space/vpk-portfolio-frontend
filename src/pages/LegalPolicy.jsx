import React, { useEffect, useState } from 'react';
import { ShieldCheck, Globe, Printer, PieChart, Store, AlertTriangle, Lock, Server, Info, ArrowLeft, Languages, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalPolicy = () => {
    const [lang, setLang] = useState('en');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const content = {
        en: {
            back: "Back",
            title: "Subhams Networks Privacy Policy & Terms of Service",
            subtitle: "Effective Date: October 2026 | Applies to the entire Subhams Ecosystem",
            introTitle: "1. Introduction",
            introText: "Welcome to the Subhams Networks Ecosystem. Our ultimate goal is to give users the fastest performance and the best possible output. We believe in strict data privacy, minimal data collection, and highly secure local commerce. By using our platforms, you agree to the terms outlined below.",
            introBox: "Continuous Improvement: We continuously build security patches, fix bugs, and push updates across all our systems to ensure your safety. While Subhams Agent and PMMS are running flawlessly in production, please note that Subhams Hub is currently in an active developing stage, and you may experience frequent updates as we refine the local marketplace experience.",
            platformTitle: "2. Platform-Specific Privacy Rules",
            netTitle: "Subhams Networks",
            netList: [
                "No Accounts Required: The main informational site requires no sign-ups, no Google login, and no user accounts.",
                "No Data Collection: We do not collect or track personal visitor data.",
                "Contact Mechanism: The local web chat is used exclusively to send direct messages to the Administrator. Any information shared here is strictly for communication and is not stored."
            ],
            agentTitle: "Subhams Secure Agent",
            agentSub: "Strict 'Zero-Retention' Architecture:",
            agentList: [
                "For Customers: No sign-ups or phone permissions required. The temporary 'Name' you enter is held only locally on your device.",
                "High-Security Uploads: Documents and photos are heavily encrypted and sent directly to the Shop. Our servers do not store your files; the DB only receives a 'Job ID'.",
                "10-Minute Auto-Delete: Your files are automatically and permanently deleted from the Shop's queue after exactly 10 minutes, printed or not.",
                "For Shops: Owners must register via Email/Google and upload ID documents. Violating printing rules results in permanent deletion."
            ],
            pmmsTitle: "Subhams PMMS",
            pmmsList: [
                "Absolute Privacy: We do not send, share, or sell your financial data to anyone.",
                "Manual Entry Only: PMMS is a highly secure, closed-loop system processing only the specific numbers you manually input.",
                "Secure Access: Accounts are strictly protected via standard Email or Google Login authentication."
            ],
            hubTitle: "Subhams Hub",
            hubList: [
                "Localized Tracking Only: We request location solely to show nearby active shops. We do not track your location in the background after the app is closed. We do not build profiles based on your physical movements.",
                "Authentication: Users log in easily via Google. The platform natively supports both English and Telugu."
            ],
            crossTitle: "3. Cross-Ecosystem Security & Violation Rules",
            crossText: "To maintain a safe, fast, and high-quality environment for everyone, we enforce a strict Cross-Ecosystem Security Policy:",
            crossList: [
                "The Global Ban Rule: The Subhams Ecosystem is interconnected. If we find that you have committed a violation, engaged in fraud, or broken the rules on any single application, you will be blocked and permanently removed across the entire ecosystem. You will not be able to use Subhams Hub, Agent, PMMS, or any future services.",
                "No Exceptions: We prioritize the safety of our legitimate users and vendors. Rule-breakers are removed instantly to preserve platform integrity."
            ],
            infraTitle: "4. Third-Party Infrastructure & Liability Disclaimer",
            infraText: "To provide high-speed, secure, and reliable services, the Subhams Ecosystem is built using industry-leading third-party platforms:",
            liabilityTitle: "Limitation of Liability & Device Security",
            liabilityText1: "While Subhams Networks implements rigorous, state-of-the-art security measures on our servers, we are not responsible for the security of your personal device. If you install unknown files, malicious third-party apps, or hacks on your phone that result in your device, email, or accounts being compromised, Subhams Networks holds zero responsibility or liability.",
            liabilityText2: "Furthermore, by using our applications, you acknowledge that Subhams Networks is not legally or financially liable for upstream security breaches, server outages, or data leaks originating from the third-party infrastructure providers listed above.",
            contactTitle: "Have Questions About Your Privacy?",
            contactBtn: "Message Administrator",
            footer: "© 2026 Subhams Networks. All rights reserved."
        },
        te: {
            back: "వెనుకకు",
            title: "సుభమ్స్ నెట్‌వర్క్స్ గోప్యతా విధానం & సేవా నిబంధనలు",
            subtitle: "ప్రభావ తేదీ: అక్టోబర్ 2026 | మొత్తం సుభమ్స్ ఎకోసిస్టమ్‌కు వర్తిస్తుంది",
            introTitle: "1. పరిచయం",
            introText: "సుభమ్స్ నెట్‌వర్క్స్ ఎకోసిస్టమ్‌కు స్వాగతం. వినియోగదారులకు వేగవంతమైన పనితీరును మరియు ఉత్తమమైన అవుట్‌పుట్‌ను అందించడమే మా అంతిమ లక్ష్యం. మేము కఠినమైన డేటా గోప్యత, కనిష్ట డేటా సేకరణ మరియు అత్యంత సురక్షితమైన స్థానిక వాణిజ్యాన్ని విశ్వసిస్తాము. మా ప్లాట్‌ఫారమ్‌లను ఉపయోగించడం ద్వారా, మీరు దిగువ పేర్కొన్న నిబంధనలకు అంగీకరిస్తున్నారు.",
            introBox: "నిరంతర అభివృద్ధి: మీ భద్రతను నిర్ధారించడానికి మేము నిరంతరం భద్రతా ప్యాచ్‌లను నిర్మిస్తాము, బగ్‌లను పరిష్కరిస్తాము మరియు మా అన్ని సిస్టమ్‌లలో అప్‌డేట్‌లను పంపుతాము. సుభమ్స్ ఏజెంట్ మరియు PMMS ఉత్పత్తిలో దోషరహితంగా రన్ అవుతున్నప్పటికీ, సుభమ్స్ హబ్ ప్రస్తుతం చురుకైన అభివృద్ధి దశలో ఉందని దయచేసి గమనించండి మరియు మేము స్థానిక మార్కెట్‌ప్లేస్ అనుభవాన్ని మెరుగుపరుస్తున్నందున మీరు తరచుగా అప్‌డేట్‌లను అనుభవించవచ్చు.",
            platformTitle: "2. ప్లాట్‌ఫారమ్-నిర్దిష్ట గోప్యతా నియమాలు",
            netTitle: "సుభమ్స్ నెట్‌వర్క్స్",
            netList: [
                "ఖాతాలు అవసరం లేదు: ప్రధాన సమాచార సైట్‌కు సైన్-అప్‌లు, Google లాగిన్ మరియు వినియోగదారు ఖాతాలు అవసరం లేదు.",
                "డేటా సేకరణ లేదు: మేము వ్యక్తిగత సందర్శకుల డేటాను సేకరించము లేదా ట్రాక్ చేయము.",
                "సంప్రదింపు యంత్రాంగం: స్థానిక వెబ్ చాట్ అడ్మినిస్ట్రేటర్‌కు నేరుగా సందేశాలను పంపడానికి ప్రత్యేకంగా ఉపయోగించబడుతుంది. ఇక్కడ భాగస్వామ్యం చేయబడిన ఏదైనా సమాచారం ఖచ్చితంగా కమ్యూనికేషన్ కోసం మాత్రమే మరియు నిల్వ చేయబడదు."
            ],
            agentTitle: "సుభమ్స్ సెక్యూర్ ఏజెంట్",
            agentSub: "కఠినమైన 'జీరో-రిటెన్షన్' ఆర్కిటెక్చర్:",
            agentList: [
                "కస్టమర్ల కోసం: సైన్-అప్‌లు లేదా ఫోన్ అనుమతులు అవసరం లేదు. మీరు నమోదు చేసే తాత్కాలిక 'పేరు' మీ పరికరంలో స్థానికంగా మాత్రమే ఉంచబడుతుంది.",
                "హై-సెక్యూరిటీ అప్‌లోడ్‌లు: పత్రాలు మరియు ఫోటోలు భారీగా గుప్తీకరించబడతాయి మరియు నేరుగా షాప్‌కి పంపబడతాయి. మా సర్వర్లు మీ ఫైల్‌లను నిల్వ చేయవు; DB కేవలం 'జాబ్ ID'ని మాత్రమే స్వీకరిస్తుంది.",
                "10-నిమిషాల స్వీయ-తొలగింపు: మీ ఫైల్‌లు సరిగ్గా 10 నిమిషాల తర్వాత షాప్ క్యూ నుండి స్వయంచాలకంగా మరియు శాశ్వతంగా తొలగించబడతాయి, ప్రింట్ చేయబడినా లేదా చేయకపోయినా.",
                "షాపుల కోసం: యజమానులు ఇమెయిల్/Google ద్వారా నమోదు చేసుకోవాలి మరియు ID పత్రాలను అప్‌లోడ్ చేయాలి. ప్రింటింగ్ నియమాలను ఉల్లంఘిస్తే శాశ్వతంగా తొలగించబడుతుంది."
            ],
            pmmsTitle: "సుభమ్స్ PMMS",
            pmmsList: [
                "సంపూర్ణ గోప్యత: మేము మీ ఆర్థిక డేటాను ఎవరికీ పంపము, భాగస్వామ్యం చేయము లేదా విక్రయించము.",
                "మాన్యువల్ ఎంట్రీ మాత్రమే: PMMS అనేది మీరు మాన్యువల్‌గా ఇన్‌పుట్ చేసే నిర్దిష్ట సంఖ్యలను మాత్రమే ప్రాసెస్ చేసే అత్యంత సురక్షితమైన, క్లోజ్డ్-లూప్ సిస్టమ్.",
                "సురక్షిత యాక్సెస్: ఖాతాలు ప్రామాణిక ఇమెయిల్ లేదా Google లాగిన్ ప్రమాణీకరణ ద్వారా ఖచ్చితంగా రక్షించబడతాయి."
            ],
            hubTitle: "సుభమ్స్ హబ్",
            hubList: [
                "స్థానికీకరించిన ట్రాకింగ్ మాత్రమే: సమీపంలోని యాక్టివ్ షాపులను చూపించడానికి మాత్రమే మేము స్థానాన్ని అభ్యర్థిస్తాము. యాప్ మూసివేయబడిన తర్వాత మేము నేపథ్యంలో మీ స్థానాన్ని ట్రాక్ చేయము. మేము మీ భౌతిక కదలికల ఆధారంగా ప్రొఫైల్‌లను నిర్మించము.",
                "ప్రామాణీకరణ: వినియోగదారులు Google ద్వారా సులభంగా లాగిన్ చేయవచ్చు. ప్లాట్‌ఫారమ్ స్థానికంగా ఇంగ్లీష్ మరియు తెలుగు రెండింటికీ మద్దతు ఇస్తుంది."
            ],
            crossTitle: "3. క్రాస్-ఎకోసిస్టమ్ సెక్యూరిటీ & ఉల్లంఘన నియమాలు",
            crossText: "అందరికీ సురక్షితమైన, వేగవంతమైన మరియు అధిక-నాణ్యత వాతావరణాన్ని నిర్వహించడానికి, మేము కఠినమైన క్రాస్-ఎకోసిస్టమ్ సెక్యూరిటీ విధానాన్ని అమలు చేస్తాము:",
            crossList: [
                "గ్లోబల్ బాన్ రూల్: సుభమ్స్ ఎకోసిస్టమ్ ఒకదానికొకటి అనుసంధానించబడి ఉంది. మీరు ఉల్లంఘనకు పాల్పడినట్లు, మోసానికి పాల్పడినట్లు లేదా ఏదైనా ఒక్క అప్లికేషన్‌లో నిబంధనలను ఉల్లంఘించినట్లు మేము గుర్తిస్తే, మీరు బ్లాక్ చేయబడతారు మరియు మొత్తం పర్యావరణ వ్యవస్థ అంతటా శాశ్వతంగా తీసివేయబడతారు. మీరు సుభమ్స్ హబ్, ఏజెంట్, PMMS లేదా భవిష్యత్తులో ఎలాంటి సేవలను ఉపయోగించలేరు.",
                "మినహాయింపులు లేవు: మేము మా చట్టబద్ధమైన వినియోగదారులు మరియు విక్రేతల భద్రతకు ప్రాధాన్యతనిస్తాము. ప్లాట్‌ఫారమ్ సమగ్రతను కాపాడేందుకు నిబంధనలను ఉల్లంఘించే వారు తక్షణమే తొలగించబడతారు."
            ],
            infraTitle: "4. థర్డ్-పార్టీ ఇన్‌ఫ్రాస్ట్రక్చర్ & లయబిలిటీ డిస్‌క్లైమర్",
            infraText: "హై-స్పీడ్, సురక్షితమైన మరియు విశ్వసనీయమైన సేవలను అందించడానికి, పరిశ్రమలో ప్రముఖమైన థర్డ్-పార్టీ ప్లాట్‌ఫారమ్‌లను ఉపయోగించి సుభమ్స్ ఎకోసిస్టమ్ నిర్మించబడింది:",
            liabilityTitle: "బాధ్యత పరిమితి & పరికర భద్రత",
            liabilityText1: "సుభమ్స్ నెట్‌వర్క్‌లు మా సర్వర్‌లపై కఠినమైన, అత్యాధునిక భద్రతా చర్యలను అమలు చేస్తున్నప్పటికీ, మీ వ్యక్తిగత పరికరం యొక్క భద్రతకు మేము బాధ్యత వహించము. మీరు తెలియని ఫైల్‌లు, హానికరమైన థర్డ్-పార్టీ యాప్‌లు లేదా మీ పరికరం, ఇమెయిల్ లేదా ఖాతాలు రాజీపడేలా మీ ఫోన్‌లో హ్యాక్‌లను ఇన్‌స్టాల్ చేస్తే, సుభమ్స్ నెట్‌వర్క్‌లు సున్నా బాధ్యత వహిస్తాయి.",
            liabilityText2: "అంతేకాకుండా, మా అప్లికేషన్‌లను ఉపయోగించడం ద్వారా, పైన జాబితా చేయబడిన థర్డ్-పార్టీ ఇన్‌ఫ్రాస్ట్రక్చర్ ప్రొవైడర్ల నుండి ఉత్పన్నమయ్యే అప్‌స్ట్రీమ్ భద్రతా ఉల్లంఘనలు, సర్వర్ అంతరాయాలు లేదా డేటా లీక్‌లకు సుభమ్స్ నెట్‌వర్క్‌లు చట్టబద్ధంగా లేదా ఆర్థికంగా బాధ్యత వహించవని మీరు అంగీకరిస్తున్నారు.",
            contactTitle: "మీ గోప్యత గురించి సందేహాలు ఉన్నాయా?",
            contactBtn: "అడ్మినిస్ట్రేటర్‌కు సందేశం పంపండి",
            footer: "© 2026 సుభమ్స్ నెట్‌వర్క్‌లు. అన్ని హక్కులు ప్రత్యేకించబడినవి."
        }
    };

    const t = content[lang];

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <button style={styles.backBtn} onClick={() => window.history.back()}>
                        <ArrowLeft size={18} /> {t.back}
                    </button>
                    <div style={styles.brandTitle}>
                        <ShieldCheck size={28} color="#facc15" />
                        <h1 style={styles.mainHeading}>SUBHAMS NETWORKS</h1>
                    </div>
                    <button 
                        style={styles.langBtn} 
                        onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
                    >
                        <Languages size={18} /> {lang === 'en' ? 'తెలుగు' : 'English'}
                    </button>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.titleBanner}>
                    <h2 style={styles.bannerTitle}>{t.title}</h2>
                    <p style={styles.bannerSubtitle}>{t.subtitle}</p>
                </div>

                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}><Info size={20} color="#2563eb" /> {t.introTitle}</h3>
                    <p style={styles.text}>{t.introText}</p>
                    <div style={styles.infoBox}>
                        {t.introBox.split(':').map((part, i) => (
                            <React.Fragment key={i}>
                                {i === 0 ? <strong>{part}:</strong> : part}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}><Lock size={20} color="#2563eb" /> {t.platformTitle}</h3>
                    
                    <div style={styles.grid}>
                        <div style={styles.appCard}>
                            <div style={styles.appCardHeader}>
                                <Globe size={24} color="#3b82f6" />
                                <h4 style={styles.appCardTitle}>{t.netTitle}</h4>
                            </div>
                            <ul style={styles.list}>
                                {t.netList.map((item, i) => {
                                    const [bold, rest] = item.split(': ');
                                    return <li key={i}><strong>{bold}:</strong> {rest}</li>;
                                })}
                            </ul>
                        </div>

                        <div style={styles.appCard}>
                            <div style={styles.appCardHeader}>
                                <Printer size={24} color="#d97706" />
                                <h4 style={styles.appCardTitle}>{t.agentTitle}</h4>
                            </div>
                            <p style={styles.subText}><em>{t.agentSub}</em></p>
                            <ul style={styles.list}>
                                {t.agentList.map((item, i) => {
                                    const [bold, rest] = item.split(': ');
                                    return <li key={i}><strong>{bold}:</strong> {rest}</li>;
                                })}
                            </ul>
                        </div>

                        <div style={styles.appCard}>
                            <div style={styles.appCardHeader}>
                                <PieChart size={24} color="#16a34a" />
                                <h4 style={styles.appCardTitle}>{t.pmmsTitle}</h4>
                            </div>
                            <ul style={styles.list}>
                                {t.pmmsList.map((item, i) => {
                                    const [bold, rest] = item.split(': ');
                                    return <li key={i}><strong>{bold}:</strong> {rest}</li>;
                                })}
                            </ul>
                        </div>

                        <div style={styles.appCard}>
                            <div style={styles.appCardHeader}>
                                <Store size={24} color="#db2777" />
                                <h4 style={styles.appCardTitle}>{t.hubTitle}</h4>
                            </div>
                            <ul style={styles.list}>
                                {t.hubList.map((item, i) => {
                                    const [bold, rest] = item.split(': ');
                                    return <li key={i}><strong>{bold}:</strong> {rest}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                </section>

                <section style={styles.section}>
                    <div style={styles.warningCard}>
                        <div style={styles.warningHeader}>
                            <AlertTriangle size={24} color="#dc2626" />
                            <h3 style={styles.warningTitle}>{t.crossTitle}</h3>
                        </div>
                        <p style={styles.text}>{t.crossText}</p>
                        <ul style={styles.list}>
                            {t.crossList.map((item, i) => {
                                const [bold, rest] = item.split(': ');
                                return <li key={i}><strong>{bold}:</strong> {rest}</li>;
                            })}
                        </ul>
                    </div>
                </section>

                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}><Server size={20} color="#2563eb" /> {t.infraTitle}</h3>
                    <p style={styles.text}>{t.infraText}</p>
                    <div style={styles.techTags}>
                        <span style={styles.tag}>Google</span>
                        <span style={styles.tag}>MongoDB</span>
                        <span style={styles.tag}>Neon DB</span>
                        <span style={styles.tag}>Render</span>
                        <span style={styles.tag}>Vercel</span>
                        <span style={styles.tag}>Brevo</span>
                        <span style={styles.tag}>GitHub</span>
                        <span style={styles.tag}>VS Code</span>
                    </div>
                    
                    <div style={styles.liabilityBox}>
                        <h4 style={styles.liabilityTitle}>{t.liabilityTitle}</h4>
                        <p style={styles.text}>{t.liabilityText1}</p>
                        <p style={styles.text}>{t.liabilityText2}</p>
                    </div>
                </section>

                {/* 🟢 NEW ROUTING SECTION TO ADMIN CHAT */}
                <section style={{ textAlign: 'center', marginTop: '50px', padding: '30px', backgroundColor: '#e0e7ff', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '20px' }}>{t.contactTitle}</h3>
                    <button 
                        onClick={() => navigate('/#contact')} 
                        style={styles.contactBtn}
                    >
                        <MessageSquare size={18} /> {t.contactBtn}
                    </button>
                </section>

                <footer style={styles.footer}>
                    <p>{t.footer}</p>
                </footer>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' },
    header: { backgroundColor: '#0f172a', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    headerContent: { maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: '600', fontSize: '14px', padding: 0 },
    brandTitle: { display: 'flex', alignItems: 'center', gap: '8px' },
    mainHeading: { color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '1px' },
    langBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: '0.2s' },
    container: { maxWidth: '900px', margin: '30px auto', padding: '0 20px' },
    titleBanner: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', borderLeft: '6px solid #2563eb' },
    bannerTitle: { margin: '0 0 10px 0', fontSize: '28px', color: '#0f172a', fontWeight: '900' },
    bannerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    section: { marginBottom: '40px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px', color: '#1e293b', fontWeight: '800', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' },
    text: { fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '15px' },
    infoBox: { backgroundColor: '#eff6ff', padding: '15px 20px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    appCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    appCardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    appCardTitle: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' },
    subText: { fontSize: '13px', color: '#64748b', margin: '0 0 10px 0', fontWeight: '600' },
    list: { margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' },
    warningCard: { backgroundColor: '#fef2f2', padding: '25px', borderRadius: '16px', border: '1px solid #fecaca' },
    warningHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    warningTitle: { margin: 0, fontSize: '20px', fontWeight: '900', color: '#991b1b' },
    techTags: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' },
    tag: { backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #cbd5e1' },
    liabilityBox: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    liabilityTitle: { margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' },
    contactBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '10px' },
    footer: { textAlign: 'center', paddingTop: '30px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }
};

export default LegalPolicy;