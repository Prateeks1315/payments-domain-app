import { useState, memo, useEffect, useRef } from "react";

const C = {
  bg: '#070b14', surface: '#0d1320', surface2: '#111827', border: '#1a2540',
  cyan: '#00e5ff', gold: '#ffd700', green: '#00ff88', orange: '#ff6b35',
  purple: '#a855f7', pink: '#ec4899', teal: '#2dd4bf', red: '#ff3b3b',
  blue: '#3b82f6', lime: '#84cc16', text: '#e0e8ff', muted: '#7080a0',
};

/* ─── Reusable primitives ─── */
const Tag = ({ label, color }) => (
  <span style={{ background:`${color}12`, border:`1px solid ${color}28`, borderRadius:'4px', padding:'3px 9px', fontSize:'11.5px', color:'#c8d8f0', display:'inline-block', margin:'2px' }}>{label}</span>
);

const SectionCard = ({ title, color, icon, children, noPad }) => (
  <div style={{ background:C.surface, border:`1px solid ${color}25`, borderRadius:'12px', padding: noPad ? '0' : '20px', marginBottom:'16px', boxShadow:`0 0 24px ${color}08` }}>
    {title && (
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', paddingBottom:'12px', padding: noPad ? '16px 20px 12px' : undefined, borderBottom:`1px solid ${color}18` }}>
        <span style={{ fontSize:'18px' }}>{icon}</span>
        <span style={{ color, fontWeight:'700', fontSize:'14px', letterSpacing:'0.5px' }}>{title}</span>
      </div>
    )}
    <div style={{ padding: noPad ? '0 20px 20px' : undefined }}>{children}</div>
  </div>
);

