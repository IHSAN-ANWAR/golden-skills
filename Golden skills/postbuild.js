import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, 'dist');

// Read current index.html
let html = readFileSync(resolve(distDir, 'index.html'), 'utf8');

const inlineStyles = `
      /* ===== CSS VARIABLES ===== */
      :root{--alert-banner-height:60px;--navbar-height:75px;--total-header-height:135px;--gold:#D4AF37;--gold-light:#F4D03F;--gold-dark:#a8891a;--primary:#390910;--primary-dark:#220608;--primary-color:#390910;--accent-color:#D4AF37;--accent-light:#F4D03F;--cream:#FAF7F2;--ink:#1a0a0c;--ink-soft:#4a2a2e;--ink-muted:#7a5a5e;--text-color:#1a0a0c;--text-light:#4a2a2e;--font-head:'Poppins',system-ui,sans-serif;--font-body:'Inter',system-ui,sans-serif;--heading-font:'Poppins',system-ui,sans-serif;--body-font:'Inter',system-ui,sans-serif;--glass-white:rgba(255,255,255,0.72);--glass-blur:blur(20px) saturate(1.6);--glass-border:rgba(212,175,55,0.22);--glass-bg-white:rgba(255,255,255,0.70);--shadow-md:0 8px 32px rgba(0,0,0,0.10);--shadow-gold:0 8px 32px rgba(212,175,55,0.28);--shadow-gold-lg:0 16px 48px rgba(212,175,55,0.42);--r-sm:8px;--r-md:16px;--r-lg:24px;--r-xl:32px;--r-full:9999px;--ease:cubic-bezier(0.4,0,0.2,1);}
      body{font-family:'Inter',system-ui,-apple-system,sans-serif;margin:0;padding:0;background:#FAF7F2;}
      h1,h2,h3,h4,h5,h6{font-family:'Poppins',system-ui,sans-serif;}
      /* ALERT BANNER */
      .alert-banner{background:linear-gradient(90deg,#b8960e 0%,#D4AF37 30%,#F4D03F 50%,#D4AF37 70%,#b8960e 100%)!important;color:#390910!important;position:fixed!important;top:0!important;left:0!important;right:0!important;height:60px!important;z-index:1040!important;display:flex!important;align-items:center!important;box-shadow:0 2px 12px rgba(212,175,55,.4)!important;}
      .alert-content{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;width:100%;}
      .alert-text{margin:0;font-size:1rem;font-weight:600;flex:1;text-align:center;}
      .alert-close{background:rgba(255,255,255,.2);border:none;color:#390910;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      /* NAVBAR */
      .navbar-custom{position:fixed!important;top:60px!important;left:0!important;right:0!important;z-index:1030!important;min-height:75px!important;background:linear-gradient(135deg,rgba(34,6,8,.96) 0%,rgba(57,9,16,.94) 50%,rgba(92,16,24,.92) 100%)!important;padding:0!important;}
      .navbar-custom .container{height:75px;display:flex;align-items:center;}
      .navbar-logo{width:52px!important;height:52px!important;max-width:52px!important;max-height:52px!important;border-radius:50%!important;object-fit:cover!important;border:2px solid rgba(212,175,55,.6)!important;}
      .brand-text{font-family:'Poppins',sans-serif!important;font-weight:800!important;background:linear-gradient(135deg,#D4AF37,#F4D03F,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .navbar-custom .navbar-brand{color:#D4AF37!important;font-weight:800!important;font-family:'Poppins',sans-serif!important;}
      .navbar-custom .nav-link{color:rgba(255,255,255,.82)!important;font-weight:600!important;padding:.5rem 1rem!important;border-radius:8px!important;}
      .navbar-custom .nav-link:hover{color:#F4D03F!important;background:rgba(212,175,55,.1)!important;}
      .navbar-custom .nav-link.active{color:#D4AF37!important;background:rgba(212,175,55,.12)!important;}
      .btn-download-app{background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;color:#390910!important;border:none!important;border-radius:9999px!important;padding:.6rem 1.4rem!important;font-weight:700!important;cursor:pointer!important;font-size:.85rem!important;}
      .navbar-toggler{border:1.5px solid rgba(212,175,55,.45)!important;border-radius:8px!important;}
      /* FOOTER */
      .footer-section{background:linear-gradient(160deg,#220608 0%,#390910 50%,#5c1018 100%)!important;color:#fff!important;padding:5rem 0 0!important;display:block!important;position:relative!important;overflow:hidden!important;}
      .footer-inner{max-width:1280px!important;margin:0 auto!important;padding:0 2rem!important;position:relative!important;z-index:1!important;}
      .footer-grid{display:grid!important;grid-template-columns:2fr 1fr 1fr 1.2fr!important;gap:3rem!important;padding-bottom:3rem!important;border-bottom:1px solid rgba(212,175,55,.18)!important;}
      .footer-heading{font-family:'Poppins',sans-serif!important;font-size:1.5rem!important;font-weight:800!important;color:#D4AF37!important;margin:0 0 1rem!important;}
      .footer-col-title{font-family:'Poppins',sans-serif!important;font-size:1rem!important;font-weight:700!important;color:#D4AF37!important;text-transform:uppercase!important;letter-spacing:1px!important;margin:0 0 1.2rem!important;}
      .footer-desc{font-size:.92rem!important;color:rgba(255,255,255,.7)!important;line-height:1.7!important;margin-bottom:1.5rem!important;}
      .footer-links{list-style:none!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:.6rem!important;}
      .footer-links a,.footer-link-btn{font-size:.92rem!important;color:rgba(255,255,255,.75)!important;text-decoration:none!important;background:none!important;border:none!important;cursor:pointer!important;padding-left:16px!important;position:relative!important;display:inline-block!important;}
      .footer-links a:hover,.footer-link-btn:hover{color:#F4D03F!important;}
      .link-danger{color:rgba(255,140,140,.85)!important;}
      .footer-social{display:flex!important;gap:10px!important;flex-wrap:wrap!important;margin-bottom:1.5rem!important;}
      .footer-social-btn{width:44px!important;height:44px!important;border-radius:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:1.2rem!important;color:#fff!important;text-decoration:none!important;}
      .footer-social-btn.facebook{background:#1877f2!important;}.footer-social-btn.instagram{background:linear-gradient(135deg,#f09433,#dc2743,#bc1888)!important;}.footer-social-btn.youtube{background:#ff0000!important;}.footer-social-btn.tiktok{background:#000!important;}
      .footer-contact-item{display:flex!important;align-items:center!important;gap:10px!important;font-size:.88rem!important;color:rgba(255,255,255,.7)!important;margin:0!important;}
      .footer-contact-item a{color:rgba(255,255,255,.7)!important;text-decoration:none!important;}
      .footer-contact-item i,.footer-fbr-ntn i{color:#D4AF37!important;}
      .footer-fbr-section{display:grid!important;grid-template-columns:2fr 1fr!important;gap:2rem!important;padding:2.5rem 0!important;border-bottom:1px solid rgba(212,175,55,.18)!important;}
      .footer-fbr-badge{background:rgba(212,175,55,.08)!important;border:1.5px solid rgba(212,175,55,.25)!important;border-radius:24px!important;padding:1.5rem!important;display:flex!important;align-items:center!important;gap:1.2rem!important;}
      .footer-fbr-icon{width:56px!important;height:56px!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;border-radius:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:1.6rem!important;color:#390910!important;flex-shrink:0!important;}
      .footer-fbr-title{font-family:'Poppins',sans-serif!important;font-size:1.05rem!important;font-weight:700!important;color:#D4AF37!important;margin:0 0 .4rem!important;}
      .footer-fbr-ntn{font-size:.88rem!important;color:rgba(255,255,255,.85)!important;margin:0 0 .5rem!important;font-weight:600!important;display:flex!important;align-items:center!important;gap:6px!important;}
      .footer-fbr-text{font-size:.82rem!important;color:rgba(255,255,255,.6)!important;margin:0!important;}
      .footer-account-badge{background:rgba(255,255,255,.05)!important;border:1.5px solid rgba(212,175,55,.2)!important;border-radius:16px!important;padding:1.2rem!important;display:flex!important;align-items:center!important;gap:1rem!important;}
      .footer-account-badge>i{font-size:1.8rem!important;color:#D4AF37!important;}
      .footer-account-info{display:flex!important;flex-direction:column!important;gap:3px!important;}
      .footer-account-label{font-size:.72rem!important;color:rgba(255,255,255,.55)!important;text-transform:uppercase!important;letter-spacing:.5px!important;}
      .footer-account-name{font-family:'Poppins',sans-serif!important;font-size:1.05rem!important;font-weight:700!important;color:#D4AF37!important;}
      .footer-app-btn{display:inline-flex!important;align-items:center!important;gap:10px!important;background:rgba(212,175,55,.08)!important;border:1.5px solid rgba(212,175,55,.35)!important;border-radius:16px!important;padding:10px 18px!important;color:#fff!important;text-decoration:none!important;}
      .footer-app-btn i{font-size:1.8rem!important;color:#D4AF37!important;}
      .footer-app-btn-sm{font-size:.7rem!important;color:rgba(255,255,255,.6)!important;display:block!important;}
      .footer-app-btn-lg{font-size:.95rem!important;font-weight:700!important;color:#fff!important;display:block!important;}
      .footer-bottom{padding:2rem 0!important;text-align:center!important;}
      .footer-copyright{font-size:.88rem!important;color:rgba(255,255,255,.6)!important;margin:0!important;}
      @media(max-width:768px){.footer-grid{grid-template-columns:1fr!important;gap:2.5rem!important;}.footer-fbr-section{grid-template-columns:1fr!important;}}
      /* TEAM VERIFICATION */
      .tv-page{background:linear-gradient(160deg,#F9F6F2 0%,#F0E8DC 50%,#E8DDD0 100%)!important;min-height:100vh!important;}
      .tv-hero{position:relative!important;min-height:48vh!important;display:flex!important;align-items:center!important;background:linear-gradient(135deg,#390910 0%,#5c1018 40%,#772218 100%)!important;overflow:hidden!important;padding-top:135px!important;}
      .tv-hero-overlay{position:absolute!important;inset:0!important;background:rgba(30,5,10,0.5)!important;z-index:1!important;}
      .tv-hero-inner{max-width:1280px!important;margin:0 auto!important;padding:0 2rem!important;width:100%!important;position:relative!important;z-index:2!important;}
      .tv-hero-content{text-align:center!important;padding:3.5rem 0!important;position:relative!important;z-index:2!important;}
      .tv-hero-icon{width:90px!important;height:90px!important;border-radius:50%!important;background:rgba(212,175,55,0.12)!important;border:2px solid rgba(212,175,55,0.5)!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 1.5rem!important;font-size:2.8rem!important;color:#D4AF37!important;}
      .tv-hero-title{font-family:'Poppins',sans-serif!important;font-weight:900!important;font-size:clamp(2rem,5vw,3.5rem)!important;color:#fff!important;margin-bottom:1rem!important;text-shadow:0 4px 20px rgba(0,0,0,0.5)!important;}
      .tv-gradient-text{background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;background-clip:text!important;}
      .tv-hero-desc{font-size:1.1rem!important;color:rgba(255,255,255,0.8)!important;max-width:620px!important;margin:0 auto 1.5rem!important;line-height:1.7!important;}
      .tv-hero-badges{display:flex!important;gap:12px!important;justify-content:center!important;flex-wrap:wrap!important;}
      .tv-hero-badge{display:flex!important;align-items:center!important;gap:7px!important;background:rgba(255,255,255,0.12)!important;border:1px solid rgba(255,255,255,0.2)!important;border-radius:50px!important;padding:8px 18px!important;font-size:0.85rem!important;font-weight:600!important;color:#fff!important;}
      .tv-trust-banner{background:linear-gradient(135deg,#390910,#5c1018)!important;border-bottom:2px solid rgba(212,175,55,0.3)!important;}
      .tv-trust-inner{max-width:1100px!important;margin:0 auto!important;padding:1rem 2rem!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;}
      .tv-trust-item{display:flex!important;align-items:center!important;gap:8px!important;padding:0.6rem 1.5rem!important;font-size:0.88rem!important;font-weight:600!important;color:rgba(255,255,255,0.9)!important;}
      .tv-trust-icon{color:#D4AF37!important;}.tv-trust-warn{color:#ff8080!important;}
      .tv-trust-divider{width:1px!important;height:28px!important;background:rgba(212,175,55,0.25)!important;flex-shrink:0!important;}
      .tv-content{padding:5rem 0 7rem!important;position:relative!important;z-index:1!important;}
      .tv-content-inner{max-width:900px!important;margin:0 auto!important;padding:0 2rem!important;}
      .tv-alert-box{display:flex!important;align-items:flex-start!important;gap:14px!important;background:rgba(220,38,38,0.08)!important;border:1.5px solid rgba(220,38,38,0.3)!important;border-left:4px solid #dc2626!important;border-radius:16px!important;padding:1.4rem 1.6rem!important;margin-bottom:2rem!important;}
      .tv-alert-icon{font-size:1.4rem!important;color:#dc2626!important;flex-shrink:0!important;}
      .tv-alert-text{font-size:0.95rem!important;color:#7f1d1d!important;line-height:1.65!important;}
      .tv-alert-text strong{color:#dc2626!important;}
      .tv-search-card{background:rgba(255,255,255,0.85)!important;border:1px solid rgba(212,175,55,0.22)!important;border-radius:32px!important;padding:2.5rem!important;box-shadow:0 8px 32px rgba(0,0,0,0.10)!important;margin-bottom:2rem!important;}
      .tv-search-header{text-align:center!important;margin-bottom:1.5rem!important;padding-bottom:1.5rem!important;border-bottom:2px solid rgba(212,175,55,0.2)!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;}
      .tv-search-icon{font-size:1.6rem!important;color:#D4AF37!important;}
      .tv-search-title{font-family:'Poppins',sans-serif!important;font-size:1.6rem!important;font-weight:800!important;color:#390910!important;margin:0!important;}
      .tv-search-desc{font-size:0.95rem!important;color:#4a2a2e!important;line-height:1.65!important;margin-bottom:1.8rem!important;text-align:center!important;}
      .tv-phone-wrapper{position:relative!important;display:flex!important;align-items:center!important;margin-bottom:0.6rem!important;}
      .tv-phone-icon{position:absolute!important;left:1.2rem!important;font-size:1.1rem!important;color:#D4AF37!important;z-index:2!important;}
      .tv-phone-input{width:100%!important;font-size:1.05rem!important;color:#1a0a0c!important;background:rgba(255,255,255,0.8)!important;border:1.5px solid rgba(212,175,55,0.3)!important;border-radius:16px!important;padding:1rem 1.2rem 1rem 3.2rem!important;outline:none!important;box-sizing:border-box!important;}
      .tv-helper{display:block!important;font-size:0.85rem!important;color:#7a5a5e!important;margin-top:0.5rem!important;}
      .tv-btn-submit{width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;color:#390910!important;font-weight:700!important;font-size:1.05rem!important;padding:1.1rem 2rem!important;border:none!important;border-radius:9999px!important;cursor:pointer!important;}
      .tv-how-section{margin:2.5rem 0!important;}
      .tv-how-title{font-family:'Poppins',sans-serif!important;font-size:1.4rem!important;font-weight:800!important;color:#390910!important;text-align:center!important;margin-bottom:2rem!important;}
      .tv-how-steps{display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;gap:0.5rem!important;}
      .tv-how-step{flex:1!important;min-width:180px!important;text-align:center!important;padding:2rem 1.2rem 1.8rem!important;background:rgba(255,255,255,0.85)!important;border:1px solid rgba(212,175,55,0.18)!important;border-radius:20px!important;position:relative!important;box-shadow:0 4px 16px rgba(0,0,0,0.06)!important;}
      .tv-how-num{position:absolute!important;top:-14px!important;left:50%!important;transform:translateX(-50%)!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;color:#390910!important;font-size:0.78rem!important;font-weight:900!important;padding:4px 16px!important;border-radius:50px!important;white-space:nowrap!important;}
      .tv-how-icon{width:56px!important;height:56px!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;border-radius:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0.5rem auto 1rem!important;font-size:1.3rem!important;color:#390910!important;}
      .tv-how-step h4{font-family:'Poppins',sans-serif!important;font-size:1rem!important;font-weight:700!important;color:#390910!important;margin:0 0 0.5rem!important;}
      .tv-how-step p{font-size:0.88rem!important;color:#4a2a2e!important;line-height:1.6!important;margin:0!important;}
      .tv-how-arrow{font-size:2rem!important;color:rgba(212,175,55,0.6)!important;padding:0 0.2rem!important;flex-shrink:0!important;}
      .tv-info-card{background:rgba(212,175,55,0.08)!important;border:1px solid rgba(212,175,55,0.3)!important;border-radius:24px!important;padding:1.8rem 2rem!important;}
      .tv-info-title{display:flex!important;align-items:center!important;gap:8px!important;font-family:'Poppins',sans-serif!important;font-size:1.15rem!important;font-weight:700!important;color:#390910!important;margin-bottom:1rem!important;}
      .tv-info-list{list-style:none!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:0.7rem!important;}
      .tv-info-list li{font-size:0.92rem!important;color:#4a2a2e!important;line-height:1.6!important;padding-left:1.6rem!important;position:relative!important;}
      .tv-info-list li::before{content:'✓'!important;position:absolute!important;left:0!important;color:#D4AF37!important;font-weight:700!important;}
      /* REPORT FRAUD */
      .rf-page{background:linear-gradient(160deg,#F9F6F2 0%,#F0E8DC 50%,#E8DDD0 100%)!important;min-height:100vh!important;}
      .rf-hero{position:relative!important;min-height:44vh!important;display:flex!important;align-items:center!important;background:linear-gradient(135deg,#390910 0%,#5c1018 40%,#772218 100%)!important;overflow:hidden!important;padding-top:135px!important;}
      .rf-hero-overlay{position:absolute!important;inset:0!important;background:rgba(30,5,10,0.5)!important;z-index:1!important;}
      .rf-hero-content{position:relative!important;z-index:2!important;padding:3.5rem 1rem!important;text-align:center!important;}
      .rf-hero-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:88px!important;height:88px!important;border-radius:50%!important;background:rgba(220,53,69,0.15)!important;border:2px solid rgba(220,53,69,0.4)!important;color:#ff6b6b!important;font-size:2.5rem!important;margin:0 auto 1.5rem!important;}
      .rf-hero-title{font-family:'Poppins',sans-serif!important;font-weight:800!important;font-size:clamp(1.8rem,4vw,3rem)!important;color:#fff!important;margin-bottom:1rem!important;}
      .rf-gradient-text{background:linear-gradient(135deg,#ff6b6b,#ff4444)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;background-clip:text!important;}
      .rf-hero-desc{font-size:1.05rem!important;color:rgba(255,255,255,0.82)!important;max-width:520px!important;margin:0 auto 1.5rem!important;line-height:1.7!important;}
      .rf-hero-badges{display:flex!important;gap:12px!important;justify-content:center!important;flex-wrap:wrap!important;}
      .rf-hero-badge{display:flex!important;align-items:center!important;gap:7px!important;background:rgba(255,255,255,0.12)!important;border:1px solid rgba(255,255,255,0.2)!important;border-radius:50px!important;padding:8px 18px!important;font-size:0.85rem!important;font-weight:600!important;color:#fff!important;}
      .rf-trust-strip{background:linear-gradient(135deg,#390910,#5c1018)!important;border-bottom:2px solid rgba(212,175,55,0.3)!important;}
      .rf-trust-inner{max-width:1100px!important;margin:0 auto!important;padding:1rem 2rem!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;}
      .rf-trust-item{display:flex!important;align-items:center!important;gap:8px!important;padding:0.6rem 1.5rem!important;font-size:0.88rem!important;font-weight:600!important;color:rgba(255,255,255,0.9)!important;}
      .rf-trust-icon{color:#D4AF37!important;}
      .rf-trust-divider{width:1px!important;height:28px!important;background:rgba(212,175,55,0.25)!important;flex-shrink:0!important;}
      .rf-content{padding-top:3rem!important;padding-bottom:0!important;}
      .rf-full-section{max-width:1100px!important;margin:0 auto!important;padding:0 2rem 3rem!important;}
      .rf-full-section-last{padding-bottom:6rem!important;}
      .rf-form-card{background:rgba(255,255,255,0.92)!important;border-radius:28px!important;overflow:hidden!important;border:1px solid rgba(212,175,55,0.2)!important;box-shadow:0 8px 40px rgba(0,0,0,0.07)!important;margin-bottom:2rem!important;}
      .rf-form-header{display:flex!important;align-items:center!important;gap:1.2rem!important;padding:1.8rem 2rem!important;background:linear-gradient(135deg,rgba(57,9,16,0.06),rgba(119,34,24,0.04))!important;border-bottom:1px solid rgba(212,175,55,0.15)!important;}
      .rf-form-header-icon{font-size:1.8rem!important;color:#D4AF37!important;}
      .rf-form-header h2{font-family:'Poppins',sans-serif!important;font-size:1.3rem!important;font-weight:700!important;color:#390910!important;margin:0 0 2px!important;}
      .rf-form-header p{font-size:0.88rem!important;color:#4a2a2e!important;margin:0!important;}
      .rf-form{padding:1.5rem 2rem 2rem!important;}
      .rf-section-label{font-family:'Poppins',sans-serif!important;font-size:0.78rem!important;font-weight:700!important;color:#390910!important;text-transform:uppercase!important;letter-spacing:1px!important;margin-bottom:1rem!important;padding-bottom:0.5rem!important;border-bottom:1.5px solid rgba(212,175,55,0.2)!important;}
      .rf-section-danger{color:#c0392b!important;}
      .rf-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:1.2rem!important;margin-bottom:1.2rem!important;}
      .rf-field{margin-bottom:1.2rem!important;}
      .rf-field label{display:flex!important;align-items:center!important;gap:0.5rem!important;font-size:0.88rem!important;font-weight:600!important;color:#390910!important;margin-bottom:0.5rem!important;text-transform:uppercase!important;}
      .rf-field-icon{color:#D4AF37!important;font-size:0.9rem!important;}
      .rf-field input,.rf-field textarea{width:100%!important;padding:0.9rem 1.1rem!important;border:1.5px solid rgba(212,175,55,0.25)!important;border-radius:12px!important;font-size:0.97rem!important;color:#1a0a0c!important;background:rgba(255,255,255,0.9)!important;outline:none!important;box-sizing:border-box!important;}
      .rf-field-hint{font-size:0.82rem!important;color:#4a2a2e!important;margin-bottom:0.7rem!important;line-height:1.5!important;}
      .rf-upload-area{border:2px dashed rgba(212,175,55,0.4)!important;border-radius:14px!important;padding:2rem!important;text-align:center!important;cursor:pointer!important;background:rgba(212,175,55,0.04)!important;}
      .rf-upload-icon{font-size:2rem!important;color:#D4AF37!important;display:block!important;margin-bottom:0.8rem!important;}
      .rf-btn-submit{width:100%!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;border:none!important;color:#390910!important;font-weight:700!important;font-size:1.05rem!important;padding:1rem 2rem!important;border-radius:50px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:0.5rem!important;}
      .rf-why-section{background:rgba(255,255,255,0.85)!important;border:1px solid rgba(212,175,55,0.18)!important;border-radius:24px!important;padding:2.2rem!important;box-shadow:0 4px 20px rgba(0,0,0,0.06)!important;}
      .rf-why-title{font-family:'Poppins',sans-serif!important;font-size:1.2rem!important;font-weight:800!important;color:#390910!important;margin:0 0 0.8rem!important;display:flex!important;align-items:center!important;gap:8px!important;}
      .rf-why-desc{font-size:0.95rem!important;color:#4a2a2e!important;line-height:1.75!important;margin-bottom:1.5rem!important;}
      .rf-why-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:1rem!important;}
      .rf-why-card{background:rgba(212,175,55,0.06)!important;border:1px solid rgba(212,175,55,0.2)!important;border-radius:16px!important;padding:1.2rem!important;text-align:center!important;}
      .rf-why-icon{width:48px!important;height:48px!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;border-radius:14px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 0.8rem!important;font-size:1.1rem!important;color:#390910!important;}
      .rf-why-card h4{font-size:0.92rem!important;font-weight:700!important;color:#390910!important;margin:0 0 0.4rem!important;}
      .rf-why-card p{font-size:0.82rem!important;color:#4a2a2e!important;line-height:1.55!important;margin:0!important;}
      .rf-process-section{max-width:100%!important;margin:0!important;width:100%!important;}
      .rf-process-title{font-family:'Poppins',sans-serif!important;font-size:1.3rem!important;font-weight:800!important;color:#390910!important;text-align:center!important;margin-bottom:2rem!important;}
      .rf-process-steps{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:2rem!important;}
      .rf-process-step{background:rgba(255,255,255,0.92)!important;border:1px solid rgba(212,175,55,0.2)!important;border-radius:20px!important;padding:2rem 1.4rem 1.6rem!important;text-align:center!important;position:relative!important;box-shadow:0 4px 20px rgba(0,0,0,0.06)!important;}
      .rf-process-num{position:absolute!important;top:-14px!important;left:50%!important;transform:translateX(-50%)!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;color:#390910!important;font-size:0.78rem!important;font-weight:900!important;padding:4px 16px!important;border-radius:50px!important;white-space:nowrap!important;}
      .rf-process-icon{width:56px!important;height:56px!important;background:linear-gradient(135deg,#D4AF37,#F4D03F)!important;border-radius:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0.8rem auto 1rem!important;font-size:1.3rem!important;color:#390910!important;}
      .rf-process-step h4{font-family:'Poppins',sans-serif!important;font-size:1rem!important;font-weight:700!important;color:#390910!important;margin:0 0 0.6rem!important;}
      .rf-process-step p{font-size:0.88rem!important;color:#4a2a2e!important;line-height:1.65!important;margin:0!important;}
      .rf-info-box{background:rgba(255,255,255,0.85)!important;border-radius:20px!important;padding:1.8rem 2rem!important;border:1px solid rgba(212,175,55,0.2)!important;width:100%!important;}
      .rf-info-title{font-family:'Poppins',sans-serif!important;font-size:1rem!important;font-weight:700!important;color:#390910!important;margin-bottom:1rem!important;display:flex!important;align-items:center!important;gap:0.5rem!important;}
      .rf-info-list{margin:0!important;padding:0!important;list-style:none!important;}
      .rf-info-list li{font-size:0.95rem!important;color:#4a2a2e!important;line-height:1.6!important;margin-bottom:0.5rem!important;padding-left:1.2rem!important;position:relative!important;}
      .rf-info-list li::before{content:'›'!important;position:absolute!important;left:0!important;color:#D4AF37!important;font-weight:700!important;}
      @media(max-width:900px){.rf-process-steps{grid-template-columns:repeat(2,1fr)!important;}.rf-why-grid{grid-template-columns:1fr!important;}}
      @media(max-width:768px){.rf-row{grid-template-columns:1fr!important;}.rf-trust-divider,.tv-trust-divider{display:none!important;}.rf-full-section{padding:0 1rem 2rem!important;}.tv-content-inner{padding:0 1rem!important;}}
      @media(max-width:480px){.rf-process-steps{grid-template-columns:1fr!important;}.tv-how-steps{flex-direction:column!important;}.tv-how-step{min-width:100%!important;}}
`;

// Replace existing style block content
html = html.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + inlineStyles + '\n    </style>');

writeFileSync(resolve(distDir, 'index.html'), html, 'utf8');
console.log('✅ index.html styles injected successfully');