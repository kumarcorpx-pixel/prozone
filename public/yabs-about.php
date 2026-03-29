<?php
get_header();
$phone = yabs_get('phone', '+971 56 520 4844');
$wa = preg_replace('/[^0-9]/', '', yabs_get('whatsapp', '+971 56 520 4844'));
?>
<style>
*{box-sizing:border-box}
.ab-hero{background:#0F2B46;padding:80px 0 60px;color:#fff}
.ab-hero .wrap{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;gap:50px;align-items:center;flex-wrap:wrap}
.ab-hero .left{flex:1.2;min-width:300px}
.ab-hero .right{flex:1;min-width:280px}
.ab-hero .bc{font-size:14px;color:#C8973E;margin-bottom:20px}
.ab-hero .bc a{color:#C8973E;text-decoration:none}
.ab-hero h1{font-family:'Montserrat',sans-serif;font-size:40px;font-weight:800;line-height:1.2;margin:0 0 18px;color:#fff}
.ab-hero h1 span{color:#C8973E}
.ab-hero .desc{font-size:18px;line-height:1.7;color:#B0C4DE;margin-bottom:28px}
.ab-hero .btns{display:flex;gap:12px;flex-wrap:wrap}
.ab-hero .btn1{display:inline-block;padding:15px 32px;background:#C8973E;color:#fff;border-radius:8px;font-weight:700;font-size:16px;text-decoration:none}
.ab-hero .btn2{display:inline-block;padding:15px 32px;border:2px solid #fff;color:#fff;border-radius:8px;font-weight:600;font-size:16px;text-decoration:none}
.ab-card{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:32px}
.ab-card h3{color:#C8973E;font-family:'Montserrat',sans-serif;font-size:20px;font-weight:700;margin:0 0 20px}
.ab-card .row{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.1)}
.ab-card .row:last-child{border-bottom:none}
.ab-card .num{font-family:'Montserrat',sans-serif;font-size:30px;font-weight:800;color:#fff;min-width:80px}
.ab-card .num span{color:#C8973E}
.ab-card .txt{font-size:15px;color:#B0C4DE}

.ab-auth{background:#fff;padding:24px 0;border-bottom:1px solid #e8e8e8}
.ab-auth .wrap{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap}
.ab-auth .label{font-size:13px;color:#666;text-transform:uppercase;letter-spacing:1px;font-weight:700}
.ab-auth .badge{background:#f0f2f8;padding:8px 18px;border-radius:6px;font-size:14px;font-weight:700;color:#0F2B46}

.ab-story{max-width:1100px;margin:0 auto;padding:70px 24px}
.ab-story .grid{display:flex;gap:50px;align-items:flex-start;flex-wrap:wrap}
.ab-story .col{flex:1;min-width:280px}
.ab-story .tag{display:inline-block;background:#FFF5E0;color:#B07D2E;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px;text-transform:uppercase}
.ab-story h2{font-family:'Montserrat',sans-serif;font-size:32px;font-weight:800;color:#0F2B46;margin:0 0 18px;line-height:1.25}
.ab-story p{font-size:17px;color:#333;line-height:1.8;margin:0 0 16px}
.ab-story .checks{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.ab-story .chk{font-size:15px;color:#222;font-weight:500;padding-left:28px;position:relative}
.ab-story .chk::before{content:'\2713';position:absolute;left:0;color:#C8973E;font-weight:800;font-size:16px}
.ab-svc{background:#0F2B46;border-radius:16px;padding:32px;color:#fff}
.ab-svc h3{color:#C8973E;font-family:'Montserrat',sans-serif;font-size:20px;font-weight:700;margin:0 0 20px}
.ab-svc .item{display:flex;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.1);align-items:center}
.ab-svc .item:last-child{border-bottom:none}
.ab-svc .ico{width:40px;height:40px;border-radius:10px;background:rgba(200,151,62,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.ab-svc .item h4{font-size:16px;font-weight:600;margin:0 0 2px;color:#fff}
.ab-svc .item span{font-size:13px;color:#8EACC4}

.ab-vm{background:#f5f7fb;padding:70px 0}
.ab-vm .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
.ab-vm h2{font-family:'Montserrat',sans-serif;text-align:center;font-size:30px;font-weight:800;color:#0F2B46;margin:0 0 36px}
.ab-vm .grid{display:flex;gap:24px;flex-wrap:wrap}
.ab-vm .card{flex:1;min-width:280px;background:#fff;border-radius:14px;padding:36px;border-top:4px solid #C8973E;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.ab-vm .card h3{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:700;color:#0F2B46;margin:0 0 14px}
.ab-vm .card p{font-size:16px;color:#444;line-height:1.8}

.ab-team{max-width:1100px;margin:0 auto;padding:70px 24px}
.ab-team>h2{font-family:'Montserrat',sans-serif;text-align:center;font-size:30px;font-weight:800;color:#0F2B46;margin:0 0 8px}
.ab-team>p{text-align:center;color:#666;font-size:16px;margin:0 0 36px}
.ab-team .grid{display:flex;gap:24px;flex-wrap:wrap}
.ab-team .tc{flex:1;min-width:260px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);transition:transform 0.3s}
.ab-team .tc:hover{transform:translateY(-6px);box-shadow:0 10px 30px rgba(0,0,0,0.1)}
.ab-team .top{padding:28px;text-align:center;color:#fff}
.ab-team .av{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;border:3px solid rgba(255,255,255,0.3)}
.ab-team .top h3{font-size:18px;font-weight:700;margin:0 0 4px;color:#fff}
.ab-team .top .role{color:#C8973E;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.ab-team .bot{padding:24px;text-align:center}
.ab-team .bot p{font-size:15px;color:#444;line-height:1.7}

.ab-cred{background:#0F2B46;padding:60px 0;color:#fff}
.ab-cred h2{font-family:'Montserrat',sans-serif;text-align:center;font-size:28px;font-weight:800;margin:0 0 36px;color:#fff}
.ab-cred .grid{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;gap:18px;flex-wrap:wrap;justify-content:center}
.ab-cred .cc{flex:1;min-width:220px;max-width:260px;background:rgba(255,255,255,0.07);border-radius:12px;padding:28px 20px;text-align:center;border:1px solid rgba(255,255,255,0.1);transition:border-color 0.3s}
.ab-cred .cc:hover{border-color:#C8973E}
.ab-cred .cc .emoji{font-size:36px;margin-bottom:10px}
.ab-cred .cc h4{font-size:16px;font-weight:700;margin:0 0 6px;color:#fff}
.ab-cred .cc p{font-size:13px;color:#8EACC4}

.ab-cta{padding:70px 24px;text-align:center;background:#fff}
.ab-cta h2{font-family:'Montserrat',sans-serif;font-size:34px;font-weight:800;color:#0F2B46;margin:0 0 14px}
.ab-cta p{font-size:18px;color:#555;max-width:600px;margin:0 auto 30px}
.ab-cta .btns{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.ab-cta .btn1{display:inline-block;padding:16px 36px;background:#C8973E;color:#fff;border-radius:8px;font-weight:700;font-size:17px;text-decoration:none;box-shadow:0 4px 20px rgba(200,151,62,0.3)}
.ab-cta .btn2{display:inline-block;padding:16px 36px;border:2px solid #0F2B46;color:#0F2B46;border-radius:8px;font-weight:700;font-size:17px;text-decoration:none}
.ab-cta .btn2:hover{background:#0F2B46;color:#fff}

@media(max-width:768px){
.ab-hero .wrap,.ab-story .grid,.ab-vm .grid,.ab-team .grid{flex-direction:column}
.ab-hero h1{font-size:30px}
.ab-story .checks{grid-template-columns:1fr}
.ab-cred .grid{flex-direction:column;align-items:center}
}
</style>

<!-- HERO -->
<section class="ab-hero">
<div class="wrap">
<div class="left">
<div class="bc"><a href="<?php echo home_url(); ?>">Home</a> / About Us</div>
<h1>Your Trusted Partner <span>for Business in UAE</span></h1>
<p class="desc">YABS Public Relations Management LLC has been simplifying business setup, visa processing, and corporate compliance in Dubai for over a decade.</p>
<div class="btns">
<a href="https://wa.me/<?php echo $wa; ?>" class="btn1" target="_blank">Get Free Consultation</a>
<a href="<?php echo home_url('/our-services'); ?>" class="btn2">Our Services</a>
</div>
</div>
<div class="right">
<div class="ab-card">
<h3>YABS at a Glance</h3>
<div class="row"><div class="num">10<span>+</span></div><div class="txt">Years of PRO Services Experience</div></div>
<div class="row"><div class="num">500<span>+</span></div><div class="txt">Companies Successfully Formed</div></div>
<div class="row"><div class="num">2,000<span>+</span></div><div class="txt">Visas Processed Across Emirates</div></div>
<div class="row"><div class="num">4.9<span>/5</span></div><div class="txt">Google Rating from 150+ Reviews</div></div>
</div>
</div>
</div>
</section>

<!-- AUTHORIZED BY -->
<section class="ab-auth">
<div class="wrap">
<span class="label">Authorized By</span>
<span class="badge">DED</span><span class="badge">DMCC</span><span class="badge">JAFZA</span><span class="badge">RAK FTZ</span><span class="badge">DAFZA</span><span class="badge">Ajman FZ</span>
</div>
</section>

<!-- OUR STORY -->
<section class="ab-story">
<div class="grid">
<div class="col">
<span class="tag">Our Story</span>
<h2>Simplifying Business Setup Since 2015</h2>
<p>Founded by Balmiki Kumar, YABS was built on a simple belief: starting a business in Dubai should not be complicated. We have grown from a small PRO office to a full-service consultancy serving clients from 40+ countries.</p>
<p>Our team of government liaison experts, corporate advisors, and account managers deliver fast, transparent, and reliable service every day.</p>
<div class="checks">
<div class="chk">Direct Government Liaisons</div>
<div class="chk">Transparent Pricing</div>
<div class="chk">Multilingual Support</div>
<div class="chk">Dedicated Account Manager</div>
<div class="chk">Online Client Portal</div>
<div class="chk">Post-Setup Compliance</div>
</div>
</div>
<div class="col">
<div class="ab-svc">
<h3>Core Services</h3>
<div class="item"><div class="ico">&#127970;</div><div><h4>Company Formation</h4><span>Mainland, Free Zone, Offshore</span></div></div>
<div class="item"><div class="ico">&#128196;</div><div><h4>Trade License</h4><span>New, Renewal, Amendment</span></div></div>
<div class="item"><div class="ico">&#9992;&#65039;</div><div><h4>Visa Processing</h4><span>Employment, Family, Golden</span></div></div>
<div class="item"><div class="ico">&#128101;</div><div><h4>PRO Services</h4><span>MOHRE, GDRFA, DED</span></div></div>
<div class="item"><div class="ico">&#128209;</div><div><h4>Documents</h4><span>Attestation, Translation</span></div></div>
<div class="item"><div class="ico">&#128178;</div><div><h4>Accounting</h4><span>VAT, Corporate Tax</span></div></div>
</div>
</div>
</div>
</section>

<!-- VISION & MISSION -->
<section class="ab-vm">
<div class="wrap">
<h2>Vision &amp; Mission</h2>
<div class="grid">
<div class="card"><h3>Our Vision</h3><p>To be the most trusted PRO services partner in the UAE, recognized for excellence and client satisfaction. We envision business setup in Dubai as simple, transparent, and accessible to entrepreneurs worldwide.</p></div>
<div class="card"><h3>Our Mission</h3><p>To simplify every aspect of business setup and compliance in Dubai. We provide comprehensive and transparent services that empower entrepreneurs to achieve their goals. We are your dedicated partner in success.</p></div>
</div>
</div>
</section>

<!-- TEAM -->
<section class="ab-team">
<h2>Meet Our Team</h2>
<p>Experienced professionals dedicated to your success</p>
<div class="grid">
<div class="tc"><div class="top" style="background:linear-gradient(135deg,#0F2B46,#2a5a8f)"><div class="av">BK</div><h3>Balmiki Kumar</h3><span class="role">CEO &amp; Founder</span></div><div class="bot"><p>Over a decade of UAE business setup experience. Founded YABS to simplify company formation for entrepreneurs worldwide.</p></div></div>
<div class="tc"><div class="top" style="background:linear-gradient(135deg,#0F2B46,#C8973E)"><div class="av">PR</div><h3>PRO Team</h3><span class="role">Government Liaison</span></div><div class="bot"><p>Direct relationships with DED, AMER, GDRFA, MOHRE and all government departments for fast processing.</p></div></div>
<div class="tc"><div class="top" style="background:linear-gradient(135deg,#2a5a8f,#0F2B46)"><div class="av">CS</div><h3>Client Success</h3><span class="role">Account Managers</span></div><div class="bot"><p>Dedicated managers guide you from consultation to post-setup compliance support via our client portal.</p></div></div>
</div>
</section>

<!-- CREDENTIALS -->
<section class="ab-cred">
<h2>Credentials &amp; Accreditations</h2>
<div class="grid">
<div class="cc"><div class="emoji">&#127942;</div><h4>DED Licensed</h4><p>Dubai Economic Department</p></div>
<div class="cc"><div class="emoji">&#11088;</div><h4>4.9/5 Google</h4><p>150+ verified reviews</p></div>
<div class="cc"><div class="emoji">&#128276;</div><h4>Authorized Agent</h4><p>DMCC, JAFZA, RAK, DAFZA</p></div>
<div class="cc"><div class="emoji">&#128203;</div><h4>VAT Registered</h4><p>TRN: 100534915200003</p></div>
</div>
</section>

<!-- CTA -->
<section class="ab-cta">
<h2>Ready to Start Your Business?</h2>
<p>Get a free consultation from our expert team. We will guide you through every step.</p>
<div class="btns">
<a href="https://wa.me/<?php echo $wa; ?>" class="btn1" target="_blank">WhatsApp Us Now</a>
<a href="tel:<?php echo esc_attr(str_replace(' ','',$phone)); ?>" class="btn2">Call <?php echo esc_html($phone); ?></a>
</div>
</section>

<?php get_footer(); ?>