const RichTable = ({ headers, rows, colColors }) => (
  <div style={{ overflowX:'auto', marginTop:'8px' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px', minWidth: `${headers.length * 120}px` }}>
      <thead>
        <tr style={{ borderBottom:`1px solid ${C.border}` }}>
          {headers.map((h,i) => (
            <th key={i} style={{ padding:'10px 12px', textAlign:'left', color: colColors?.[i] || C.muted, fontSize:'11px', fontWeight:'700', background:'#08101e', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ borderBottom:`1px solid #0d1520`, background: ri%2===0 ? 'transparent' : 'rgba(255,255,255,0.008)' }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding:'10px 12px', color: ci===0 ? (colColors?.[0] || C.cyan) : '#b8c8e0', fontSize:'12px', fontWeight: ci===0 ? '600' : '400', verticalAlign:'top', lineHeight:'1.5' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BANote = ({ text, color = C.gold }) => (
  <div style={{ display:'flex', gap:'10px', padding:'12px 16px', background:`${color}09`, border:`1px solid ${color}25`, borderRadius:'8px', marginTop:'12px' }}>
    <span style={{ fontSize:'16px', flexShrink:0 }}>📌</span>
    <span style={{ color:'#c8d8e8', fontSize:'12px', lineHeight:'1.6' }}><strong style={{ color }}>BA Note: </strong>{text}</span>
  </div>
);

const Insight = ({ text, color = C.cyan }) => (
  <div style={{ display:'flex', gap:'10px', padding:'10px 14px', background:`${color}08`, border:`1px solid ${color}20`, borderRadius:'7px', marginTop:'8px' }}>
    <span style={{ fontSize:'14px', flexShrink:0 }}>💡</span>
    <span style={{ color:'#b8cce0', fontSize:'11.5px', lineHeight:'1.55' }}>{text}</span>
  </div>
);

const FlowRow = ({ steps, color }) => (
  <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'6px', margin:'10px 0' }}>
    {steps.map((s,i) => (
      <span key={i} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <span style={{ padding:'7px 14px', background:`${color}10`, border:`1px solid ${color}30`, borderRadius:'8px', color, fontWeight:'600', fontSize:'12px', whiteSpace:'nowrap' }}>{s}</span>
        {i < steps.length-1 && <span style={{ color:C.muted, fontSize:'18px', lineHeight:'1' }}>→</span>}
      </span>
    ))}
  </div>
);

const TreeNode = memo(({ node, depth=0 }) => {
  const [open, setOpen] = useState(depth < 2);
  const has = node.children?.length > 0;
  const clr = depth===0 ? C.gold : depth===1 ? C.cyan : depth===2 ? C.teal : C.text;
  const fz = depth===0 ? '15px' : depth===1 ? '13.5px' : '12.5px';
  return (
    <div style={{ marginLeft:depth>0?'18px':'0', borderLeft:depth>0?`1px solid ${C.border}`:'none' }}>
      <div onClick={() => has && setOpen(!open)}
        style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'5px 8px', margin:'2px 0', borderRadius:'5px', cursor:has?'pointer':'default' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(0,229,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
        <span style={{ color:C.muted, fontSize:'11px', marginTop:'3px', minWidth:'12px', flexShrink:0 }}>
          {has ? (open?'▼':'▶') : '—'}
        </span>
        <div>
          <span style={{ color:clr, fontWeight:depth<2?'600':'400', fontSize:fz }}>{node.label}</span>
          {node.def && <span style={{ color:C.muted, fontSize:'11.5px', marginLeft:'8px' }}>· {node.def}</span>}
        </div>
      </div>
      {has && open && node.children.map((c,i) => <TreeNode key={c.label||i} node={c} depth={depth+1} />)}
    </div>
  );
});

const PhaseStep = ({ num, title, color, body, tags, connector=true }) => (
  <div style={{ display:'flex', alignItems:'stretch' }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'52px', flexShrink:0 }}>
      <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`${color}20`, border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color, fontSize:'14px', zIndex:1 }}>{num}</div>
      {connector && <div style={{ width:'2px', flex:1, minHeight:'32px', background:`${color}40`, margin:'3px 0' }} />}
    </div>
    <div style={{ flex:1, marginLeft:'12px', marginBottom:connector?'8px':'0', background:`${color}07`, border:`1px solid ${color}22`, borderRadius:'8px', padding:'14px 16px' }}>
      <div style={{ fontWeight:'700', color, fontSize:'13px', marginBottom:'8px' }}>{title}</div>
      {body && <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'8px' }}>{body}</p>}
      {tags && <div style={{ display:'flex', flexWrap:'wrap' }}>{tags.map((t,i) => <Tag key={i} label={t} color={color} />)}</div>}
    </div>
  </div>
);

const TABS = [
  '🗺 Domain Tree','👥 Ecosystem & Types','🚆 India Rails',
  '💳 Card Lifecycle','⚡ UPI Deep Dive','🔌 Gateway & Tech',
  '🧭 User Journey','⚖️ Risk & Disputes','📒 Ledger & Fees',
  '🧪 Simulator','📊 Comparison Matrix'
];

export default function App() {
  const [tab, setTab] = useState(0);
  const [simMethod, setSimMethod] = useState('card');
  const [simStep, setSimStep] = useState(-1);
  const [simRunning, setSimRunning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const simRef = useRef(null);
  const activeStepRef = useRef(null);

  useEffect(() => {
    if (!simRunning || !autoPlay) return;
    const SIM_LENGTHS = { card:9, upi:8, netbanking:8, wallet:7 };
    const total = SIM_LENGTHS[simMethod] || 9;
    if (simStep >= total-1) { setSimRunning(false); return; }
    const t = setTimeout(() => setSimStep(s => s+1), 1600);
    return () => clearTimeout(t);
  }, [simStep, simRunning, autoPlay, simMethod]);

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, [simStep]);

  /* ─── DATA ─── */
  const domainTree = {
    label:'🏦 PAYMENTS DOMAIN', def:'Move money securely, instantly, compliantly between any two parties',
    children:[
      { label:'👥 ECOSYSTEM PLAYERS', def:'Every actor in the payment chain',
        children:[
          { label:'Cardholder / Payer', def:'Person initiating payment — swipes card, scans QR, enters OTP' },
          { label:'Merchant / Payee', def:'Business receiving payment — has acquiring bank relationship' },
          { label:'Issuing Bank', def:'Customer\'s bank — issues card/account, approves/declines transaction (HDFC, SBI, ICICI)' },
          { label:'Acquiring Bank', def:'Merchant\'s bank — acquires payment on behalf of merchant (Axis, ICICI, Yes Bank)' },
          { label:'Payment Gateway', def:'Technology layer — encrypts & routes transaction data from merchant checkout (Razorpay, PayU)' },
          { label:'Payment Processor', def:'Backend engine — manages connections between gateway, acquirer, and issuer (FIS, Worldline)' },
          { label:'Card Network', def:'Scheme operator — routes between issuer & acquirer, sets rules, earns scheme fees (Visa, MC, RuPay)' },
          { label:'Payment Aggregator (PA)', def:'Aggregates many merchants under one platform; RBI-licensed; holds funds in nodal account' },
          { label:'PSP (Payment Service Provider)', def:'Combines gateway + processor + acquiring — full payments stack for merchants (Adyen, PayU)' },
          { label:'NPCI', def:'National Payments Corp of India — operates UPI, IMPS, RuPay, NACH, AePS, BBPS, FASTag' },
          { label:'TPAP', def:'Third Party App Provider — front-end UPI apps (PhonePe, GPay, Paytm); cannot hold money' },
          { label:'PSP Bank', def:'Bank sponsoring TPAP — provides banking infrastructure to TPAP (Yes Bank→PhonePe, Axis→GPay)' },
          { label:'RBI', def:'Central bank regulator — sets policy, licensing, compliance rules for all payment systems' },
        ]
      },
      { label:'💳 PAYMENT INSTRUMENTS',
        children:[
          { label:'CARDS', children:[
            { label:'Credit Card', def:'Post-paid revolving credit; Visa/MC/RuPay/Amex; MDR 1.5–3%' },
            { label:'Debit Card', def:'Directly linked to bank account; RuPay/Visa Debit; zero MDR for RuPay P2M' },
            { label:'Prepaid Card (PPI)', def:'Pre-loaded value; gift cards, forex cards; ₹10K–₹2L limit by KYC tier' },
            { label:'Corporate Card', def:'Business expense management; spend controls per employee' },
          ]},
          { label:'UPI', children:[
            { label:'UPI Pay (Push)', def:'Payer scans QR or enters VPA — most common (85% of UPI volume)' },
            { label:'UPI Collect (Pull)', def:'Payee sends collect request to payer — used in eCommerce checkout' },
            { label:'UPI AutoPay (Mandates)', def:'Recurring auto-debit; OTT, EMI, SIP; no action each cycle; max cap + frequency set once' },
            { label:'UPI Lite', def:'Offline on-device wallet; up to ₹500; no internet; no PIN; NFC-based' },
            { label:'RuPay Credit on UPI', def:'Credit card linked to UPI VPA; MDR applies (NOT zero); T+1/T+2 settlement' },
            { label:'UPI Reserve Pay (2025)', def:'Block up to ₹10K for 90 days for multiple future payments' },
            { label:'PSBL (Pre-Sanctioned Credit Line)', def:'Bank-approved credit limit accessed via UPI — no physical card issued' },
          ]},
          { label:'NET BANKING', children:[
            { label:'Retail Net Banking', def:'Browser redirect to bank portal; User ID + IPIN + OTP; Bank assigns BRN' },
            { label:'Corporate Net Banking', def:'Maker-Checker dual approval; hardware token OTP; bulk NEFT/RTGS upload' },
          ]},
          { label:'WALLETS (PPI)', children:[
            { label:'Min-KYC Wallet', def:'Up to ₹10K balance; P2P blocked; merchant payments only' },
            { label:'Full-KYC Wallet', def:'Up to ₹2L balance; P2P allowed; all features (Paytm, Amazon Pay, PhonePe Wallet)' },
          ]},
          { label:'BNPL (Buy Now Pay Later)', def:'Deferred credit; regulated under RBI DLEG 2022; LazyPay, Simpl, ZestMoney; 15–90 day tenure' },
          { label:'NACH / eNACH', def:'Recurring mandate-based auto-debit; EMIs, SIPs, utility bills; set once, auto-debit monthly' },
        ]
      },
      { label:'🔄 PAYMENT TYPES BY NATURE',
        children:[
          { label:'P2P — Person to Person', def:'UPI transfers, wallet to wallet, IMPS, friend payments' },
          { label:'P2M — Person to Merchant', def:'Retail checkout, Swiggy payment, eCommerce — most common in volume' },
          { label:'B2B — Business to Business', def:'Vendor payments, invoice settlement, corporate bulk transfers' },
          { label:'G2P — Government to Person', def:'DBT, PM-KISAN subsidies — via NACH/UPI to Aadhaar-linked accounts' },
          { label:'P2G — Person to Government', def:'Tax payments, challans, license fees — via BBPS/Net Banking' },
          { label:'C2B — Consumer to Business', def:'Utility bills, EMI collections, SaaS subscriptions' },
        ]
      },
      { label:'📍 CHANNELS',
        children:[
          { label:'POS Terminal', def:'Card swipe / chip dip / contactless NFC tap at physical store (Card Present)' },
          { label:'eCommerce / CNP', def:'Online checkout — Card Not Present; 3DS2 OTP mandatory in India' },
          { label:'Mobile App / UPI', def:'BHIM, PhonePe, GPay, banking apps — VPA or QR-based' },
          { label:'ATM', def:'Cash withdrawal, fund transfers (NEFT/IMPS), balance inquiry' },
          { label:'USSD (*99#)', def:'Feature phone banking for unbanked India — no internet needed' },
          { label:'QR Code', def:'Static QR (printed at shop) vs Dynamic QR (generated per transaction)' },
          { label:'Micro ATM / Business Correspondent', def:'Card swipe device at BC outlet for rural banking and cash withdrawal' },
          { label:'IVR', def:'Interactive Voice Response payment — phone-based for less-digital users' },
        ]
      },
      { label:'⚙️ GATEWAY ARCHITECTURE (5 LAYERS)',
        children:[
          { label:'Layer 1 — Client', def:'Web/Mobile SDK, Hosted Checkout, Tokenization SDK, QR generation, Device fingerprint' },
          { label:'Layer 2 — API', def:'REST APIs, OAuth 2.0 + JWT, Idempotency Keys, Webhooks, Rate limiting, Throttling' },
          { label:'Layer 3 — Processing Engine', def:'Validation + BIN lookup + Luhn, Smart Routing, Fraud/Risk Engine, 3DS Handler, Auth Handler' },
          { label:'Layer 4 — External Integrations', def:'Acquirer Bank (ISO 8583), Card Networks (VisaNet/Banknet/RuPay), NPCI Switch, Wallets, NACH' },
          { label:'Layer 5 — Post-Processing', def:'Settlement Engine, Reconciliation, Double-Entry Ledger, Reporting, Dispute Management' },
        ]
      },
      { label:'🛡️ SECURITY & COMPLIANCE',
        children:[
          { label:'PCI DSS', def:'12 requirements across 6 goals; Level 1–4 by volume; no CVV/PAN storage post-auth' },
          { label:'3D Secure 2.0', def:'Authentication protocol for CNP; frictionless (low-risk) or challenge (high-risk)' },
          { label:'Tokenization (RBI CoF Mandate)', def:'Network DPAN / Gateway token replaces raw PAN; mandatory for card-on-file since Oct 2022' },
          { label:'RBI PA/PG Guidelines', def:'PA licensing; nodal account for all merchant funds; merchant KYC; daily reconciliation' },
          { label:'AML / KYC / UBO', def:'Anti-Money Laundering; OFAC/UN/domestic sanctions screening; UBO >25% stake disclosure' },
          { label:'DPDP Act 2023', def:'India data protection: consent, minimization, right to erasure, penalties up to ₹250 crore' },
          { label:'RBA Framework (2026)', def:'Risk-based authentication replaces mandatory OTP-only 2FA; effective April 1, 2026' },
        ]
      },
      { label:'📊 SETTLEMENT & RECONCILIATION',
        children:[
          { label:'DNS — Deferred Net Settlement', def:'NEFT/Card batch: multiple transactions netted into one payout amount' },
          { label:'Gross Settlement (RTGS)', def:'Each transaction settled individually and immediately — no netting' },
          { label:'Real-time Settlement (UPI)', def:'T=0 instant settlement; no batch cycle; Remitter → NPCI → Beneficiary in seconds' },
          { label:'T+1 / T+2 / T+3 Settlement', def:'Card standard cycles — T+1 is premium/instant; T+3 is standard for smaller merchants' },
          { label:'Rolling Reserve', def:'5–10% of merchant GMV withheld 90–180 days as chargeback risk buffer' },
          { label:'Nodal Account', def:'RBI-mandated escrow for PAs — merchant funds held here until payout; daily recon required' },
        ]
      },
      { label:'🌐 ADVANCED / EMERGING',
        children:[
          { label:'Payment Orchestration', def:'Layer above gateways — smart routing, cascading failover, A/B testing, single API' },
          { label:'Account Aggregator (AA)', def:'RBI-licensed; consent-based financial data sharing between FIPs and FIUs; never stores data' },
          { label:'OCEN', def:'Open Credit Enablement Network — embedded lending at UPI payment touchpoints' },
          { label:'CBDC (e-Rupee)', def:'RBI digital Rupee; wholesale (interbank) and retail (consumer); offline NFC capable' },
          { label:'PayFac Model', def:'Master MID + sub-merchant MIDs; PayFac liable for sub-merchant fraud/chargebacks' },
          { label:'ISO 20022 Migration', def:'SWIFT coexistence ended Nov 2025; richer structured data; all Indian banks migrating' },
        ]
      },
    ]
  };

  /* ─── CARD PHASES ─── */
  const cardPhases = [
    { num:'1', title:'INITIATION', color:C.cyan, body:'Customer initiates payment — swipes/taps/dips card at POS, enters card details online (CNP), or scans QR. Payment instruction captured by merchant\'s POS terminal or Payment Gateway SDK.', tags:['Idempotency key generated (unique Txn ID)', 'Card Present (CP) vs Card Not Present (CNP)', 'NFC contactless / Chip & PIN / Magstripe', 'QR-triggered (UPI or dynamic QR)'] },
    { num:'2', title:'AUTHENTICATION', color:C.purple, body:'Before authorization, the identity of the payer is verified. 3D Secure 2.0 is mandatory in India for all online card transactions.', tags:['Card Present: PIN entry + EMV chip read', 'CNP Online: 3DS2 OTP (mandatory India)', 'Contactless <₹5K: no PIN required', 'UPI: 6-digit PIN + device binding', 'Biometric: fingerprint/face (2025, up to ₹5K)', 'ACS decides: Frictionless vs Challenge'] },
    { num:'3', title:'AUTHORIZATION', color:C.gold, body:'The "Can this payment happen?" phase — happens in 1–3 seconds. Funds are RESERVED (pre-auth hold), not yet debited.', tags:['Gateway encrypts card data → Acquirer', 'Acquirer → Card Network (Visa/MC/RuPay)', 'Card Network → Issuer Bank', 'Issuer checks: valid + balance + fraud score + 3DS', 'Code 00 = Approved | 51 = NSF | 91 = Issuer Unavailable (retryable)', 'Hold placed — funds RESERVED, not debited'] },
    { num:'4', title:'CAPTURE', color:C.green, body:'Merchant formally requests fund collection after goods/services delivered. Pre-auth expires in 7–30 days if no capture.', tags:['Immediate Capture: eCommerce (auth + capture together)', 'Delayed Capture: Hotels, car rentals (capture at checkout/return)', 'Partial Capture: ₹5K auth, ₹4.2K captured (partial delivery)', 'Void: Cancel auth before capture'] },
    { num:'5', title:'CLEARING', color:C.teal, body:'No money moves yet — the "reconcile the paperwork" phase. Merchant batches all authorized transactions typically end-of-day.', tags:['Merchant batches transactions (EOD)', 'Acquirer validates batch → Card Network', 'Network calculates interchange fees', 'Status: Clean (matched) / Bad (rejected) / Grey (investigation)', 'DNS — multiple transactions netted into one batch amount'] },
    { num:'6', title:'SETTLEMENT', color:C.orange, body:'The "move the actual money" phase. MDR is deducted at each step.', tags:['Issuer → Network (settlement bank) → Acquirer → Merchant bank', 'Interchange deducted at Issuer → Network step', 'MDR (Net) deducted at Acquirer → Merchant step', 'T+1 to T+3 for cards | Instant for UPI', 'Bank Reference Number (BRN) assigned'] },
    { num:'7', title:'RECONCILIATION', color:C.pink, body:'All systems verify their records match. Exception handling begins for any mismatches found.', tags:['Merchant: POS vs gateway vs bank statement', 'Acquirer: txns sent vs funds received from issuers', 'Detects: duplicates, missing, amount mismatches, timing', 'Exception report → Ops team → Investigation', 'MDR split verified; rolling reserve calculated'] },
  ];

  /* ─── UPI STEPS ─── */
  const upiSteps = [
    { num:1, actor:'📱 Customer (TPAP)', action:'Opens PhonePe/GPay · Scans merchant QR or enters VPA; confirms amount', tech:'UPI App / SDK', color:C.cyan },
    { num:2, actor:'📱 TPAP', action:'Decodes QR; displays "Pay ₹X to [Merchant]" confirmation; encrypts UPI PIN on-device', tech:'UPI 2.0 API', color:C.purple },
    { num:3, actor:'🏦 PSP Bank', action:'Receives debit request with encrypted PIN; routes to NPCI UPI Switch', tech:'ISO 8583 / UPI Protocol', color:C.gold },
    { num:4, actor:'🔀 NPCI Switch', action:'Validates VPA; routes to Remitter Bank; logs transaction in real-time', tech:'24×7 Real-time Switch', color:C.teal },
    { num:5, actor:'🏦 Remitter Bank', action:'Decrypts UPI PIN via HSM; checks balance; debits customer account', tech:'CBS + HSM', color:C.orange },
    { num:6, actor:'🔀 NPCI Switch', action:'Receives debit confirmation; routes credit instruction to Beneficiary Bank', tech:'T=0 Settlement', color:C.green },
    { num:7, actor:'🎯 Beneficiary Bank', action:'Credits merchant/payee account instantly; sends confirmation to NPCI', tech:'Core Banking System', color:C.teal },
    { num:8, actor:'📲 All Parties', action:'NPCI fires success/failure to both TPAPs; SMS + push notifications sent', tech:'Webhook / Push Notif', color:C.cyan },
  ];

  /* ─── SIMULATOR FLOWS ─── */
  const SIM_FLOWS = {
    card:[
      { actor:'🛒 Customer', action:'Enters card details at checkout · Merchant calls POST /v1/orders', color:C.cyan, tech:'Idempotency Key generated' },
      { actor:'🔐 Gateway', action:'Tokenizes PAN · Luhn check · BIN lookup · Initiates 3DS2 authentication', color:C.purple, tech:'TLS 1.3 Encryption' },
      { actor:'🏦 Issuer ACS', action:'Receives 100+ signals · Risk scored · Frictionless or Challenge decision', color:C.gold, tech:'3DS2 Protocol' },
      { actor:'📱 Customer', action:'Enters OTP (Challenge Flow) or auto-approved (Frictionless)', color:C.cyan, tech:'OTP / Biometric' },
      { actor:'🔀 Network', action:'Auth request routed: Gateway → Acquirer → Card Network → Issuer', color:C.teal, tech:'Visa/MC/RuPay Rail' },
      { actor:'🏦 Issuer Bank', action:'Checks balance + fraud score · Returns auth code 00 · Reserves funds (pre-auth)', color:C.orange, tech:'ISO 8583 Response' },
      { actor:'✅ Gateway', action:'Auth success · Payment captured · Webhook fires to merchant', color:C.green, tech:'payment.captured event' },
      { actor:'📦 Merchant', action:'Verifies webhook + GET /payments/{id} · Marks order PAID · Triggers fulfillment', color:C.gold, tech:'Server-side verify' },
      { actor:'🏦 Settlement', action:'EOD batch → MDR deducted → Net funds hit merchant bank (T+1)', color:C.teal, tech:'T+1 DNS Settlement' },
    ],
    upi:[
      { actor:'📱 Customer', action:'Opens PhonePe/GPay · Scans merchant QR code', color:C.cyan, tech:'UPI App / TPAP' },
      { actor:'📱 TPAP App', action:'Decodes QR · Extracts VPA + amount · Shows confirmation screen', color:C.purple, tech:'UPI SDK' },
      { actor:'🔑 Customer', action:'Enters 6-digit UPI PIN · Encrypted on-device via HSM-bound key', color:C.gold, tech:'HSM Encryption' },
      { actor:'🏦 PSP Bank', action:'Receives debit request · Routes to NPCI UPI Switch via UPI API', color:C.orange, tech:'UPI 2.0 API' },
      { actor:'🔀 NPCI Switch', action:'Validates VPA · Routes to remitter bank · Logs transaction', color:C.teal, tech:'24×7 Real-time Switch' },
      { actor:'🏦 Remitter Bank', action:'Decrypts PIN (HSM) · Verifies balance · Debits account instantly', color:C.red, tech:'CBS + HSM' },
      { actor:'🎯 Beneficiary Bank', action:'Receives credit instruction from NPCI · Credits merchant account', color:C.green, tech:'Real-time Credit' },
      { actor:'📲 All Parties', action:'NPCI sends success response · Both apps notified · SMS fired', color:C.cyan, tech:'T=0 Settlement' },
    ],
    netbanking:[
      { actor:'🛒 Customer', action:'Selects Net Banking · Picks bank (e.g. HDFC) · Clicks Pay', color:C.cyan, tech:'Merchant Checkout' },
      { actor:'🔀 Gateway', action:'Creates order server-side · Generates hash-signed redirect URL to bank portal', color:C.purple, tech:'HMAC-SHA256 signed URL' },
      { actor:'🌐 Browser', action:'Redirects to bank\'s NetBanking portal with merchant + amount params', color:C.gold, tech:'Browser Redirect (302)' },
      { actor:'🔑 Customer', action:'Enters Customer ID + IPIN + OTP at bank portal', color:C.cyan, tech:'2FA Authentication' },
      { actor:'🏦 Bank', action:'Authenticates user · Debits account immediately · Assigns BRN', color:C.orange, tech:'Bank Reference Number' },
      { actor:'🌐 Browser', action:'Bank redirects back to gateway callback URL with status + BRN + signed hash', color:C.teal, tech:'Redirect + Hash' },
      { actor:'🔀 Gateway', action:'Validates bank hash signature · Updates payment to captured · Fires webhook', color:C.green, tech:'Signature verification' },
      { actor:'📦 Merchant', action:'Calls GET /payments/{id} to verify status · NEVER trust callback params alone', color:C.gold, tech:'Server-side Verify ⚠️' },
    ],
    wallet:[
      { actor:'📱 Customer', action:'Opens app · Selects Paytm Wallet / Amazon Pay at checkout', color:C.cyan, tech:'Wallet SDK' },
      { actor:'💰 Wallet Platform', action:'Checks KYC tier · Validates balance ≥ order amount', color:C.purple, tech:'Balance API' },
      { actor:'🔑 Customer', action:'Authenticates with wallet PIN or biometric (skipped below ₹2K)', color:C.gold, tech:'Wallet PIN / Face ID' },
      { actor:'📒 Ledger', action:'Debits customer wallet account · Credits merchant payable account atomically', color:C.orange, tech:'Double-Entry Ledger' },
      { actor:'✅ Gateway', action:'Wallet platform sends success response · Gateway notifies merchant', color:C.green, tech:'payment.captured' },
      { actor:'📦 Merchant', action:'Verifies via GET API · Order confirmed · Fulfillment triggered', color:C.teal, tech:'Webhook verified' },
      { actor:'🏦 Settlement', action:'Wallet batches daily payments · Deducts MDR ~1.5–2% · NEFT to merchant bank', color:C.gold, tech:'T+1 Settlement' },
    ],
  };

  const simInsights = {
    card:['Idempotency key is generated NOW — retry-safe from this point forward','PAN never touches merchant servers — gateway tokenizes immediately before processing','Risk score computed here — 100+ signals in < 200ms; outcome decides frictionless or OTP','OTP is the last mile — 3DS ensures payer authentication; without it, merchant bears liability','Authorization ≠ debit — funds are only RESERVED at this point, not yet taken from account','Response code 00 = approved · 51 = insufficient funds · 91 = issuer unavailable (retryable, soft decline)','Webhook is the source of truth — NEVER trust frontend callback alone; it can be faked or arrive late','Always call GET /payments/{id} server-side before fulfilling order — the only verified state','MDR deducted at settlement — gross amount minus fees = net credited to merchant bank account'],
    upi:['VPA masks real bank account — payer shares no sensitive data with merchant at any point','QR decoding reveals VPA + amount + merchant name; customer verifies before committing','PIN never leaves the device in plaintext — end-to-end encrypted via HSM-bound key','PSP bank is the UPI handle host — routes debit request via NPCI infrastructure','NPCI switch is the brain — validates VPA, routes, logs every UPI transaction','Remitter bank does the actual balance check and debit — CBS + HSM involvement here','Beneficiary credit is instant — no T+1 cycle for UPI unlike card settlement','T=0 settlement — money moves in real-time unlike card T+1/T+2 batch cycle'],
    netbanking:['Gateway creates server-side order first — amount is tamper-proof from client tampering','Hash-signed URL prevents parameter manipulation; attacker cannot change amount in URL','Browser redirect means gateway is NOT in the authentication loop — bank handles 2FA directly','Customer authenticates DIRECTLY at bank portal — gateway never sees credentials','Bank debits IMMEDIATELY on confirmation — no pre-auth hold unlike card payments','BRN (Bank Reference Number) is the key reconciliation reference — map to internal transaction ID','Hash verification is MANDATORY — reject any callback with invalid hash (security requirement)','⚠️ MOST CRITICAL: Always verify via GET /payments/{id} — callback alone is NOT reliable'],
    wallet:['KYC tier gate happens FIRST — Min-KYC blocks P2P; system must check before any debit','Balance check before auth — show shortfall options (top-up / split payment) before error','PIN skip threshold: below ₹2K, wallet may skip PIN for frictionless UX (configurable)','Ledger entries are atomic — debit + credit happen together or not at all (ACID compliance)','Merchant gets notified via gateway webhook — wallet platform → gateway → merchant','Always verify order via GET API before fulfillment — webhook can arrive out of order','MDR ~1.5–2% IS deducted at settlement — unlike UPI zero MDR; wallet cost model differs'],
  };

  const journeyData = {
    upi:[
      { user:'Opens PhonePe / GPay app', internal:'App loads UPI session; device binding verified; VPA session initialized' },
      { user:'Scans merchant QR code', internal:'QR decoded → extracts VPA + amount + merchant name; displayed for user confirmation' },
      { user:'Sees "Pay ₹X to [Merchant]" confirmation screen', internal:'TPAP calls PSP Bank to prepare debit request; amount locked at this stage' },
      { user:'Enters 6-digit UPI PIN', internal:'PIN encrypted on-device via HSM-bound key; encrypted PIN travels to remitter bank — never in plaintext' },
      { user:'"Payment Successful ✓" shown (~2–4 sec)', internal:'NPCI confirmed debit + credit in T=0 real-time; both banks updated; response sent to both TPAPs' },
      { user:'Receives SMS + push notification', internal:'Remitter bank fires SMS debit alert; TPAP fires push notification with transaction ID' },
      { user:'Order confirmed; fulfilment triggered', internal:'Merchant webhook receives payment.captured; merchant server calls GET /payments/{id} to verify; marks order PAID' },
    ],
    card:[
      { user:'Clicks "Pay Now" on eCommerce checkout', internal:'Merchant calls POST /v1/orders; gateway creates server-side order with idempotency key; amount locked' },
      { user:'Enters card number, expiry, CVV on gateway-hosted field', internal:'Gateway tokenizes card (PAN → DPAN); runs Luhn algorithm check; BIN lookup for issuer/country/type' },
      { user:'Redirected to bank 3DS OTP page', internal:'Fraud engine scores 100+ signals; 3DS2 sends device context to Issuer ACS; ACS decides frictionless or challenge' },
      { user:'Enters OTP received on registered mobile', internal:'ACS validates OTP; returns authentication result (Y) with cryptogram to gateway; auth certified' },
      { user:'"Payment Successful" shown', internal:'Auth response code 00 received; pre-auth hold placed on card account; funds RESERVED (not debited)' },
      { user:'Card statement shows "Pending" transaction', internal:'EOD: Merchant batch → Acquirer → Card Network; clearing begins; interchange fees calculated' },
      { user:'Statement shows final settled charge (T+1/T+2)', internal:'Issuer → Network → Acquirer → Merchant bank settlement; MDR deducted at each step; reconciliation complete' },
    ],
    netbanking:[
      { user:'Selects Net Banking → picks bank (HDFC)', internal:'Merchant backend creates order; gateway generates HMAC-SHA256 signed redirect URL to bank portal' },
      { user:'Browser redirects to HDFC NetBanking portal', internal:'Gateway passes: merchant ID, amount, callback URL, signed hash to bank portal via URL params' },
      { user:'Enters Customer ID + IPIN + OTP', internal:'Bank authenticates user with 2FA; credentials NEVER visible to gateway at any point' },
      { user:'Sees "Confirm ₹X to [Merchant]" — clicks Confirm', internal:'Bank debits customer account IMMEDIATELY; assigns Bank Reference Number (BRN) for reconciliation' },
      { user:'Redirected back to merchant site', internal:'Bank redirects to gateway callback URL with: status + BRN + signed hash for verification' },
      { user:'"Order placed successfully" shown', internal:'Gateway verifies bank hash; marks payment captured; Calls GET /payments/{id} for server-side confirmation' },
      { user:'Email/order confirmation received', internal:'Merchant server verifies status = captured; marks order PAID in DB; triggers fulfillment; fires payment.captured webhook' },
    ],
  };

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:'"Segoe UI", system-ui, sans-serif', color:C.text }}>

      {/* ─── HEADER ─── */}
      <div style={{ background:'linear-gradient(135deg, #0a1020, #0d1830)', borderBottom:`1px solid ${C.border}`, padding:'20px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', marginBottom:'16px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:'linear-gradient(135deg, #00e5ff, #0055ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'0 0 24px #00e5ff30' }}>💳</div>
            <div>
              <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'#fff', letterSpacing:'-0.3px' }}>Payments Domain — Master Reference</h1>
              <p style={{ margin:'4px 0 0', color:C.muted, fontSize:'12px' }}>Complete depth · Every layer · India-specific · Internal workings · BA-grade notes throughout</p>
            </div>
          </div>
          <div style={{ background:`${C.gold}12`, border:`1px solid ${C.gold}30`, borderRadius:'8px', padding:'8px 16px', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'18px' }}>✦</span>
            <div>
              <div style={{ color:C.gold, fontWeight:'700', fontSize:'13px' }}>Made by Prateek</div>
              <div style={{ color:C.muted, fontSize:'10px' }}>Payments Domain · BA Reference 2025</div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding:'7px 13px', borderRadius:'7px', fontSize:'12px', cursor:'pointer', transition:'all 0.15s', border: tab===i ? `1px solid ${C.cyan}50` : `1px solid ${C.border}`, background: tab===i ? `${C.cyan}14` : 'transparent', color: tab===i ? C.cyan : C.muted, fontWeight: tab===i ? '600' : '400' }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:'24px 28px', maxWidth:'1400px', margin:'0 auto' }}>

        {/* ═══════════════════════════════════════════════
            TAB 0 — DOMAIN TREE
        ═══════════════════════════════════════════════ */}
        {tab===0 && (() => {
          const filterTree = (node, q) => {
            if (!q) return node;
            const ql = q.toLowerCase();
            const match = node.label.toLowerCase().includes(ql) || (node.def||'').toLowerCase().includes(ql);
            if (!node.children) return match ? node : null;
            const kids = node.children.map(c => filterTree(c,q)).filter(Boolean);
            return (match || kids.length) ? {...node, children:kids} : null;
          };
          const filtered = filterTree(domainTree, searchQuery);
          return (
            <SectionCard title="FULL PAYMENTS DOMAIN TREE" color={C.gold} icon="🌐">
              <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'14px', flexWrap:'wrap' }}>
                <input placeholder="🔍  Search… (e.g. UPI, chargeback, tokenization, NEFT, ACS)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex:1, minWidth:'220px', padding:'9px 14px', background:'#0a1020', border:`1px solid ${searchQuery ? C.gold+'60' : C.border}`, borderRadius:'7px', color:C.text, fontSize:'12.5px', outline:'none' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ padding:'8px 14px', borderRadius:'6px', background:`${C.gold}12`, border:`1px solid ${C.gold}30`, color:C.gold, fontSize:'12px', cursor:'pointer' }}>✕ Clear</button>}
              </div>
              <p style={{ color:C.muted, fontSize:'11.5px', margin:'0 0 14px' }}>Click <strong style={{ color:C.gold }}>▶</strong> to expand · All 13 players, 8 instrument types, 6 rails, 5 gateway layers, security, settlement, and emerging tech</p>
              {filtered ? <TreeNode node={filtered} depth={0} /> : <div style={{ color:C.muted, textAlign:'center', padding:'24px' }}>No results for "{searchQuery}"</div>}
            </SectionCard>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            TAB 1 — ECOSYSTEM & PAYMENT TYPES
        ═══════════════════════════════════════════════ */}
        {tab===1 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>👥 Ecosystem Players & Payment Classification</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Every actor in the payment chain with their role, function, and examples — plus complete payment type taxonomy</p>

            <SectionCard title="COMPLETE ECOSYSTEM — ALL 14 PLAYERS" color={C.cyan} icon="👥">
              <p style={{ color:C.muted, fontSize:'12px', marginBottom:'12px' }}>Every payment involves a coordinated chain of actors. A BA must know every role cold — who is responsible for what, who holds money, and who is regulated.</p>
              <RichTable
                headers={['Player','Role Label','What They Do','India Examples','Key BA Relevance']}
                colColors={[C.cyan, C.gold, null, null, C.teal]}
                rows={[
                  ['Cardholder / Payer','Initiator','Initiates payment — swipes card, scans QR, enters OTP, enters UPI PIN','Any consumer','Source of funds; authentication is on this party'],
                  ['Merchant / Payee','Receiver','Accepts payment for goods/services — has an acquiring bank relationship','Swiggy, Amazon, local shop','Needs MCC mapping, MDR agreement, settlement SLA'],
                  ['Issuing Bank','Issuer','Issued the customer\'s card or account; approves or declines based on balance + fraud + 3DS','HDFC, SBI, ICICI, Kotak','Owns authorization decision; sets credit/debit limits'],
                  ['Acquiring Bank','Acquirer','Processes payments on merchant\'s behalf; settles funds to merchant','Axis Bank, ICICI Merchant, Yes Bank','Merchant must have acquiring agreement; MDR negotiated here'],
                  ['Payment Gateway','Tech Layer','Encrypts & routes transaction data; provides API, SDK, hosted checkout','Razorpay, PayU, CCAvenue','BA writes requirements against gateway API + webhook contracts'],
                  ['Payment Processor','Backend Engine','Manages connections between gateway, acquirer, network, issuer','FIS, Worldline, Ingenico','Often invisible — backend infrastructure provider'],
                  ['Card Network','Scheme Operator','Routes transactions between issuer & acquirer; sets rules; earns scheme fees','Visa, Mastercard, RuPay, Amex','Sets interchange rates; manages chargeback rules and thresholds'],
                  ['Payment Aggregator (PA)','Aggregator','Aggregates many merchants under one platform; RBI-licensed; holds funds in nodal account','Razorpay, PayU, Paytm','Must have RBI PA license; liable for merchant KYC + fraud'],
                  ['PSP (Payment Service Provider)','End-to-end','Combines gateway + processor + acquiring — full payment stack for merchants','Adyen, Stripe, PayU','One-stop for international merchants entering India'],
                  ['NPCI','India Regulator-Infra','Operates UPI, IMPS, RuPay, NACH, AePS, BBPS, FASTag — India\'s payment infrastructure','NPCI (National Payments Corp)','Any product using UPI/NACH/RuPay must integrate via NPCI standards'],
                  ['TPAP','Front-End UPI App','Third Party App Provider — user-facing UPI app; cannot hold money; rides on PSP bank','PhonePe (Yes Bank PSP), GPay (Axis PSP)','Must handle UPI mandate, collect flow, VPA management'],
                  ['PSP Bank','UPI Sponsor Bank','Bank sponsoring TPAP; provides banking infrastructure to TPAP for UPI operations','Yes Bank (PhonePe), Axis Bank (GPay)','Key in UPI routing; PSP bank availability = TPAP availability'],
                  ['RBI','Regulator','Central bank — sets policy, licensing (PA/PG), compliance rules for all payment entities','Reserve Bank of India','All gateway/PA products must comply with RBI circulars'],
                  ['Business Correspondent (BC)','Rural Touchpoint','Authorized agent providing banking + payment services in unbanked areas','CSP outlets, Micro ATM operators','Critical for G2P, AePS, and rural UPI Cash Withdrawal'],
                ]}
              />
              <BANote text="Transaction flow: Cardholder → Merchant POS/Gateway → Acquirer routes → Card Network → Issuer approves/declines → response travels back in reverse. Every hop adds ~50–200ms latency. BA must define timeout at each hop." />
            </SectionCard>

            <SectionCard title="PAYMENT TYPES — COMPLETE CLASSIFICATION" color={C.gold} icon="📂">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px' }}>
                {/* By Instrument */}
                <div style={{ background:`${C.cyan}07`, border:`1px solid ${C.cyan}20`, borderRadius:'10px', padding:'16px' }}>
                  <div style={{ color:C.cyan, fontWeight:'700', fontSize:'13px', marginBottom:'12px' }}>💳 By Instrument</div>
                  <RichTable headers={['Instrument','Type','MDR','Speed']} colColors={[C.cyan]}
                    rows={[
                      ['Credit Card','Post-paid revolving','1.5–3%','Auth instant; settle T+1–T+3'],
                      ['Debit Card','Instant bank debit','0–1% (RuPay 0%)','Auth instant; settle T+1–T+3'],
                      ['Prepaid (PPI)','Pre-loaded value','1–2%','Instant (on-us)'],
                      ['UPI','Bank-to-bank via VPA','0% P2M (RBI)','Instant T=0'],
                      ['Net Banking','Redirect bank portal','1–2%','Immediate debit; settle T+1'],
                      ['Wallet','Stored value PPI','1.5–2%','Instant (on-us); T+1 off-us'],
                      ['BNPL','Deferred credit','Varies','Same-day credit; repay later'],
                      ['NACH','Recurring mandate','~₹0.50/txn','T+1 batch'],
                    ]}
                  />
                </div>
                {/* By Nature */}
                <div style={{ background:`${C.gold}07`, border:`1px solid ${C.gold}20`, borderRadius:'10px', padding:'16px' }}>
                  <div style={{ color:C.gold, fontWeight:'700', fontSize:'13px', marginBottom:'12px' }}>🔄 By Nature of Transaction</div>
                  {[
                    { type:'P2P', full:'Person to Person', eg:'UPI transfers, wallet-to-wallet, IMPS, friend payments', color:C.cyan },
                    { type:'P2M', full:'Person to Merchant', eg:'Swiggy, retail POS, eCommerce checkout — most common by volume', color:C.green },
                    { type:'B2B', full:'Business to Business', eg:'Vendor payments, invoice settlement, corporate bulk transfers via RTGS', color:C.gold },
                    { type:'G2P', full:'Government to Person', eg:'DBT, PM-KISAN subsidies via NACH/UPI to Aadhaar-linked accounts', color:C.orange },
                    { type:'P2G', full:'Person to Government', eg:'Tax payments, challans, license fees via BBPS/Net Banking', color:C.purple },
                    { type:'C2B', full:'Consumer to Business', eg:'Utility bills, EMI collection, SaaS subscriptions', color:C.teal },
                  ].map((r,i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', padding:'8px 10px', marginBottom:'5px', background:`${r.color}08`, border:`1px solid ${r.color}18`, borderRadius:'6px' }}>
                      <span style={{ color:r.color, fontWeight:'800', fontSize:'13px', minWidth:'30px' }}>{r.type}</span>
                      <div>
                        <div style={{ color:'#e0e8ff', fontWeight:'600', fontSize:'12px' }}>{r.full}</div>
                        <div style={{ color:C.muted, fontSize:'11px' }}>{r.eg}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* By Channel */}
                <div style={{ background:`${C.teal}07`, border:`1px solid ${C.teal}20`, borderRadius:'10px', padding:'16px' }}>
                  <div style={{ color:C.teal, fontWeight:'700', fontSize:'13px', marginBottom:'12px' }}>📍 By Channel</div>
                  {[
                    { ch:'POS Terminal', def:'Card swipe/dip/tap at physical store (Card Present)', risk:'Lower — card physically present' },
                    { ch:'eCommerce / CNP', def:'Online checkout — Card Not Present; 3DS2 mandatory India', risk:'Higher — 3DS required' },
                    { ch:'Mobile App / UPI', def:'PhonePe, GPay, BHIM; QR or VPA-based', risk:'Low — PIN + device binding' },
                    { ch:'ATM', def:'Cash withdrawal + NEFT/IMPS fund transfers + balance inquiry', risk:'PIN required' },
                    { ch:'USSD (*99#)', def:'Feature phone banking — no internet, no smartphone needed', risk:'Low — for rural/unbanked' },
                    { ch:'QR Code', def:'Static (printed) vs Dynamic (per-transaction) QR', risk:'Dynamic QR safer (tamper-proof)' },
                    { ch:'Micro ATM / BC', def:'Card swipe at Business Correspondent agent outlet', risk:'AePS biometric auth' },
                    { ch:'BBPS', def:'Bharat Bill Payment System — utility bills, insurance, telecom', risk:'Standardized receipt' },
                  ].map((c,i) => (
                    <div key={i} style={{ padding:'7px 10px', marginBottom:'5px', background:`${C.teal}06`, borderRadius:'5px', borderLeft:`3px solid ${C.teal}40` }}>
                      <span style={{ color:C.teal, fontWeight:'600', fontSize:'12px' }}>{c.ch} </span>
                      <span style={{ color:'#b0c4de', fontSize:'11.5px' }}>— {c.def}</span>
                    </div>
                  ))}
                </div>
                {/* By Settlement Pattern */}
                <div style={{ background:`${C.purple}07`, border:`1px solid ${C.purple}20`, borderRadius:'10px', padding:'16px' }}>
                  <div style={{ color:C.purple, fontWeight:'700', fontSize:'13px', marginBottom:'12px' }}>🔀 By Settlement Pattern</div>
                  <div style={{ marginBottom:'12px', padding:'12px', background:`${C.purple}08`, borderRadius:'8px' }}>
                    <div style={{ color:C.purple, fontWeight:'700', fontSize:'12px', marginBottom:'6px' }}>Credit-Push (Sender Initiates)</div>
                    <div style={{ color:'#b0c4de', fontSize:'12px' }}>Sender pushes money to receiver — payer initiates the transaction</div>
                    <div style={{ color:C.muted, fontSize:'11.5px', marginTop:'4px' }}>Examples: UPI Pay, NEFT, RTGS, IMPS — "I am sending ₹X to you"</div>
                  </div>
                  <div style={{ padding:'12px', background:`${C.orange}08`, borderRadius:'8px', border:`1px solid ${C.orange}18` }}>
                    <div style={{ color:C.orange, fontWeight:'700', fontSize:'12px', marginBottom:'6px' }}>Debit-Pull (Receiver Initiates)</div>
                    <div style={{ color:'#b0c4de', fontSize:'12px' }}>Receiver pulls money from payer — payee initiates the transaction</div>
                    <div style={{ color:C.muted, fontSize:'11.5px', marginTop:'4px' }}>Examples: Card payment, NACH mandate, UPI Collect — "I am collecting ₹X from you"</div>
                  </div>
                  <BANote text="This distinction is critical for BRD design — Pull-based systems require mandate/consent frameworks and different dispute handling than push-based ones." color={C.purple} />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 2 — INDIA RAILS
        ═══════════════════════════════════════════════ */}
        {tab===2 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>🚆 India Payment Rails — Complete Deep Dive</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Every infrastructure rail India runs on — operated by RBI & NPCI. A rail is the underlying settlement & routing infrastructure a payment travels through.</p>

            <SectionCard title="ALL 6 INDIA RAILS — FULL COMPARISON TABLE" color={C.cyan} icon="📊">
              <RichTable
                headers={['Rail','Full Name','Operated By','Speed','Availability','Min','Max','Settlement','Primary Use Case','Identifier']}
                colColors={[C.cyan, C.gold]}
                rows={[
                  ['NEFT','National Electronic Funds Transfer','RBI','Batch (30-min cycles)','24×7','₹1','No cap','DNS (Deferred Net)','Salary, vendor payments, standard transfers','IFSC + Account No'],
                  ['RTGS','Real Time Gross Settlement','RBI','Immediate (real-time)','24×7','₹2 Lakh','No cap','Gross (real-time, individual)','High-value B2B, property transactions, IPOs','IFSC + Account No'],
                  ['IMPS','Immediate Payment Service','NPCI','Instant','24×7','₹1','₹5 Lakh','Immediate (real-time net)','Urgent P2P transfers, small B2B, ATM transfers','MMID + Mobile No'],
                  ['UPI','Unified Payments Interface','NPCI','Instant (T=0)','24×7','₹1','₹1–5 Lakh (app-specific)','Real-time net settlement','P2P, P2M retail — 85% of India\'s transaction volume','VPA (e.g. prateek@okhdfc)'],
                  ['NACH','National Automated Clearing House','NPCI','T+1 batch','Business hours (weekdays)','₹1','Per mandate cap','DNS Batch (T+1)','EMIs, SIPs, salary credits, insurance premiums, utility auto-pay','Account No + IFSC + Mandate ID'],
                  ['AePS','Aadhaar-enabled Payment System','NPCI','Near real-time','Business hours','Bank-defined','₹10,000/txn','Immediate (biometric-verified)','Rural biometric payments, G2P cash-out, BC-assisted banking for unbanked','Aadhaar + Bank code'],
                ]}
              />
            </SectionCard>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'14px' }}>
              <SectionCard title="KEY INSIGHTS FOR BA — RTGS vs NEFT" color={C.gold} icon="💡">
                <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
                  <div style={{ flex:1, padding:'12px', background:`${C.gold}08`, border:`1px solid ${C.gold}20`, borderRadius:'8px' }}>
                    <div style={{ color:C.gold, fontWeight:'700', fontSize:'12.5px', marginBottom:'6px' }}>RTGS — Gross Settlement</div>
                    <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6' }}>Each transaction settled individually and immediately as it arrives. Minimum ₹2 Lakh. Money moves in real-time — no netting, no batching.</p>
                    <p style={{ color:C.muted, fontSize:'11.5px', marginTop:'6px' }}>Use: High-value corporate transfers, property deals, large B2B invoices</p>
                  </div>
                  <div style={{ flex:1, padding:'12px', background:`${C.cyan}08`, border:`1px solid ${C.cyan}20`, borderRadius:'8px' }}>
                    <div style={{ color:C.cyan, fontWeight:'700', fontSize:'12.5px', marginBottom:'6px' }}>NEFT — Net Settlement</div>
                    <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6' }}>Multiple transactions are batched and netted into one settlement amount every 30 minutes. A bank that owes ₹10L sends ₹10L net, not 100 individual payments of ₹10K.</p>
                    <p style={{ color:C.muted, fontSize:'11.5px', marginTop:'6px' }}>Use: Salary disbursement, vendor payments, low-to-mid value transfers</p>
                  </div>
                </div>
                <BANote text="RTGS vs NEFT distinction matters heavily in reconciliation system design. RTGS = one UTR per transaction. NEFT = one UTR for a batch of multiple transactions. Your recon system must handle both patterns." />
              </SectionCard>

              <SectionCard title="UPI DOMINANCE & LIMITS (2025)" color={C.green} icon="⚡">
                {[
                  { kpi:'Transaction Volume', val:'~13–15 Billion/month (Aug 2025)', color:C.cyan },
                  { kpi:'Share of India Retail Payments', val:'85% of transaction count', color:C.green },
                  { kpi:'MDR (P2M)', val:'0% — RBI mandate since 2020', color:C.gold },
                  { kpi:'Max per transaction', val:'₹1 Lakh (general); ₹5 Lakh (verified merchants)', color:C.orange },
                  { kpi:'Balance check limit (Aug 2025)', val:'50 checks per day per VPA', color:C.purple },
                  { kpi:'Account view limit (Aug 2025)', val:'25 views per day', color:C.teal },
                  { kpi:'Success Rate Target', val:'> 99% (NPCI mandate for PSP banks)', color:C.green },
                  { kpi:'Settlement cycle', val:'T=0 real-time — instant for both payer and payee', color:C.cyan },
                ].map((k,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 10px', marginBottom:'4px', background:`${k.color}07`, border:`1px solid ${k.color}15`, borderRadius:'5px' }}>
                    <span style={{ color:k.color, fontWeight:'600', fontSize:'12px' }}>{k.kpi}</span>
                    <span style={{ color:'#b0c4de', fontSize:'12px' }}>{k.val}</span>
                  </div>
                ))}
                <Insight text="Zero MDR on UPI means gateways cannot earn transaction fees on 85% of India's volume. They monetize via SaaS subscriptions, instant settlement premium, payouts API, international transactions, and embedded lending." />
              </SectionCard>

              <SectionCard title="NACH / eNACH — RECURRING MANDATE RAILS" color={C.purple} icon="🔁">
                <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'12px' }}>NACH (National Automated Clearing House) is the successor to legacy ECS. It enables one-time mandate setup with auto-debit thereafter — critical for any subscription, lending, or insurance product.</p>
                <RichTable headers={['Mandate Type','How Set Up','Debit Trigger','Use Case']} colColors={[C.purple]}
                  rows={[
                    ['Physical NACH','Signed paper mandate submitted to bank','Merchant initiates batch on due date','Legacy EMIs, insurance premiums'],
                    ['eNACH (API)','Aadhaar OTP or Net Banking e-sign online','Merchant initiates via API on due date','Digital lending, SaaS subscriptions'],
                    ['UPI AutoPay','Customer approves mandate in UPI app with PIN','Merchant initiates 24 hrs before due date','OTT, SIP, mutual funds, EMI'],
                  ]}
                />
                <BANote text="UPI AutoPay is the modern NACH — faster setup, better UX, instant confirmation. BA must define: mandate max amount, frequency (daily/weekly/monthly/yearly), debit execution window, and failure notification flow." color={C.purple} />
              </SectionCard>

              <SectionCard title="AePS — AADHAAR PAYMENT RAIL" color={C.orange} icon="🔐">
                <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'12px' }}>AePS (Aadhaar-enabled Payment System) allows banking transactions using just Aadhaar number + biometric fingerprint — no card, no PIN, no smartphone needed. Critical for rural India's financial inclusion.</p>
                {[
                  { op:'Cash Withdrawal', def:'Customer withdraws cash via fingerprint at BC agent\'s Micro ATM — ₹10K/txn limit' },
                  { op:'Balance Enquiry', def:'Check bank account balance using Aadhaar + fingerprint only' },
                  { op:'Mini Statement', def:'Get last 5 transactions without visiting bank branch' },
                  { op:'Fund Transfer', def:'Transfer funds between Aadhaar-linked accounts — biometric authentication' },
                  { op:'G2P Distribution', def:'Government benefit disbursal — DBT, MGNREGA wages directly to Aadhaar-linked accounts' },
                ].map((o,i) => (
                  <div key={i} style={{ padding:'8px 12px', marginBottom:'5px', background:`${C.orange}07`, border:`1px solid ${C.orange}15`, borderRadius:'6px' }}>
                    <span style={{ color:C.orange, fontWeight:'600', fontSize:'12px' }}>{o.op} — </span>
                    <span style={{ color:'#b0c4de', fontSize:'12px' }}>{o.def}</span>
                  </div>
                ))}
                <BANote text="AePS fraud has increased (fake biometric attacks). New safeguards: liveness detection, limited daily transaction count, Aadhaar biometric lock feature. BA must include these controls in any AePS integration BRD." color={C.orange} />
              </SectionCard>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 3 — CARD LIFECYCLE
        ═══════════════════════════════════════════════ */}
        {tab===3 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>💳 Card Transaction Lifecycle — 7 Phases</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Every card payment (debit/credit, online/offline, tap/swipe/chip) follows exactly these 7 phases in this order</p>

            <div style={{ marginBottom:'20px' }}>
              {cardPhases.map((p,i) => <PhaseStep key={i} {...p} connector={i < cardPhases.length-1} />)}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px' }}>
              <SectionCard title="AUTHORIZATION RESPONSE CODES (ISO 8583)" color={C.orange} icon="🔴">
                <RichTable headers={['Code','Meaning','Type','BA Action']} colColors={[C.orange]}
                  rows={[
                    ['00','Approved','Hard Approval','Proceed to capture'],
                    ['05','Do Not Honour — generic decline','Hard Decline','Show decline message; do not retry same card'],
                    ['51','Insufficient Funds / Over Credit Limit','Hard Decline','Suggest alternate card/payment method'],
                    ['54','Expired Card','Hard Decline','Prompt card update; trigger VAU lookup'],
                    ['57','Transaction Not Permitted to Cardholder','Hard Decline','Card blocked for this transaction type'],
                    ['61','Exceeds Withdrawal Limit','Hard Decline','Daily limit exceeded; retry tomorrow or lower amount'],
                    ['91','Issuer Unavailable / Timeout','Soft Decline','Retryable — wait 30s, retry once via different acquirer'],
                    ['96','System Malfunction','Soft Decline','Retryable — temporary; exponential backoff retry'],
                    ['14','Invalid Card Number','Hard Decline','Card number failed Luhn check or is invalid'],
                  ]}
                />
                <Insight text="Soft declines (code 91, 96) are retryable — the issuer was temporarily unavailable. Hard declines (05, 51, 54) are final — retrying the same card will not help. BA must configure smart retry logic to only retry soft declines." />
              </SectionCard>

              <SectionCard title="CVV TAXONOMY — 4 TYPES" color={C.purple} icon="🔐">
                <RichTable headers={['CVV Type','Location','Used In','Security Note']} colColors={[C.purple]}
                  rows={[
                    ['CVV1','Encoded in Magstripe Track 2','Card-Present swipe transactions','Can be skimmed with a card reader — magstripe vulnerability'],
                    ['CVV2','Printed on back of card (3–4 digits)','Card-Not-Present online transactions','Cannot be stored by merchant post-auth per PCI DSS'],
                    ['iCVV','Generated dynamically on EMV chip','Chip-based CP transactions','Different from CVV1 — skimmed CVV1 ≠ iCVV → issuer detects clone → decline'],
                    ['dCVV','Dynamic, generated per transaction','Contactless NFC tap transactions','Changes each tap — extremely fraud-resistant'],
                  ]}
                />
                <Insight text="EMV chip essentially eliminated card-present cloning fraud: if a fraudster skims the magstripe and creates a cloned card, the cloned chip will have wrong iCVV → issuer detects mismatch → declines. This is why chip-and-PIN mandates reduced CP fraud by ~70%." />
              </SectionCard>

              <SectionCard title="EMV LIABILITY SHIFT — BA MUST KNOW" color={C.red} icon="⚠️">
                <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'12px' }}>EMV = Europay + Mastercard + Visa — the global standard for chip-based card transactions.</p>
                <div style={{ padding:'12px', background:`${C.red}08`, border:`1px solid ${C.red}25`, borderRadius:'8px', marginBottom:'10px' }}>
                  <div style={{ color:C.red, fontWeight:'700', fontSize:'12.5px', marginBottom:'6px' }}>Pre-2015: Issuer bore fraud liability</div>
                  <div style={{ color:'#b0c4de', fontSize:'12px' }}>Banks absorbed all card-present fraud losses regardless of merchant terminal type.</div>
                </div>
                <div style={{ padding:'12px', background:`${C.green}08`, border:`1px solid ${C.green}25`, borderRadius:'8px' }}>
                  <div style={{ color:C.green, fontWeight:'700', fontSize:'12.5px', marginBottom:'6px' }}>Post-2015 (EMV Liability Shift): Merchant bears liability if terminal doesn't support EMV chip</div>
                  <div style={{ color:'#b0c4de', fontSize:'12px' }}>If a fraud transaction occurs on a chip card that was swiped (not dipped) because the POS terminal didn't support chip → liability shifts to merchant/acquirer.</div>
                </div>
                <BANote text="When writing requirements for POS terminal upgrades or new merchant onboarding, EMV chip support is a MANDATORY functional requirement — not optional. Include in all POS terminal BRDs." color={C.red} />
              </SectionCard>

              <SectionCard title="3DS1 vs 3DS2 — AUTHENTICATION EVOLUTION" color={C.teal} icon="🔑">
                <RichTable headers={['Feature','3DS 1.0','3DS 2.0']} colColors={[C.teal]}
                  rows={[
                    ['Data sent to issuer','Minimal (transaction details only)','100+ data points (device, IP, browser, past behavior)'],
                    ['User experience','Always redirected to OTP page — clunky','Frictionless if risk is low OR Challenge only when needed'],
                    ['Mobile support','Poor — browser redirect breaks native apps','Native SDK support — seamless in-app flow'],
                    ['Authentication speed','4–7 seconds (redirect + OTP)','Sub-second for frictionless flow'],
                    ['OTP requirement','Always required (100% challenge rate)','Only high-risk transactions get OTP challenge'],
                    ['Data protocol','Browser-based redirect','ACS + 3DS Server communication with rich JSON payload'],
                  ]}
                />
                <BANote text="RBI mandated 3DS2 risk-based authentication framework (effective April 1, 2026) — banks must rebuild security frameworks. Low-risk transactions may skip OTP entirely. BA must model frictionless path + challenge path in all card payment BRDs." color={C.teal} />
              </SectionCard>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 4 — UPI DEEP DIVE
        ═══════════════════════════════════════════════ */}
        {tab===4 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>⚡ UPI System — Complete Deep Dive</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>India's crown jewel — 85% of transaction volume · NPCI operated · RBI regulated · Real-time settlement · 24×7</p>

            <SectionCard title="UPI ARCHITECTURE — ALL KEY COMPONENTS" color={C.cyan} icon="🏗">
              <RichTable headers={['Component','Full Name','Role','Examples','Key BA Note']} colColors={[C.cyan, C.gold]}
                rows={[
                  ['NPCI Switch','National Payments Corp of India UPI Switch','Core routing engine — routes all UPI transactions between banks; maintains VPA registry','NPCI central infrastructure','Must handle 13B+ txns/month; 24×7 uptime critical; any NPCI outage = systemic impact'],
                  ['PSP Bank','Payment Service Provider Bank','Sponsors a TPAP to provide UPI services; provides banking infrastructure','Yes Bank (PhonePe), Axis Bank (GPay), ICICI','PSP bank downtime = TPAP downtime; key SLA dependency in product design'],
                  ['TPAP','Third Party App Provider','Front-end UPI app — user-facing interface; cannot hold money; rides on PSP bank','PhonePe, GPay, Paytm, BHIM','Cannot independently process payments; fully dependent on PSP bank connection to NPCI'],
                  ['Remitter Bank','Payer\'s Bank','Holds the payer\'s account; debits on successful transaction; validates UPI PIN via HSM','HDFC, SBI, ICICI, Kotak (as payer bank)','Balance check + PIN verification happens here; main source of decline (no funds, wrong PIN)'],
                  ['Beneficiary Bank','Payee\'s Bank','Holds the payee\'s account; credits on successful transaction','HDFC, Axis, Yes Bank (as merchant bank)','Credit failure here causes \'deducted but not credited\' scenario — NPCI triggers auto-reversal'],
                  ['VPA','Virtual Payment Address','UPI handle that maps to bank account — masks real account number','prateek@okhdfc, merchant@ybl','BA must define VPA validation, resolution failure handling, and invalid VPA error messages'],
                  ['HSM','Hardware Security Module','Hardware device at Remitter Bank that encrypts/decrypts UPI PIN','Bank-grade HSM hardware','UPI PIN never travels in plaintext; PIN only decrypted at HSM layer in Remitter Bank'],
                ]}
              />
            </SectionCard>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px', marginBottom:'16px' }}>
              {[
                { title:'UPI Pay Flow (Push — most common)', color:C.cyan, steps:['Customer scans QR or enters VPA','TPAP shows "Pay ₹X to Merchant" confirmation','Customer enters UPI PIN','PSP Bank → NPCI Switch → Remitter Bank → Beneficiary Bank','T=0 settlement — both credited instantly'] },
                { title:'UPI Collect Flow (Pull — eCommerce)', color:C.gold, steps:['Merchant generates collect request or dynamic QR','Merchant sends request to customer\'s VPA via NPCI','Customer sees "Approve payment of ₹X" in TPAP app','Customer enters UPI PIN to approve','Credit flows from Remitter → Beneficiary Bank'] },
                { title:'UPI AutoPay (Mandates)', color:C.purple, steps:['Customer creates mandate: VPA + max cap + frequency','Merchant initiates debit on due date — no customer action','NPCI routes debit request to Remitter Bank','Remitter Bank validates mandate + debits if within cap','2025: AutoPay Portability — move mandates between apps'] },
                { title:'UPI Lite (Offline)', color:C.green, steps:['Customer pre-loads up to ₹2,000 in on-device wallet','Transaction up to ₹500 per payment, ₹2,000 wallet limit','No internet connection required — NFC-based','No UPI PIN required — faster checkout','Balance stays on device; topped up online when needed'] },
              ].map((f,i) => (
                <div key={i} style={{ background:`${f.color}07`, border:`1px solid ${f.color}20`, borderRadius:'10px', padding:'16px' }}>
                  <div style={{ color:f.color, fontWeight:'700', fontSize:'13px', marginBottom:'10px' }}>{f.title}</div>
                  {f.steps.map((s,j) => (
                    <div key={j} style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
                      <span style={{ color:f.color, fontWeight:'700', fontSize:'11px', minWidth:'16px' }}>{j+1}.</span>
                      <span style={{ color:'#b0c4de', fontSize:'12px' }}>{s}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <SectionCard title="UPI KPIs — COMPLETE DASHBOARD" color={C.gold} icon="📊">
              <RichTable headers={['KPI','Definition','Target / Benchmark','Why It Matters for BA']} colColors={[C.gold]}
                rows={[
                  ['Success Rate','% of UPI transactions that complete successfully','> 99% (NPCI mandate for PSP banks)','Low success rate = customer complaints, merchant revenue loss, NPCI penalty risk'],
                  ['PSP Latency','Time from initiation to response at PSP Bank level','< 3 seconds P95','High latency = customer abandonment; each 1s increase = ~5% abandonment'],
                  ['Remitter Bank Timeout %','% of transactions timing out at remitter bank','< 0.5% per bank','Frequent timeouts → \'deducted not confirmed\' scenarios; needs auto-reversal design'],
                  ['Reversal Rate','% of transactions triggering automatic NPCI reversal (debit done, credit pending)','< 0.1% ideally','High reversal rate = operational escalations; each reversal costs ₹5–15 in processing'],
                  ['Pending Transaction %','Transactions in limbo — debit done, credit pending for > 30 minutes','< 0.01%','BA must define pending state handling, customer communication, and escalation SLA'],
                  ['Decline Rate','% of technical or bank declines (wrong PIN, no funds, bank down)','< 5% total; < 2% technical','High technical decline = integration or routing issue; high bank decline = customer education needed'],
                  ['UPI Mandate Execution Rate','% of AutoPay mandates that execute successfully on due date','> 95%','Low rate = revenue leakage for subscription businesses; needs failed-debit retry logic'],
                  ['Daily Active VPAs','Count of unique VPAs transacting daily','Growing metric','Health indicator of UPI ecosystem adoption by merchant and consumer'],
                ]}
              />
            </SectionCard>

            <SectionCard title="UPI 2025–2026 NEW FEATURES" color={C.teal} icon="🆕">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'10px' }}>
                {[
                  { name:'Biometric Authentication (2025)', color:C.green, def:'Fingerprint/face ID replaces UPI PIN for transactions up to ₹5,000. Faster checkout, no PIN memorization.', ba:'Define biometric fallback flow (PIN) when biometric fails or is not set up.' },
                  { name:'UPI Reserve Pay (2025)', color:C.gold, def:'Block up to ₹10,000 for 90 days for multiple future payments. Works like a time-locked balance earmark.', ba:'Define reserve creation API, release triggers, partial-use logic, and expiry handling.' },
                  { name:'AutoPay Portability (2025)', color:C.purple, def:'Users can transfer existing UPI AutoPay mandates from one app to another without merchant involvement.', ba:'Design mandate migration flow; ensure merchant system updates VPA references accordingly.' },
                  { name:'UPI Cash Withdrawal via Micro ATM', color:C.orange, def:'Customer scans a dynamic QR at a BC outlet → pays UPI → receives cash from BC agent. Extends UPI to cash economy.', ba:'Define BC onboarding, cash limit per day, reconciliation between UPI settlement and cash disbursed.' },
                  { name:'RuPay Credit on UPI', color:C.cyan, def:'Link RuPay credit card to UPI VPA. Pay at any UPI QR with credit card. NOT zero MDR — credit card rates apply. T+1/T+2 settlement.', ba:'Critical interview trap: NOT zero MDR. Issuers: HDFC, ICICI, SBI, Kotak, AU Bank live as of 2025.' },
                  { name:'PSBL — Credit Line on UPI', color:C.pink, def:'Bank pre-approves credit limit; customer activates as UPI payment source; no physical card needed. UPI becomes a credit rail.', ba:'Define KYC-linked credit eligibility, credit limit display in UPI app, repayment via NACH, and interest calculation.' },
                  { name:'Multi-Signatory Accounts', color:C.teal, def:'Joint/business accounts with multi-approval flows. Multiple users must approve before payment processes — like corporate maker-checker in UPI.', ba:'Define approval chain design, timeout handling when approver doesn\'t act, and notification flows.' },
                  { name:'UPI Limits Tightening (Aug 2025)', color:C.red, def:'Balance checks limited to 50 per day; account view limited to 25 per day. RBI curbing excessive balance-check API calls.', ba:'Product must redesign any feature that relied on frequent balance polling — add caching or user-initiated checks only.' },
                ].map((f,i) => (
                  <div key={i} style={{ padding:'14px', background:`${f.color}07`, border:`1px solid ${f.color}22`, borderRadius:'9px' }}>
                    <div style={{ color:f.color, fontWeight:'700', fontSize:'12.5px', marginBottom:'6px' }}>{f.name}</div>
                    <div style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.55', marginBottom:'8px' }}>{f.def}</div>
                    <div style={{ fontSize:'11px', color:f.color, background:`${f.color}10`, padding:'6px 8px', borderRadius:'5px' }}>📌 BA: {f.ba}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 5 — GATEWAY & TECH
        ═══════════════════════════════════════════════ */}
        {tab===5 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>🔌 Payment Gateway Architecture & Technical Deep Dive</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>5-layer gateway stack, key technical concepts, tokenization, failure scenarios — everything a BA needs to write precise requirements</p>

            <SectionCard title="5-LAYER GATEWAY ARCHITECTURE" color={C.cyan} icon="🏗">
              {[
                { layer:'Layer 1 — Client Layer', color:C.cyan, items:['Web SDK / Mobile SDK — embedded in merchant app/site for card collection','Hosted Checkout Page — merchant redirects to gateway\'s own secure checkout page','Tokenization SDK — captures card data without merchant touching raw PAN (PCI scope reduction)','Static QR / Dynamic QR generation — for UPI P2M flows','Device Fingerprint Collection — browser, OS, screen resolution, timezone for fraud scoring'] },
                { layer:'Layer 2 — API Layer', color:C.gold, items:['REST APIs over HTTPS/TLS 1.3 — JSON request/response for all operations','Authentication: API Key + Secret OR OAuth 2.0 + JWT tokens','Idempotency Keys — unique UUID per API request; server deduplicates on this key (CRITICAL for retries)','Webhook Endpoints — async result delivery to merchant server via HTTPS POST','Rate Limiting + Throttling — protects gateway from abuse; merchant gets 429 on breach'] },
                { layer:'Layer 3 — Processing Engine (Core)', color:C.orange, items:['Validation Engine — BIN lookup, card expiry check, Luhn algorithm (mod-10 checksum)','Smart Routing Engine — routes to best acquirer based on BIN, success rate, geography, cost','Fraud/Risk Engine — Rule-based + ML scoring on 100+ signals; outputs Allow/Challenge/Block/Review','Authentication Handler — 3DS2 challenge orchestration, OTP verification, biometric auth handling','Authorization Handler — Sends auth request to acquirer → network → issuer; manages auth response','Pending/Retry/Async State Management — handles timeouts, soft declines, async (UPI/NB) flows'] },
                { layer:'Layer 4 — External Integrations', color:C.purple, items:['Acquirer Bank connections — ISO 8583 protocol (legacy) or REST API (modern); direct financial messaging','Card Network connections — Visa VisaNet, Mastercard Banknet, RuPay; scheme-specific protocols','UPI Switch (NPCI) — UPI API integration for real-time payment initiation and confirmation','Wallet Providers (Paytm, PhonePe, Amazon Pay) — wallet API for balance check and debit','NACH Gateway (NPCI) — mandate registration, modification, execution, cancellation','CBs / Core Banking — for nodal account management, settlement fund movement'] },
                { layer:'Layer 5 — Post-Processing Layer', color:C.teal, items:['Settlement Engine — calculates net amounts (gross - MDR - rolling reserve); schedules fund movement','Reconciliation Engine — downloads settlement files, matches against internal ledger, flags exceptions','Ledger System — double-entry accounting; immutable append-only journal entries','Reporting Engine — merchant dashboards, MIS reports, settlement reports, chargeback reports','Dispute Management System — chargeback workflow, evidence upload, representment tracking','Merchant Analytics — auth rate, success rate, top decline reasons, method mix reporting'] },
              ].map((l,i) => (
                <div key={i} style={{ display:'flex', gap:'0', marginBottom:'8px' }}>
                  <div style={{ width:'56px', flexShrink:0, background:`${l.color}15`, border:`1px solid ${l.color}30`, borderRadius:'8px 0 0 8px', display:'flex', alignItems:'center', justifyContent:'center', padding:'8px', writingMode:'vertical-rl', textOrientation:'mixed', transform:'rotate(180deg)' }}>
                    <span style={{ color:l.color, fontWeight:'700', fontSize:'10.5px', whiteSpace:'nowrap' }}>L{i+1}</span>
                  </div>
                  <div style={{ flex:1, background:`${l.color}05`, border:`1px solid ${l.color}18`, borderLeft:'none', borderRadius:'0 8px 8px 0', padding:'14px 16px' }}>
                    <div style={{ color:l.color, fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>{l.layer}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'4px' }}>
                      {l.items.map((item,j) => (
                        <div key={j} style={{ color:'#b0c4de', fontSize:'12px', paddingLeft:'12px', borderLeft:`2px solid ${l.color}30` }}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="KEY TECHNICAL CONCEPTS — BA MUST KNOW" color={C.gold} icon="⚙️">
              <RichTable headers={['Concept','What It Means','BA Relevance / Where to Specify']} colColors={[C.gold]}
                rows={[
                  ['Idempotency','Same API call made multiple times produces same result — no duplicate charges','Mandatory in API specs: every POST must include Idempotency-Key header; server deduplicates on this key'],
                  ['Synchronous Flow','Response returned in the same API call (< 30 sec)','Card authorization is sync: merchant waits for 200 OK before showing success to customer'],
                  ['Asynchronous Flow','Response sent later via webhook/callback','UPI pending, NACH execution, Net Banking — define webhook event types + retry policy in BRD'],
                  ['Webhook','Real-time HTTPS POST notification from gateway to merchant when event occurs','BA must specify: events to subscribe to, response SLA, retry config, idempotency via event_id, dead-letter queue'],
                  ['Retry Logic','Auto-reattempt failed transactions with exponential backoff','Define: max attempts, backoff interval (e.g. 1s → 2s → 4s → 8s), which error codes are retryable'],
                  ['Circuit Breaker','Stops cascading failures when a downstream dependency is consistently down','NFR requirement: gateway must stop routing to a failing acquirer after N consecutive failures; auto-recover when healthy'],
                  ['Message Queue','Kafka/RabbitMQ for async transaction processing and event streaming','High-volume systems: payment events → queue → consumers (ledger, settlement, notification); define consumer SLAs'],
                  ['TLS Encryption','Transport-layer encryption for data in transit (TLS 1.3 minimum)','PCI DSS requirement: all cardholder data in transit must use TLS 1.3+; BA specifies as NFR'],
                  ['AES-256 Encryption','Data-at-rest encryption for stored sensitive data','PCI DSS: stored card data must be encrypted with AES-256; key management is separate requirement'],
                  ['Token Vault','Secure store mapping token reference → real card data','Separate from merchant database; tightly access-controlled; audit-logged; encrypted; PCI scope is isolated here'],
                  ['ISO 8583','Legacy financial messaging protocol for card transactions (hex-encoded binary)','Understanding field mapping needed for acquirer integration specs; many acquirers still use ISO 8583'],
                  ['BIN (Bank Identification Number)','First 6–8 digits of card number that identify issuer, card type, country','Gateway uses BIN table for: routing decisions, fraud scoring, 3DS initiation, EMI eligibility checks'],
                  ['Luhn Algorithm (Mod-10)','Mathematical checksum to validate card number structure','Run on raw card input before any network call — rejects obviously invalid card numbers instantly'],
                ]}
              />
            </SectionCard>

            <SectionCard title="GATEWAY FAILURE SCENARIOS — BA INTERVIEW GOLD" color={C.red} icon="⚠️">
              <RichTable headers={['Failure Scenario','Root Cause','Risk if Not Handled','BA Requirement']} colColors={[C.red, null, C.orange, C.green]}
                rows={[
                  ['Duplicate Payment','Client retries POST /payments without idempotency key after timeout','Customer charged twice; double fulfillment triggered','Mandate Idempotency-Key on all POST APIs; server returns same result for same key'],
                  ['Webhook Not Received','Network failure, merchant server down, endpoint returns 5xx','Order never confirmed; customer in limbo; inventory not dispatched','Define retry policy with exponential backoff (up to 24h); fallback to polling GET /payments/{id}'],
                  ['Auth Success, Capture Never Happens','Merchant timeout/crash after auth; order cancelled before capture','Funds held on customer card indefinitely; customer cannot spend held amount','Define capture SLA (e.g., 24h max); auto-void uncaptured auths after threshold; alert ops team'],
                  ['Issuer Unavailable (Code 91)','Issuer bank down or slow — soft decline','False negative: transaction appears failed but may later succeed at issuer','Treat code 91 as retryable soft decline; wait 30s; retry once via different acquirer; use pending state'],
                  ['"Deducted Not Confirmed" (Net Banking)','Browser closed during redirect; network drop between bank and gateway callback','Money debited from customer; merchant thinks payment failed; double dispute risk','NEVER trust callback alone; always call GET /payments/{id} server-side to confirm before marking order FAILED'],
                  ['Capture Success, Settlement Failed','Batch processing error at acquirer; bank file corruption','Merchant not paid for completed transactions','Define settlement monitoring SLA; alert on unsettled captures > T+3; recon exception P1 escalation'],
                  ['Refund Before Settlement','Refund initiated on a transaction not yet settled by acquirer','Negative balance flow in ledger; acquirer confusion','Design refund liability account in ledger; define refund-before-settlement posting rules in BRD'],
                  ['Acquirer Single Point of Failure','All traffic on one acquirer; acquirer has outage','100% payment failure for all merchants','Require multi-acquirer routing with automatic failover; define health-check interval and switch threshold'],
                  ['Smart Routing Misfire','Routing rules send traffic to acquirer with low success rate for that BIN','Poor authorization rates; revenue loss','Define routing priority rules per BIN + card type; A/B testing before full switch; rollback capability'],
                ]}
              />
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 6 — USER JOURNEY
        ═══════════════════════════════════════════════ */}
        {tab===6 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>🧭 User Journey + Internal System Events</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>What the customer sees on the left vs what actually happens in the systems on the right — for every payment method</p>

            {Object.entries(journeyData).map(([method, rows]) => {
              const labels = { upi:['⚡ UPI Payment Journey', C.cyan], card:['💳 Online Card Journey', C.purple], netbanking:['🌐 Net Banking Journey', C.green] };
              const [title, color] = labels[method];
              return (
                <SectionCard key={method} title={title} color={color} icon="">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'8px' }}>
                    <div style={{ color:C.muted, fontSize:'11px', textTransform:'uppercase', fontWeight:'600', paddingBottom:'6px', borderBottom:`1px solid ${color}15` }}>👤 Customer Experience</div>
                    <div style={{ color:C.muted, fontSize:'11px', textTransform:'uppercase', fontWeight:'600', paddingBottom:'6px', borderBottom:`1px solid ${C.gold}15` }}>⚙️ Internal System Events</div>
                  </div>
                  {rows.map((r,i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'6px' }}>
                      <div style={{ display:'flex', gap:'8px', padding:'9px 12px', background:`${color}07`, border:`1px solid ${color}15`, borderRadius:'7px' }}>
                        <span style={{ width:'20px', height:'20px', borderRadius:'50%', background:`${color}18`, border:`1px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', color, fontSize:'10px', fontWeight:'700', flexShrink:0 }}>{i+1}</span>
                        <span style={{ color:'#c0d0e8', fontSize:'12px' }}>{r.user}</span>
                      </div>
                      <div style={{ display:'flex', gap:'8px', padding:'9px 12px', background:`${C.gold}07`, border:`1px solid ${C.gold}15`, borderRadius:'7px' }}>
                        <span style={{ width:'20px', height:'20px', borderRadius:'50%', background:`${C.gold}18`, border:`1px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontSize:'10px', fontWeight:'700', flexShrink:0 }}>{i+1}</span>
                        <span style={{ color:'#c0d0e8', fontSize:'12px' }}>{r.internal}</span>
                      </div>
                    </div>
                  ))}
                </SectionCard>
              );
            })}

            <SectionCard title="COMPLETE PAYMENT MONEY FLOW — ALL 7 STAGES + EXCEPTION PATH" color={C.teal} icon="📊">
              {[
                { label:'INITIATION', color:C.cyan, items:['Customer initiates (QR scan / card entry / Net Banking / wallet)', 'Merchant creates server-side order; idempotency key generated'] },
                { label:'AUTHENTICATION', color:C.purple, items:['UPI PIN / 3DS2 OTP / Biometric / Chip+PIN', 'Payer identity verified BEFORE authorization — liability protection'] },
                { label:'AUTHORIZATION', color:C.gold, items:['Fraud engine: 100+ signals scored in < 200ms', 'Gateway → Acquirer → Network → Issuer; funds HELD (pre-auth); response in 1–3 seconds'] },
                { label:'CAPTURE', color:C.green, items:['Merchant confirms goods/service delivered', 'Immediate (eComm) or delayed (hotels) or partial; pre-auth → captured state'] },
                { label:'CLEARING', color:C.teal, items:['Paperwork reconciliation — no money moves yet', 'EOD batch processing; interchange fees calculated by network'] },
                { label:'SETTLEMENT', color:C.orange, items:['Actual money: Issuer → Network → Acquirer → Merchant bank', 'T+1/T+2/T+3 for cards | T=0 for UPI | MDR deducted at each step'] },
                { label:'RECONCILIATION', color:C.pink, items:['All independent systems verify records match', 'Exceptions flagged: short-settle, duplicates, missing; MDR split verified'] },
              ].map((stage,i) => (
                <div key={i} style={{ display:'flex', gap:'0', marginBottom:'5px' }}>
                  <div style={{ width:'130px', flexShrink:0, background:`${stage.color}14`, border:`1px solid ${stage.color}30`, borderRadius: i===0?'8px 0 0 8px':i===6?'0 0 0 8px':'0 0 0 0', display:'flex', alignItems:'center', justifyContent:'center', padding:'10px' }}>
                    <span style={{ color:stage.color, fontWeight:'700', fontSize:'12px', textAlign:'center' }}>{stage.label}</span>
                  </div>
                  <div style={{ flex:1, background:`${stage.color}06`, border:`1px solid ${stage.color}18`, borderLeft:'none', borderRadius: i===0?'0 8px 8px 0':i===6?'0 8px 8px 0':'0 8px 8px 0', padding:'10px 14px' }}>
                    {stage.items.map((item,j) => (
                      <div key={j} style={{ color:'#b8c8e0', fontSize:'12px', display:'flex', gap:'6px' }}>
                        <span style={{ color:stage.color }}>›</span>{item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop:'12px', padding:'14px', background:`${C.orange}07`, border:`1px solid ${C.orange}20`, borderRadius:'8px' }}>
                <div style={{ color:C.orange, fontWeight:'700', marginBottom:'8px', fontSize:'13px' }}>⚠️ EXCEPTION PATH — Dispute & Chargeback</div>
                <FlowRow color={C.orange} steps={['Customer Dispute','Retrieval Request','Chargeback (funds reversed)','Representment (merchant evidence)','Pre-Arbitration','Final Arbitration (Network)']} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 7 — RISK & DISPUTES
        ═══════════════════════════════════════════════ */}
        {tab===7 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>⚖️ Risk, Fraud & Disputes — Full Deep Dive</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>8 fraud types, risk engine architecture with all signal layers, chargeback lifecycle, reason codes, reconciliation types</p>

            <SectionCard title="FRAUD TYPES — ALL 9 CATEGORIES" color={C.orange} icon="🚨">
              <RichTable headers={['Fraud Type','Description','Detection Signal','BA Defense Requirement']} colColors={[C.orange]}
                rows={[
                  ['Card-Not-Present (CNP)','Stolen card data used for online purchases — most common type','3DS OTP failure, geo mismatch, velocity spike','Mandatory 3DS2 for all online card; device fingerprint; OTP confirmation = chargeback defense'],
                  ['Friendly Fraud (First-Party)','Legitimate customer falsely claims chargeback ("I didn\'t receive it" — but they did)','Delivery confirmed in system but dispute raised','Design: order confirmation flow + customer sign-off; store delivery proof + IP + OTP confirmation'],
                  ['Account Takeover (ATO)','Fraudster takes over customer/merchant account via credential stuffing or phishing','Login from new device, new IP, unusual location','2FA on login, device binding, anomaly alert on new device login, step-up auth for high-value actions'],
                  ['Transaction Laundering','Illegal business processed under legitimate merchant MCC (e.g. gambling hidden as retail)','MCC mismatch, product category anomaly in items','Merchant website compliance review at onboarding; periodic re-check; chargeback rate monitoring'],
                  ['Synthetic Identity Fraud','Fake identity created using mix of real + fabricated data — hardest to detect','KYC document inconsistencies, address mismatch','UBO verification, video KYC, PAN-Aadhaar linkage check, live selfie verification at onboarding'],
                  ['Identity Theft','Real person\'s data used by fraudster for account creation or payments','Name-address mismatch, multiple accounts same PAN','Strong KYC with cross-referencing across databases; PAN blacklist check; Aadhaar OTP verification'],
                  ['Velocity Fraud','Multiple small transactions to test a stolen card BIN — "card testing attack"','Same card 5+ times in 10 min, small amounts increasing','Velocity rules: block same card/BIN >3 txns in 30 min; CAPTCHA for guest checkout; block after 3 failed auths'],
                  ['BIN Attack','Automated enumeration of card BINs to find valid cards from a range','Hundreds of small transactions from same IP, different cards','Rate limiting by IP; block >50 payment attempts/hour from same IP; CAPTCHA + honeypot fields'],
                  ['Phishing / Social Engineering','Customer tricked into sharing credentials via fake website, SMS, or call','Customer complaint volume, unusual auth patterns','2FA always; display merchant name clearly in OTP message; customer education campaigns'],
                ]}
              />
            </SectionCard>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' }}>
              <SectionCard title="RISK ENGINE — SIGNAL LAYERS" color={C.red} icon="🔍">
                <div style={{ marginBottom:'12px' }}>
                  <div style={{ color:C.cyan, fontWeight:'700', fontSize:'12.5px', marginBottom:'8px' }}>Input Signals (100+)</div>
                  {[
                    'Transaction amount + currency',
                    'Device fingerprint (browser, OS, screen resolution, timezone)',
                    'IP address + geolocation + VPN/proxy detection',
                    'BIN country vs billing country vs IP country mismatch',
                    'Velocity: same card used >3 times in 30 minutes',
                    'Time-of-day anomaly (4 AM txn from new country)',
                    'Email/phone number account age',
                    'Merchant MCC risk score',
                    'Historical transaction patterns for this card/customer',
                    'Previous chargeback history on this card',
                  ].map((s,i) => <div key={i} style={{ color:'#b0c4de', fontSize:'11.5px', padding:'3px 0 3px 10px', borderLeft:`2px solid ${C.cyan}30`, marginBottom:'2px' }}>— {s}</div>)}
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <div style={{ color:C.gold, fontWeight:'700', fontSize:'12.5px', marginBottom:'8px' }}>Logic Layers (3 tiers)</div>
                  {[
                    { tier:'Hard Rules', rule:'IF amount > ₹50K AND BIN country ≠ IP country AND new device → BLOCK', color:C.red },
                    { tier:'Velocity Rules', rule:'IF same card used >3 times in 30 min → REVIEW; >5 times → BLOCK', color:C.orange },
                    { tier:'ML Scoring Model', rule:'Risk score 0–100 computed; score > threshold → Challenge or Block; borderline → Manual Review', color:C.purple },
                  ].map((t,i) => (
                    <div key={i} style={{ padding:'8px 10px', marginBottom:'5px', background:`${t.color}08`, border:`1px solid ${t.color}20`, borderRadius:'6px' }}>
                      <div style={{ color:t.color, fontWeight:'600', fontSize:'12px' }}>{t.tier}</div>
                      <div style={{ color:C.muted, fontSize:'11.5px', marginTop:'2px' }}>{t.rule}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color:C.green, fontWeight:'700', fontSize:'12.5px', marginBottom:'8px' }}>Risk Actions</div>
                  {[
                    { action:'Allow', desc:'Low risk score → transaction proceeds normally', color:C.green },
                    { action:'Challenge', desc:'Medium risk → trigger 3DS2 OTP step-up authentication', color:C.gold },
                    { action:'Block', desc:'High risk → decline immediately; do not allow retry', color:C.red },
                    { action:'Manual Review', desc:'Borderline score → queue for human fraud analyst review', color:C.orange },
                  ].map((a,i) => (
                    <div key={i} style={{ display:'flex', gap:'10px', padding:'6px 10px', marginBottom:'4px', background:`${a.color}08`, borderRadius:'5px' }}>
                      <span style={{ color:a.color, fontWeight:'700', fontSize:'12px', minWidth:'100px' }}>{a.action}</span>
                      <span style={{ color:'#b0c4de', fontSize:'12px' }}>{a.desc}</span>
                    </div>
                  ))}
                </div>
                <Insight text="The False Positive tradeoff: Too aggressive = blocks legitimate transactions → revenue lost. Too lenient → fraud losses rise. BA must quantify: 'False positive rate ≤ 0.5% of total transactions' as a measurable requirement." />
              </SectionCard>

              <div>
                <SectionCard title="CHARGEBACK LIFECYCLE — 5 STAGES" color={C.pink} icon="⚖️">
                  {[
                    { num:'1', name:'Retrieval Request', desc:'Issuer asks merchant for transaction documentation before initiating formal chargeback', timeline:'0–10 days after dispute' },
                    { num:'2', name:'Chargeback', desc:'If evidence insufficient or no response → issuer provisionally reverses funds from merchant account', timeline:'10–45 days after dispute' },
                    { num:'3', name:'Representment', desc:'Merchant submits counter-evidence: delivery proof, IP logs, OTP confirmation records, signed receipt', timeline:'Merchant has 7–20 days to respond' },
                    { num:'4', name:'Pre-Arbitration', desc:'Second-cycle: issuer re-disputes if merchant wins representment but issuer still disagrees', timeline:'Post representment' },
                    { num:'5', name:'Arbitration', desc:'Card network (Visa/Mastercard) makes final and binding ruling. Losing party pays ~$500 arbitration fee.', timeline:'Final; ~60–90 days total' },
                  ].map((s,i) => (
                    <div key={i} style={{ display:'flex', gap:'12px', padding:'10px 12px', marginBottom:'6px', background:`${C.pink}07`, border:`1px solid ${C.pink}18`, borderRadius:'7px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${C.pink}20`, border:`1px solid ${C.pink}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.pink, fontWeight:'700', fontSize:'12px', flexShrink:0 }}>{s.num}</div>
                      <div>
                        <div style={{ color:C.pink, fontWeight:'700', fontSize:'12.5px' }}>{s.name}</div>
                        <div style={{ color:'#b0c4de', fontSize:'12px', margin:'3px 0' }}>{s.desc}</div>
                        <div style={{ color:C.muted, fontSize:'11px' }}>⏱ {s.timeline}</div>
                      </div>
                    </div>
                  ))}
                  <BANote text="BA must design chargeback alerting at 0.75% rate (Visa early warning: 0.65%). Define evidence pack requirements: delivery confirmation, OTP logs, IP logs, customer acceptance trail. Auto-enroll merchants in RDR (Rapid Dispute Resolution) where possible." color={C.pink} />
                </SectionCard>

                <SectionCard title="CHARGEBACK REASON CODES" color={C.purple} icon="📋">
                  <RichTable headers={['Code','Description','Type']} colColors={[C.purple]}
                    rows={[
                      ['Visa 10.4','Fraud — Card Absent Environment (CNP fraud)','Fraud'],
                      ['Visa 13.1','Merchandise / Services Not Received','Service'],
                      ['Visa 13.7','Cancelled Merchandise / Service','Service'],
                      ['Visa 12.6','Duplicate Processing','Processing'],
                      ['MC 4853','Cardholder Disputes — Not as Described','Service'],
                      ['MC 4837','No Cardholder Authorization','Fraud'],
                      ['MC 4863','Cardholder Does Not Recognize Transaction','Fraud'],
                    ]}
                  />
                  <Insight text="Chargeback Rate = (Chargebacks in month / Transactions in month) × 100. Visa standard threshold: 1%. Visa early warning: 0.65%. Mastercard excessive: 1.5%. Exceeding thresholds = fines + rolling reserve increase + potential termination." />
                </SectionCard>
              </div>
            </div>

            <SectionCard title="RECONCILIATION — 6 TYPES + PROCESS" color={C.teal} icon="🔄">
              <RichTable headers={['Reconciliation Type','What It Matches','Frequency','Key BA Design Point']} colColors={[C.teal]}
                rows={[
                  ['Transaction Reconciliation','Merchant POS/API records vs Gateway records vs Acquirer settlement file','Daily','Define matching key: transaction_id + amount + date; tolerance threshold ±₹0.50 for rounding'],
                  ['Settlement Reconciliation','Expected settlement amount vs Actual amount credited to merchant bank account','Daily / T+1','Define SLA: unmatched settlements > ₹500 → P1 alert within 2h; < ₹500 → P2 within 24h'],
                  ['Fee Reconciliation','MDR charged vs Interchange + Scheme fee + Acquirer fee breakdown','Monthly','BA must define fee tier mapping; any MDR variance > 0.01% flagged for audit'],
                  ['Chargeback Reconciliation','Chargeback debit amounts vs Internal dispute records vs Merchant P&L impact','As they occur','Each chargeback must create reversal journal entry; dispute outcome must update liability account'],
                  ['Interbank / Nostro Reconciliation','Correspondent bank statements vs Internal position records for cross-border','Daily','For international payment products; defines how FX conversion differences are handled in P&L'],
                  ['Internal Ledger Reconciliation','Gateway internal double-entry ledger vs Bank statements vs Settlement files','Daily (automated)','Define: automated matching threshold; exception escalation matrix; P1/P2/P3 severity levels'],
                ]}
              />
              <div style={{ marginTop:'14px' }}>
                <div style={{ color:C.teal, fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>Common Reconciliation Mismatches — Root Causes</div>
                <RichTable headers={['Mismatch Type','Root Cause','Resolution']} colColors={[C.orange]}
                  rows={[
                    ['Short Settlement','MDR or fee deducted at higher rate than agreed in contract','Raise dispute with acquirer; cross-check fee config table'],
                    ['Missing Transaction','Transaction not included in acquirer\'s settlement file (dropped)','Re-request settlement file; initiate manual credit claim with acquirer'],
                    ['Duplicate Transaction','Network retry created two captures for one authorization','Identify by same auth code + amount; return excess credit; fix idempotency gap'],
                    ['Currency Rounding Difference','FX conversion rounding at different rates at auth vs settlement time','Accept if < threshold (e.g. ₹0.50); log for monthly FX reconciliation'],
                    ['Refund Before Settlement','Refund processed but original transaction not yet in settlement cycle','Refund liability account absorbs until original settles; requires specific ledger rule'],
                    ['Chargeback Deduction Silent','Acquirer netted chargeback debit from merchant payout without notice','Design chargeback alert system; dispute alerting must fire before settlement is processed'],
                    ['Timing Mismatch','Transaction at 11:59 PM included in next day\'s batch settlement','Define cut-off time in recon rules; transactions after 11 PM → T+2 settlement'],
                    ['Partial Capture Mismatch','Authorized ₹5,000 but only ₹4,200 captured — settlement shows full amount','Validate captured_amount ≤ authorized_amount; recon must flag over-settlement'],
                  ]}
                />
              </div>
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 8 — LEDGER & FEES
        ═══════════════════════════════════════════════ */}
        {tab===8 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>📒 Ledger, Fees & Merchant Onboarding</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Double-entry accounting, all fee types, MDR economics, rolling reserve, merchant onboarding lifecycle, nodal accounts</p>

            <SectionCard title="DOUBLE-ENTRY LEDGER — EVERY PAYMENT EVENT" color={C.green} icon="📒">
              <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'12px' }}>Payments platforms are ledger systems with APIs around them. Every money movement creates balanced debit-credit entries. The ledger is <strong style={{ color:C.green }}>immutable, append-only</strong> — no UPDATEs or DELETEs. Corrections are new entries (reversals), never overwrites.</p>
              <RichTable headers={['Event / Trigger','Account Debited','Account Credited','Amount','Why']} colColors={[C.green, C.cyan, C.gold]}
                rows={[
                  ['1. Customer pays ₹1,000','Customer Clearing A/c','Merchant Payable A/c','₹1,000','Fund received from customer; owed to merchant'],
                  ['2. MDR deducted (2% = ₹20)','Merchant Payable A/c','Gateway Revenue A/c','₹20','Gateway earns its fee at settlement time'],
                  ['3. GST on MDR (18% of ₹20 = ₹3.60)','Merchant Payable A/c','Tax Liability A/c','₹3.60','GST on service fee; paid to government'],
                  ['4. Rolling Reserve withheld (7% = ₹70)','Merchant Payable A/c','Rolling Reserve A/c','₹70','Risk buffer withheld; released after 90–180 days'],
                  ['5. Settlement to merchant (T+1)','Merchant Payable A/c','Bank Settlement A/c','₹906.40','Net amount credited to merchant bank account'],
                  ['6. Refund issued (full ₹1,000)','Refund Liability A/c','Customer Clearing A/c','₹1,000','Merchant-initiated refund; money returned to customer'],
                  ['7. Chargeback raised (₹1,000)','Chargeback Liability A/c','Merchant Payable A/c','₹1,000','Forced reversal by issuer; merchant account debited'],
                  ['8. Rolling Reserve released (after 90 days)','Rolling Reserve A/c','Bank Settlement A/c','₹70','Risk buffer released to merchant after holding period'],
                ]}
              />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:'8px', marginTop:'14px' }}>
                {[
                  { state:'Pending Balance', def:'Auth hold placed — funds reserved, not yet debited from card', color:C.gold },
                  { state:'Available Balance', def:'Funds fully captured and confirmed by issuer bank', color:C.green },
                  { state:'Reserved Balance', def:'Rolling reserve withheld against future chargebacks (5–10% GMV)', color:C.orange },
                  { state:'Refund Liability', def:'Amount earmarked for in-process refund to customer', color:C.pink },
                  { state:'Chargeback Liability', def:'Funds held for open dispute that may result in reversal', color:C.red },
                  { state:'Settled Amount', def:'Amount already paid out to merchant bank account', color:C.cyan },
                ].map((b,i) => (
                  <div key={i} style={{ padding:'10px', background:`${b.color}08`, border:`1px solid ${b.color}20`, borderRadius:'7px' }}>
                    <div style={{ color:b.color, fontWeight:'700', fontSize:'12px', marginBottom:'4px' }}>{b.state}</div>
                    <div style={{ color:C.muted, fontSize:'11px' }}>{b.def}</div>
                  </div>
                ))}
              </div>
              <BANote text="Ledger design is the most complex part of payments. A refund can happen before the original settles (negative balance flow). A chargeback can arrive 60 days after the original transaction. Multi-currency introduces FX rate differences between auth and settlement time. All these edge cases must have defined journal entry rules in your BRD." />
            </SectionCard>

            <SectionCard title="FEES & ECONOMICS — COMPLETE STRUCTURE" color={C.gold} icon="💰">
              <RichTable headers={['Fee Type','Definition','Who Pays','Who Receives','Typical Rate (India)']} colColors={[C.gold]}
                rows={[
                  ['Interchange Fee','Core per-transaction fee — reward for card issuance risk + rewards programs','Acquirer pays Issuer (passed to merchant via MDR)','Issuer Bank','0.5–1.8% Debit; 1.2–2.0% Credit; 0% RuPay Debit (P2M)'],
                  ['Scheme / Network Fee','Card network\'s cut for infrastructure, rules, settlement framework','Acquirer pays Network (passed to merchant)','Visa / Mastercard / RuPay','0.05–0.15% of transaction value'],
                  ['MDR (Merchant Discount Rate)','Total fee charged to merchant per transaction; covers all downstream fees + margin','Merchant pays Acquirer/Gateway','Distributed: Issuer + Network + Acquirer + Gateway','1.5–3.0% Credit; 0.9–1.5% Debit; 0% UPI/RuPay Debit P2M'],
                  ['Acquiring/Processing Fee','Acquirer\'s margin above interchange + scheme','Merchant (included in MDR)','Acquirer Bank','0.2–0.5% (on top of interchange + scheme)'],
                  ['Gateway / Platform Fee','Gateway\'s revenue — technology, routing, risk, APIs','Merchant (included in MDR or separate SaaS fee)','Payment Gateway','0.1–0.3% txn + ₹0–10,000/month platform fee'],
                  ['FX Markup / Cross-Border Surcharge','Currency conversion spread on international transactions','Customer or Merchant (depending on agreement)','Bank / Network','1.5–3.5% of transaction amount'],
                  ['Chargeback Fee','Per-dispute processing penalty — even if merchant wins','Merchant','Acquirer / Card Network','₹15–50 per chargeback + arbitration fee ~$500 if escalated'],
                  ['GST on MDR','18% Goods and Services Tax on the MDR service fee','Merchant','Government (via gateway)','18% of MDR amount (e.g. 18% of ₹20 MDR = ₹3.60)'],
                  ['Rolling Reserve','Risk buffer withheld by acquirer/gateway from merchant GMV','Merchant (deferred; returned after holding period)','Held in escrow; released after 90–180 days','5–10% of GMV; higher for high-risk merchants'],
                  ['Settlement Fee','Per-transaction fee for fund transfer to merchant bank','Merchant','Acquirer / Gateway','₹0.50–₹5 per settlement transfer'],
                ]}
              />
              <div style={{ marginTop:'14px', padding:'14px', background:`${C.gold}08`, border:`1px solid ${C.gold}20`, borderRadius:'8px' }}>
                <div style={{ color:C.gold, fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>MDR Split on ₹1,000 Transaction at 2% MDR</div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  {[
                    { party:'Interchange → Issuer', pct:'1.4%', amt:'₹14', color:C.cyan },
                    { party:'Scheme Fee → Network', pct:'0.1%', amt:'₹1', color:C.gold },
                    { party:'Acquirer Margin', pct:'0.3%', amt:'₹3', color:C.green },
                    { party:'Gateway Margin', pct:'0.2%', amt:'₹2', color:C.purple },
                    { party:'Merchant Receives', pct:'98%', amt:'₹980 (net)', color:C.orange },
                  ].map((r,i) => (
                    <div key={i} style={{ flex:1, minWidth:'140px', padding:'10px 12px', background:`${r.color}09`, border:`1px solid ${r.color}22`, borderRadius:'7px', textAlign:'center' }}>
                      <div style={{ color:r.color, fontWeight:'800', fontSize:'16px' }}>{r.amt}</div>
                      <div style={{ color:r.color, fontWeight:'600', fontSize:'11.5px' }}>{r.pct}</div>
                      <div style={{ color:C.muted, fontSize:'11px', marginTop:'2px' }}>{r.party}</div>
                    </div>
                  ))}
                </div>
                <Insight text="Zero MDR policy: RBI mandated 0% MDR on UPI P2M and RuPay Debit cards. Since UPI is 85% of India's volume, gateways can't earn transaction fees on most payments. Monetization shifts to: premium instant settlement, SaaS subscriptions, payouts API, embedded lending, international FX margin." />
              </div>
            </SectionCard>

            <SectionCard title="MERCHANT ONBOARDING LIFECYCLE — 5 STEPS" color={C.cyan} icon="🏪">
              <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'14px' }}>Merchant onboarding is the commercial, compliance, and technical gateway into the payments platform. If this flow is weak — fraud, AML issues, chargebacks, and operational losses rise later. Every step has regulatory requirements.</p>
              {[
                { step:'01', title:'Application & Signup', color:C.cyan, items:['Business name, registered address, PAN, CIN (for companies)', 'GST registration certificate', 'Bank account details (current account for settlement — not savings)', 'Business model description + website URL for review', 'Expected monthly turnover (TPV estimate) and average ticket size', 'MCC (Merchant Category Code) selection and validation'] },
                { step:'02', title:'KYC & Risk Assessment', color:C.gold, items:['KYC documents: Aadhaar, PAN, Certificate of Incorporation, bank statement (6 months)', 'AML screening: OFAC, UN, RBI domestic sanctions watchlist cross-check', 'UBO identification: who owns >25% stake — full KYC on each UBO', 'Business category risk scoring: high-risk MCCs get deeper scrutiny (gambling, pharma, crypto, adult)', 'Website compliance review: T&C, refund policy, delivery timeline, contact info must be displayed', 'MCC mapping accuracy: wrong MCC breaks pricing, fraud rules, and reporting'] },
                { step:'03', title:'Commercial Agreement', color:C.orange, items:['Settlement cycle agreed: T+1 / T+2 / T+7 (lower TPV merchants get T+7)', 'MDR rate negotiation and contract signing (higher TPV = lower MDR)', 'Rolling reserve terms: % withheld and holding period (higher risk = higher %; standard 90 days)', 'Chargeback liability clauses: who bears cost; threshold before review', 'Escalation and dispute process, SLA commitments', 'Instant settlement product if required (premium pricing)'] },
                { step:'04', title:'Technical Integration', color:C.purple, items:['API key generation: test environment + production environment (separate keys)', 'Webhook URL setup: test firing and signature verification testing', 'Sandbox testing: all scenarios — success, decline, timeout, refund, chargeback, partial capture', 'Go-live checklist: IP whitelisting, SSL certificate, 3DS config, tokenization setup', 'Payment method configuration: enable/disable card/UPI/NB/wallet per merchant needs', 'MDR configuration validation in fee engine: verify merchant gets correct rates'] },
                { step:'05', title:'Post Go-Live Monitoring', color:C.green, items:['Real-time transaction monitoring dashboard for merchant', 'Fraud spike detection with auto-alert at 2× baseline fraud rate', 'Chargeback rate tracking vs Visa/MC thresholds (alert at 0.65%; block at 1%)', 'Periodic KYC refresh: annually for all merchants; immediately on adverse media alert', 'Website compliance periodic checks: ensure T&C, refund policy still displayed', 'Revenue tracking: GMV, transaction count, auth rate, method mix, settlement amounts'] },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', gap:'0', marginBottom:'8px' }}>
                  <div style={{ width:'60px', flexShrink:0, background:`${s.color}15`, border:`1px solid ${s.color}30`, borderRadius:'8px 0 0 8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', color:s.color, fontSize:'18px' }}>{s.step}</div>
                  <div style={{ flex:1, background:`${s.color}05`, border:`1px solid ${s.color}18`, borderLeft:'none', borderRadius:'0 8px 8px 0', padding:'12px 16px' }}>
                    <div style={{ color:s.color, fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>{s.title}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'4px' }}>
                      {s.items.map((item,j) => <div key={j} style={{ fontSize:'11.5px', color:'#b0c4de', paddingLeft:'10px', borderLeft:`2px solid ${s.color}30` }}>{item}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="NODAL / ESCROW ACCOUNT — RBI MANDATE" color={C.teal} icon="🏦">
              <p style={{ color:'#b0c4de', fontSize:'12px', lineHeight:'1.6', marginBottom:'12px' }}>Under RBI's Payment Aggregator (PA) Guidelines, all Payment Aggregators must hold merchant funds in a Nodal Account until settlement. This prevents PAs from misusing merchant funds.</p>
              <FlowRow color={C.teal} steps={['Customer pays ₹1,000','Funds received in Nodal A/c (held by PA)','PA calculates Net: ₹1,000 - MDR - Reserve','T+1 Settlement: Net credited to Merchant Bank','PA reconciles Nodal A/c daily — must match pending settlements']} />
              <BANote text="PA cannot earn interest on nodal account funds. Daily reconciliation of nodal account is mandatory — balance must equal total pending settlements. Any mismatch is a regulatory red flag. BA must design: daily nodal recon report, exception alerting, and pending-settlement ageing dashboard." color={C.teal} />
            </SectionCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 9 — SIMULATOR
        ═══════════════════════════════════════════════ */}
        {tab===9 && (() => {
          const currentFlow = SIM_FLOWS[simMethod];
          const insights = simInsights[simMethod] || [];
          const startSim = () => { setSimStep(0); setSimRunning(true); };
          const resetSim = () => { setSimStep(-1); setSimRunning(false); };
          const nextStep = () => {
            if (simStep < currentFlow.length-1) setSimStep(s => s+1);
            else setSimRunning(false);
          };
          return (
            <div>
              <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>🧪 Payment Transaction Simulator</h2>
              <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Step through any payment method and see every internal hop in real-time. Each step reveals a BA insight.</p>

              <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
                {[{id:'card',label:'💳 Card (3DS)',color:C.cyan},{id:'upi',label:'⚡ UPI Pay',color:C.gold},{id:'netbanking',label:'🌐 Net Banking',color:C.green},{id:'wallet',label:'👜 Wallet (PPI)',color:C.purple}].map(m => (
                  <button key={m.id} onClick={() => { setSimMethod(m.id); resetSim(); }} style={{ padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', transition:'all 0.15s', border: simMethod===m.id ? `2px solid ${m.color}` : `1px solid ${C.border}`, background: simMethod===m.id ? `${m.color}15` : C.surface, color: simMethod===m.id ? m.color : C.muted, boxShadow: simMethod===m.id ? `0 0 16px ${m.color}20` : 'none' }}>{m.label}</button>
                ))}
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ color:C.muted, fontSize:'12px' }}>Auto-Play</span>
                  <div onClick={() => setAutoPlay(v => !v)} style={{ width:'44px', height:'24px', borderRadius:'12px', background: autoPlay ? `${C.cyan}40` : C.border, border:`1px solid ${autoPlay ? C.cyan : C.muted}`, cursor:'pointer', position:'relative', transition:'all 0.2s' }}>
                    <div style={{ position:'absolute', top:'3px', left: autoPlay ? '22px' : '3px', width:'16px', height:'16px', borderRadius:'50%', background: autoPlay ? C.cyan : C.muted, transition:'left 0.2s' }} />
                  </div>
                </div>
              </div>

              <div ref={simRef} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                  <div style={{ flex:1, height:'4px', background:'#1a2540', borderRadius:'2px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:`linear-gradient(90deg, ${C.cyan}, ${C.gold})`, borderRadius:'2px', width: simStep<0 ? '0%' : `${((simStep+1)/currentFlow.length)*100}%`, transition:'width 0.4s ease' }} />
                  </div>
                  <span style={{ color:C.muted, fontSize:'12px', minWidth:'60px' }}>{simStep<0?'0':simStep+1} / {currentFlow.length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {currentFlow.map((step,i) => {
                    const active = i===simStep, done = i<simStep, future = i>simStep;
                    return (
                      <div key={i} ref={active ? activeStepRef : null} style={{ display:'flex', gap:'12px', padding:'12px 16px', borderRadius:'8px', transition:'all 0.35s', background: active ? `${step.color}12` : done ? `${step.color}05` : 'transparent', border:`1px solid ${active ? step.color+'50' : done ? step.color+'20' : C.border}`, opacity: future && simStep>=0 ? 0.35 : 1, transform: active ? 'translateX(4px)' : 'none', boxShadow: active ? `0 0 20px ${step.color}18` : 'none' }}>
                        <div style={{ width:'30px', flexShrink:0, display:'flex', alignItems:'flex-start', paddingTop:'2px' }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: active ? `${step.color}25` : done ? `${step.color}15` : C.border, border:`2px solid ${active ? step.color : done ? step.color+'60' : C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: done ? '12px' : '11px', color: active ? step.color : done ? step.color : C.muted, transition:'all 0.3s' }}>{done ? '✓' : i+1}</div>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', gap:'8px', flexWrap:'wrap' }}>
                            <span style={{ color: active ? step.color : done ? step.color+'cc' : C.muted, fontWeight: active ? '700' : '600', fontSize:'12.5px' }}>{step.actor}</span>
                            <span style={{ fontFamily:'monospace', fontSize:'10.5px', color: active ? step.color+'aa' : C.muted, background:'#0a0f1a', padding:'2px 7px', borderRadius:'3px' }}>{step.tech}</span>
                          </div>
                          <div style={{ color: active ? '#e0e8ff' : done ? '#90a0b8' : '#606878', fontSize:'12px', marginTop:'4px', transition:'color 0.3s' }}>{step.action}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'14px' }}>
                {simStep<0 ? (
                  <button onClick={startSim} style={{ padding:'12px 32px', borderRadius:'8px', background:`linear-gradient(135deg, ${C.cyan}, #0066ff)`, border:'none', color:'#fff', fontWeight:'700', fontSize:'13px', cursor:'pointer', boxShadow:`0 0 20px ${C.cyan}30` }}>▶ Start Simulation</button>
                ) : (
                  <>
                    {simStep < currentFlow.length-1 ? (
                      <button onClick={nextStep} style={{ padding:'12px 28px', borderRadius:'8px', background:`${C.gold}18`, border:`1px solid ${C.gold}50`, color:C.gold, fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Next Step →</button>
                    ) : (
                      <div style={{ padding:'12px 24px', background:`${C.green}12`, border:`1px solid ${C.green}40`, borderRadius:'8px', color:C.green, fontWeight:'700', fontSize:'13px' }}>✅ Transaction Complete!</div>
                    )}
                    <button onClick={resetSim} style={{ padding:'12px 22px', borderRadius:'8px', background:`${C.red}10`, border:`1px solid ${C.red}30`, color:C.red, fontWeight:'600', fontSize:'13px', cursor:'pointer' }}>↺ Reset</button>
                  </>
                )}
              </div>

              {simStep>=0 && insights[simStep] && (
                <div style={{ padding:'14px 18px', background:`${currentFlow[simStep].color}09`, border:`1px solid ${currentFlow[simStep].color}30`, borderRadius:'8px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'18px', flexShrink:0 }}>💡</span>
                  <div>
                    <div style={{ color:currentFlow[simStep].color, fontWeight:'700', fontSize:'12.5px', marginBottom:'3px' }}>Step {simStep+1} Insight</div>
                    <div style={{ color:'#c0d0e8', fontSize:'12.5px', lineHeight:'1.6' }}>{insights[simStep]}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══════════════════════════════════════════════
            TAB 10 — COMPARISON MATRIX
        ═══════════════════════════════════════════════ */}
        {tab===10 && (
          <div>
            <h2 style={{ color:C.gold, margin:'0 0 4px', fontSize:'18px' }}>📊 Payment Method Comparison Matrix</h2>
            <p style={{ color:C.muted, fontSize:'12px', marginBottom:'20px' }}>Complete side-by-side comparison for BA analysis, product decisions, and interview prep</p>

            <SectionCard title="MASTER COMPARISON — ALL PAYMENT METHODS (11 DIMENSIONS)" color={C.gold} icon="📋">
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px', minWidth:'1000px' }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                      {['Dimension','⚡ UPI','💳 Debit Card','💳 Credit Card','🌐 Net Banking','👜 Wallet (PPI)','🔄 NEFT','🔄 RTGS','🔄 NACH'].map((h,i) => (
                        <th key={i} style={{ padding:'10px 12px', textAlign:'left', color: i===0 ? C.muted : C.gold, fontSize:'11px', fontWeight:'700', background:'#08101e', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { dim:'⚡ Speed', vals:['Instant (T=0)','Auth instant; settle T+1–T+2','Auth instant; settle T+1–T+2','Immediate debit; settle T+1','Instant (on-us)','30-min batch cycles','Immediate (gross, each txn)','T+1 batch'] },
                      { dim:'💰 MDR / Cost', vals:['0% MDR (P2M, RBI mandate)','~0.5–0.9%','~1.5–3.0%','~1–2%','~1.5–2%','₹2.5–₹25 flat fee','₹25–₹50 flat fee','~₹0.50/txn'] },
                      { dim:'🔒 Authentication', vals:['UPI PIN (6-digit) + device binding','PIN / Chip / Contactless NFC','PIN / 3DS2 OTP / Biometric','User ID + IPIN + OTP (2FA)','Wallet PIN / Biometric (< ₹2K skip)','Net Banking / UPI login','Corporate ID + Token OTP','One-time mandate auth (NACH debit automatic)'] },
                      { dim:'📊 Settlement', vals:['Real-time net (T=0)','DNS batch (T+1–T+3)','DNS batch (T+1–T+3)','DNS batch (T+1–T+2)','Platform batch (T+1)','Deferred net batch (DNS)','Gross real-time (per transaction)','Net batch (T+1)'] },
                      { dim:'💵 Max Amount', vals:['₹1L/txn general; ₹5L high-value','Issuer daily limit','Credit card limit','No hard regulatory cap','₹2L balance (Full-KYC)','No cap (bank-specific upper)','Min ₹2L; no cap','Per mandate cap agreed'] },
                      { dim:'🌐 Internet Needed?', vals:['Yes (UPI Lite: No — NFC offline)','No (POS); Yes (online)','No (POS); Yes (online + 3DS)','Yes — browser redirect required','Yes (wallet app)','Yes — net banking/API','Yes — corporate net banking','Yes (setup); No (auto-debit execution)'] },
                      { dim:'🔄 Reversible?', vals:['No (instant final; reversal if failed)','Yes — auth void/refund possible','Yes — auth void/refund/chargeback','Refund via NEFT (T+1)','Refund to wallet or source account','NEFT return for closed accounts','Rare; regulatory approval needed','Mandate cancel + ECS return'] },
                      { dim:'⚠️ Key Risk', vals:['VPA fraud, device takeover, SIM swap','Card skimming (POS), CNP fraud online','CNP fraud, friendly fraud, chargebacks','"Deducted not confirmed" on redirect','KYC compliance breach; wallet expiry','Batch failure, bank holiday delay','Irreversible; high value; SPOF risk','Mandate misuse; bounce charges on failed debit'] },
                      { dim:'🏆 Best Use Case', vals:['P2P, P2M everyday payments, utilities','Retail POS, daily spending','Credit, EMI, travel, rewards','Large one-time transfers, B2B','Closed ecosystem, food delivery apps','Standard salary/vendor payments','Large corporate, property, B2B','Recurring: EMI, SIP, insurance, SaaS'] },
                      { dim:'📱 India Usage (2025)', vals:['85% of retail transaction count','Declining vs UPI; ~5% volume','Stable; ~7% value contribution','~4–6% of volume; high-value','Paytm, Amazon Pay, PhonePe wallet','~10% of value; corporate-heavy','~5% of volume; 40%+ of total value','EMI, insurance, SIP: growing fast'] },
                      { dim:'🏛️ Regulator', vals:['RBI + NPCI','RBI + Card Networks (Visa/MC/RuPay)','RBI + Card Networks','RBI + Individual Scheduled Banks','RBI (PA/PG + PPI guidelines)','RBI + NPCI','RBI + NPCI','RBI + NPCI'] },
                    ].map((row,ri) => (
                      <tr key={ri} style={{ borderBottom:`1px solid #0d1520`, background: ri%2===0 ? 'transparent' : 'rgba(255,255,255,0.008)' }}>
                        <td style={{ padding:'9px 12px', color:C.cyan, fontWeight:'700', fontSize:'12px', whiteSpace:'nowrap', background:'#08101e' }}>{row.dim}</td>
                        {row.vals.map((v,vi) => <td key={vi} style={{ padding:'9px 12px', color:'#a8bcce', fontSize:'11.5px', verticalAlign:'top', lineHeight:'1.5' }}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="WHEN TO USE WHICH — BA DECISION GUIDE (10 SCENARIOS)" color={C.teal} icon="🎯">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'12px' }}>
                {[
                  { scenario:'Consumer paying at restaurant / kirana', winner:'⚡ UPI (QR Scan)', why:'Zero MDR for merchant, instant, no terminal needed, universal penetration in India', color:C.cyan },
                  { scenario:'eCommerce checkout with EMI and rewards', winner:'💳 Credit Card', why:'Customer wants EMI + reward points; merchant pays MDR for higher AOV and conversion', color:C.purple },
                  { scenario:'Corporate vendor payment above ₹5 Lakh', winner:'🔄 RTGS', why:'Above ₹2L threshold; instant gross settlement; UTR for reconciliation; irreversible = certain funds', color:C.gold },
                  { scenario:'Monthly SIP / insurance premium auto-debit', winner:'🔄 NACH / UPI AutoPay', why:'Set-once mandate; no customer action each cycle; NACH for legacy; UPI AutoPay for digital-native', color:C.green },
                  { scenario:'Utility bill payment (electricity, water)', winner:'⚡ UPI via BBPS', why:'BBPS standardized; zero MDR; instant confirmation; unique receipt for regulatory proof', color:C.cyan },
                  { scenario:'International merchant / travel booking', winner:'💳 Card (Visa/Mastercard)', why:'Global acceptance network; FX conversion handled by issuer; UPI not available cross-border', color:C.orange },
                  { scenario:'Salary disbursement to 5,000 employees', winner:'🔄 NEFT/IMPS Bulk', why:'Corporate net banking bulk CSV upload; NEFT for standard; IMPS for instant; UTR per credit', color:C.teal },
                  { scenario:'In-app purchase (gaming / food app)', winner:'👜 Wallet / UPI', why:'Wallet: frictionless below PIN threshold; UPI: zero MDR; both support 1-click repeat payment', color:C.pink },
                  { scenario:'Hotel booking with deferred final amount', winner:'💳 Card (pre-auth)', why:'Only instrument supporting delayed + partial capture; hotels need pre-auth hold on card', color:C.purple },
                  { scenario:'Unbanked rural customer payment', winner:'📲 UPI Lite / USSD *99#', why:'UPI Lite: offline NFC, no PIN, no internet; USSD: feature phone, BCs in rural areas, no smartphone', color:C.gold },
                ].map((c,i) => (
                  <div key={i} style={{ background:`${c.color}07`, border:`1px solid ${c.color}22`, borderRadius:'10px', padding:'14px' }}>
                    <div style={{ color:C.muted, fontSize:'11px', marginBottom:'4px' }}>Use case</div>
                    <div style={{ color:'#e0e8ff', fontWeight:'600', fontSize:'12.5px', marginBottom:'7px' }}>{c.scenario}</div>
                    <div style={{ color:c.color, fontWeight:'700', fontSize:'13px', marginBottom:'6px' }}>{c.winner}</div>
                    <div style={{ color:C.muted, fontSize:'11.5px', borderTop:`1px solid ${c.color}18`, paddingTop:'6px' }}>{c.why}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="BA KPI DASHBOARD — COMPLETE PAYMENTS METRICS" color={C.pink} icon="📈">
              <RichTable headers={['KPI','Formula','Industry Target','Why BA Must Track This']} colColors={[C.pink]}
                rows={[
                  ['Authorization Rate','Approved auths / Total auth attempts × 100','>95% (industry)','Low auth rate = revenue leak; each 1% improvement can mean millions in GMV for large merchants'],
                  ['Payment Success Rate','Captured payments / Initiated payments × 100','>99% UPI; >94% cards','End-to-end success; failures here = customer experience failure + support cost'],
                  ['Chargeback Rate','Chargebacks in month / Transactions in month × 100','<0.65% (Visa early warning); <1% (standard)','Exceeding threshold = fines, rolling reserve increase, potential merchant termination'],
                  ['Fraud Rate','Fraudulent transaction value / Total GMV × 100','<0.1% (industry)', 'Measured in basis points; each bp = significant dollar amount at scale'],
                  ['False Positive Rate','Legitimate transactions blocked / Total blocked × 100','<0.5%','Overly aggressive fraud control blocks genuine customers; BA must balance with fraud rate'],
                  ['Settlement TAT','Time from capture to merchant bank credit','T+1 standard; instant = premium','Merchant cash flow depends on this; define per merchant tier'],
                  ['Recon Match Rate','Matched transactions / Total transactions in file × 100','>99.9%','Sub-99.9% = operational exception volume; P1 investigation required above threshold'],
                  ['Webhook Delivery Rate','Successfully delivered webhooks / Total fired × 100','>99.5%','Undelivered webhooks = unconfirmed orders = customer and merchant experience failures'],
                  ['Auth Rate by BIN','Auth success rate per BIN prefix','>95% per major BIN group','Low BIN-specific auth rate = routing issue to suboptimal acquirer; fix with smart routing rules'],
                  ['Decline Rate by Reason','% of declines by code (51, 05, 91, etc.)','<5% total; <2% soft declines','Breakdown tells whether issue is fraud (05), balance (51), or routing (91); different fixes for each'],
                ]}
              />
            </SectionCard>
          </div>
        )}

      </div>
    </div>
  );
}
