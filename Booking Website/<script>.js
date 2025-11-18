<script>
  // Simple state + pricing
  const state = {
    service:"", date:"", time:"", qty:1, tier:"std", name:"", email:"",
  };
  const basePrice = { concert: 35, ballet: 25, tour: 18 };
  const tierAdd = { std: 0, prem: 15, vip: 40 };

  const el = id => document.getElementById(id);
  const chips = document.querySelectorAll('.chip');
  function setStep(n){
    // toggle forms
    for(let i=0;i<4;i++){
      const f = el('step-'+i);
      if(!f) continue;
      f.hidden = i!==n;
      chips[i].classList.toggle('active', i===n);
    }
  }

  // Inputs
  const service = el('service');
  const date = el('date');
  const time = el('time');
  const qty = el('qty');
  const tier = el('tier');

  function money(n){return `$${n.toFixed(2)}`}
  function compute(){
    const base = basePrice[state.service] || 0;
    const add = tierAdd[state.tier] || 0;
    const total = (base + add) * Number(state.qty || 1);
    el('live-total').textContent = money(total);
    return total;
  }
  function syncSummary(){
    el('s-service').textContent = service.options[service.selectedIndex]?.text || '—';
    el('s-date').textContent = state.date || '—';
    el('s-time').textContent = state.time || '—';
    el('s-qty').textContent = state.qty;
    el('s-tier').textContent = tier.options[tier.selectedIndex]?.text || 'Standard';
  }
  function update(){
    state.service = service.value; state.date = date.value; state.time = time.value; state.qty = qty.value; state.tier = tier.value;
    compute(); syncSummary();
  }
  [service,date,time,qty,tier].forEach(c=>c.addEventListener('change', update));
  update();

  
  el('to-1').addEventListener('click', ()=>{
    let ok=true;
    if(!service.value){ ok=false; el('service-msg').classList.add('show'); } else { el('service-msg').classList.remove('show'); }
    if(!date.value){ ok=false; el('date-msg').classList.add('show'); } else { el('date-msg').classList.remove('show'); }
    if(!time.value){ ok=false; el('time-msg').classList.add('show'); } else { el('time-msg').classList.remove('show'); }
    if(ok) setStep(1);
  });
  el('back-0').addEventListener('click', ()=> setStep(0));

  el('to-2').addEventListener('click', ()=>{
    const name = el('name'); const email = el('email');
    let ok = true;
    if(!name.value){ ok=false; el('name-msg').classList.add('show'); } else { el('name-msg').classList.remove('show'); }
    if(!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) { ok=false; el('email-msg').classList.add('show'); } else { el('email-msg').classList.remove('show'); }
    if(ok){ state.name = name.value; state.email = email.value; setStep(2); }
  });
  el('back-1').addEventListener('click', ()=> setStep(1));

  el('to-3').addEventListener('click', ()=>{
    const card = el('card');
    if(card.value.replace(/\s/g,'').length < 12){ el('card-msg').classList.add('show'); return; }
    el('card-msg').classList.remove('show');
    // fill review
    el('r-service').textContent = service.options[service.selectedIndex]?.text;
    el('r-date').textContent = date.value; el('r-time').textContent = time.value;
    el('r-qty').textContent = qty.value; el('r-tier').textContent = tier.options[tier.selectedIndex]?.text;
    el('r-total').textContent = el('live-total').textContent;
    setStep(3);
  });
  el('back-2').addEventListener('click', ()=> setStep(2));

  el('confirm').addEventListener('click', ()=>{
    alert('✅ Booking confirmed (prototype). Thanks!');
  });
</script>