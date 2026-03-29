<?php
get_header();
$phone = yabs_get('phone', '+971 56 520 4844');
$wa = preg_replace('/[^0-9]/', '', yabs_get('whatsapp', '+971 56 520 4844'));
?>
<style>
.ah{background:linear-gradient(135deg,#0F2B46,#061526);padding:100px 0 80px;color:#fff;overflow:hidden}
.ah .c{max-width:1200px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center}
.ah h1{font-size:44px;font-weight:800;line-height:1.15;margin-bottom:20px}.ah h1 span{display:block;color:#C8973E}
.ah .d{font-size:17px;line-height:1.7;color:rgba(255,255,255,.75);margin-bottom:32px}
.ah .btns{display:flex;gap:14px;flex-wrap:wrap}
.ah .bg{padding:14px 30px;background:linear-gradient(135deg,#C8973E,#E8C068);color:#fff;border-radius:8px;font-weight:700;text-decoration:none;box-shadow:0 4px 20px rgba(200,151,62,.3)}
.ah .bw{padding:14px 30px;border:2px solid rgba(255,255,255,.3);color:#fff;border-radius:8px;font-weight:600;text-decoration:none}
.hc{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px}
.hc h3{color:#C8973E;font-size:18px;margin-bottom:20px;font-weight:700}
.hc .r{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.hc .r:last-child{border-bottom:none}
.hc .n{font-size:28px;font-weight:800;min-width:80px}.hc .n span{color:#C8973E}
.hc .t{font-size:14px;color:rgba(255,255,255,.6)}
.at{background:#fff;padding:25px 0;border-bottom:1px solid #f0f0f0}
.at .c{max-width:1200px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:center;gap:30px;flex-wrap:wrap}
.at .l{font-size:13px;color:#64708D;text-transform:uppercase;letter-spacing:1px;font-weight:600}
.at .b{background:#f7f8fc;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;color:#0F2B46}
.as{max-width:1200px;margin:0 auto;padding:80px 20px}
.as .g{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.as .tg{display:inline-block;background:rgba(200,151,62,.1);color:#C8973E;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:16px;text-transform:uppercase}
.as h2{font-size:34px;font-weight:800;color:#0F2B46;margin-bottom:20px}
.as p{font-size:16px;color:#4A5568;line-height:1.8;margin-bottom:16px}
.as .fl{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}
.as .fi{display:flex;gap:10px;align-items:center;font-size:14px;color:#3D4A63;font-weight:500}
.as .fi::before{content:'\2713';color:#C8973E;font-weight:700}
.sv{background:#0F2B46;border-radius:20px;padding:36px;color:#fff}
.sv h3{color:#C8973E;font-size:20px;font-weight:700;margin-bottom:20px}
.sv .i{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08);align-items:center}
.sv .i:last-child{border-bottom:none}
.sv .i h4{font-size:15px;font-weight:600;margin:0 0 2px}.sv .i span{font-size:12px;color:rgba(255,255,255,.5)}
.sv .ic{width:38px;height:38px;border-radius:10px;background:rgba(200,151,62,.15);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.vm{background:#f7f8fc;padding:70px 0}
.vm .c{max-width:1200px;margin:0 auto;padding:0 20px}
.vm h2{text-align:center;font-size:32px;font-weight:800;color:#0F2B46;margin-bottom:40px}
.vm .vg{display:grid;grid-template-columns:1fr 1fr;gap:30px}
.vm .vc{background:#fff;border-radius:16px;padding:36px;box-shadow:0 2px 12px rgba(15,43,70,.06);border-top:4px solid #C8973E}
.vm .vc h3{font-size:22px;font-weight:700;color:#0F2B46;margin-bottom:14px}
.vm .vc p{font-size:15px;color:#4A5568;line-height:1.8}
.tm{max-width:1200px;margin:0 auto;padding:70px 20px}
.tm>h2{text-align:center;font-size:32px;font-weight:800;color:#0F2B46;margin-bottom:10px}
.tm>p{text-align:center;color:#64708D;margin-bottom:40px}
.tm .tg{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.tm .tc{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(15,43,70,.06);transition:all .3s}
.tm .tc:hover{box-shadow:0 12px 40px rgba(15,43,70,.12);transform:translateY(-5px)}
.tm .tt{padding:28px;text-align:center}
.tm .av{width:76px;height:76px;border-radius:50%;background:rgba(255,255,255,.15);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;border:3px solid rgba(255,255,255,.2)}
.tm .tt h3{color:#fff;font-size:17px;margin-bottom:3px}
.tm .tt .rl{color:#C8973E;font-size:12px;font-weight:600;text-transform:uppercase}
.tm .tb{padding:22px;text-align:center}
.tm .tb p{font-size:14px;color:#4A5568;line-height:1.7}
.cr{background:#0F2B46;padding:60px 0;color:#fff}
.cr h2{text-align:center;font-size:28px;font-weight:800;margin-bottom:36px}
.cr .cg{max-width:1200px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.cr .cc{background:rgba(255,255,255,.06);border-radius:12px;padding:26px 18px;text-align:center;border:1px solid rgba(255,255,255,.08);transition:all .3s}
.cr .cc:hover{border-color:#C8973E;background:rgba(255,255,255,.1)}
.cr .cc h4{font-size:14px;font-weight:700;margin:10px 0 5px}
.cr .cc p{font-size:12px;color:rgba(255,255,255,.5)}
.ct{padding:70px 20px;text-align:center}
.ct h2{font-size:34px;font-weight:800;color:#0F2B46;margin-bottom:14px}
.ct p{font-size:16px;color:#4A5568;max-width:600px;margin:0 auto 28px}
.ct .btns{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.ct .bg{padding:15px 34px;background:linear-gradient(135deg,#C8973E,#E8C068);color:#fff;border-radius:8px;font-weight:700;text-decoration:none;box-shadow:0 4px 20px rgba(200,151,62,.3)}
.ct .bo{padding:15px 34px;border:2px solid #0F2B46;color:#0F2B46;border-radius:8px;font-weight:700;text-decoration:none}
.ct .bo:hover{background:#0F2B46;color:#fff}
@media(max-width:768px){.ah .c,.as .g{grid-template-columns:1fr}.ah h1{font-size:30px}.as .fl,.vm .vg,.tm .tg,.cr .cg{grid-template-columns:1fr}}
</style>
<section class="ah"><div class="c"><div>
<div style="font-size:14px;opacity:.6;margin-bottom:20px"><a href="<?php echo home_url(); ?>" style="color:#C8973E;text-decoration:none">Home</a> / About Us</div>
<h1>Your Trusted Partner<span>for Business in UAE</span></h1>
<p class="d">YABS has been simplifying business setup, visa processing, and corporate compliance in Dubai for over a decade. We handle the complexity so you can focus on growth.</p>
<div class="btns"><a href="https://wa.me/<?php echo $wa; ?>" class="bg" target="_blank">Get Free Consultation</a><a href="<?php echo home_url('/our-services'); ?>" class="bw">Our Services</a></div>
</div><div class="hc"><h3>YABS at a Glance</h3>
<div class="r"><div class="n">10<span>+</span></div><div class="t">Years of PRO Services Experience</div></div>
<div class="r"><div class="n">500<span>+</span></div><div class="t">Companies Successfully Formed</div></div>
<div class="r"><div class="n">2,000<span>+</span></div><div class="t">Visas Processed Across Emirates</div></div>
<div class="r"><div class="n">4.9<span>/5</span></div><div class="t">Google Rating from 150+ Reviews</div></div>
</div></div></section>
<section class="at"><div class="c"><span class="l">Authorized By</span><span class="b">DED</span><span class="b">DMCC</span><span class="b">JAFZA</span><span class="b">RAK FTZ</span><span class="b">DAFZA</span><span class="b">Ajman FZ</span></div></section>
<section class="as"><div class="g"><div><span class="tg">Our Story</span><h2>Simplifying Business Setup Since 2015</h2>
<p>Founded by Balmiki Kumar, YABS was built on a simple belief: starting a business in Dubai should not be complicated. We have grown from a small PRO office to a full-service consultancy serving clients from 40+ countries.</p>
<div class="fl"><span class="fi">Direct Government Liaisons</span><span class="fi">Transparent Pricing</span><span class="fi">Multilingual Support</span><span class="fi">Dedicated Account Manager</span><span class="fi">Online Client Portal</span><span class="fi">Post-Setup Compliance</span></div>
</div><div class="sv"><h3>Core Services</h3>
<div class="i"><div class="ic">&#127970;</div><div><h4>Company Formation</h4><span>Mainland, Free Zone, Offshore</span></div></div>
<div class="i"><div class="ic">&#128196;</div><div><h4>Trade License</h4><span>New, Renewal, Amendment</span></div></div>
<div class="i"><div class="ic">&#9992;&#65039;</div><div><h4>Visa Processing</h4><span>Employment, Family, Golden</span></div></div>
<div class="i"><div class="ic">&#128101;</div><div><h4>PRO Services</h4><span>MOHRE, GDRFA, DED</span></div></div>
<div class="i"><div class="ic">&#128209;</div><div><h4>Documents</h4><span>Attestation, Translation</span></div></div>
<div class="i"><div class="ic">&#128178;</div><div><h4>Accounting</h4><span>VAT, Corporate Tax</span></div></div>
</div></div></section>
<section class="vm"><div class="c"><h2>Vision &amp; Mission</h2><div class="vg">
<div class="vc"><h3>Our Vision</h3><p>To be the most trusted PRO services partner in the UAE, recognized for excellence and client satisfaction. We envision business setup in Dubai as simple, transparent, and accessible worldwide.</p></div>
<div class="vc"><h3>Our Mission</h3><p>To simplify every aspect of business setup and compliance in Dubai. We provide comprehensive and transparent services that empower entrepreneurs. We are your dedicated partner in success.</p></div>
</div></div></section>
<section class="tm"><h2>Meet Our Team</h2><p>Experienced professionals dedicated to your success</p><div class="tg">
<div class="tc"><div class="tt" style="background:linear-gradient(135deg,#0F2B46,#2a5a8f)"><div class="av">BK</div><h3>Balmiki Kumar</h3><span class="rl">CEO &amp; Founder</span></div><div class="tb"><p>Over a decade of UAE business setup experience. Founded YABS to simplify company formation for entrepreneurs worldwide.</p></div></div>
<div class="tc"><div class="tt" style="background:linear-gradient(135deg,#0F2B46,#C8973E)"><div class="av">PR</div><h3>PRO Team</h3><span class="rl">Government Liaison</span></div><div class="tb"><p>Direct relationships with DED, AMER, GDRFA, MOHRE and all government departments for fast processing.</p></div></div>
<div class="tc"><div class="tt" style="background:linear-gradient(135deg,#2a5a8f,#0F2B46)"><div class="av">CS</div><h3>Client Success</h3><span class="rl">Account Managers</span></div><div class="tb"><p>Dedicated managers guide you from consultation to post-setup compliance support.</p></div></div>
</div></section>
<section class="cr"><h2>Credentials</h2><div class="cg">
<div class="cc"><div style="font-size:32px;color:#C8973E">&#127942;</div><h4>DED Licensed</h4><p>Dubai Economic Department</p></div>
<div class="cc"><div style="font-size:32px;color:#C8973E">&#11088;</div><h4>4.9/5 Google</h4><p>150+ verified reviews</p></div>
<div class="cc"><div style="font-size:32px;color:#C8973E">&#128276;</div><h4>Authorized Agent</h4><p>DMCC, JAFZA, RAK, DAFZA</p></div>
<div class="cc"><div style="font-size:32px;color:#C8973E">&#128203;</div><h4>VAT Registered</h4><p>TRN: 100534915200003</p></div>
</div></section>
<section class="ct"><h2>Ready to Start Your Business?</h2><p>Get a free consultation from our expert team today.</p><div class="btns">
<a href="https://wa.me/<?php echo $wa; ?>" class="bg" target="_blank">WhatsApp Us</a>
<a href="tel:<?php echo esc_attr(str_replace(' ','',$phone)); ?>" class="bo">Call <?php echo esc_html($phone); ?></a>
</div></section>
<?php get_footer(); ?>
