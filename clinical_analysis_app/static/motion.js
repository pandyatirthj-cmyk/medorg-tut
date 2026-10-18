(() => {
  const families = ['rise','drop','left','right','zoom','shrink','spin','flip','swing','blur','diagonal','pop'];
  const presets = families.flatMap(f => Array.from({length:10}, (_,i) => `${f}-${String(i+1).padStart(2,'0')}`));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('mo-motion-paused') === 'true'; } catch {}
  const tools = document.createElement('div'); tools.className = 'mo-tools';
  tools.innerHTML = '<button type="button">Effects gallery</button><button type="button" aria-pressed="false">Pause motion</button>';
  document.body.append(tools);
  const pauseButton = tools.lastElementChild;
  function update() {
    document.documentElement.classList.toggle('mo-motion-paused', paused || reduced.matches);
    pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    pauseButton.setAttribute('aria-pressed', String(paused));
    window.dispatchEvent(new CustomEvent('mo-motion-change', {detail:{paused:paused || reduced.matches}}));
  }
  pauseButton.onclick = () => {paused = !paused; try {localStorage.setItem('mo-motion-paused',String(paused));} catch {} update();};
  reduced.addEventListener('change',update); update();
  const targets = document.querySelectorAll('.feature-card,.step,.stat-card,.chart-card,.auth-form,.auth-intro h2,.intro-features li,.section-heading,.hero-content,.dashboard-card,.cta,main header');
  const observer = new IntersectionObserver(entries => entries.forEach(({isIntersecting,target}) => {
    if (!isIntersecting) return;
    target.classList.add(`mo-animate-${target.dataset.motion}`); observer.unobserve(target);
    target.addEventListener('animationend', () => target.classList.remove(`mo-animate-${target.dataset.motion}`), {once:true});
  }), {threshold:.08});
  targets.forEach((el,i) => {el.dataset.motion = presets[(i*11)%120];el.style.setProperty('--motion-delay',`${i%4*65}ms`);observer.observe(el);});
  document.querySelectorAll('.feature-card,.step,.stat-card,.chart-card,.btn,.btn-primary-custom,.nav-link,.form-field,.auth-form,.feature-icon,.step-number,.badge,.site-logo').forEach((el,i) => el.classList.add(`mo-transition-${presets[(i*7)%120]}`));
  // Each preset can be inspected on demand; nothing is hidden before JS starts.
  const dialog = document.createElement('dialog'); dialog.className = 'mo-gallery';
  dialog.setAttribute('aria-labelledby','mo-gallery-title');
  dialog.innerHTML = '<header><h2 id="mo-gallery-title">Motion library</h2><button type="button" aria-label="Close effects gallery">Close</button></header><p>120 entrance animations · 120 hover and focus transitions. Choose a family, then select a tile to replay its entrance. Hover or focus to preview its transition.</p><label>Effect family <select></select></label><div class="mo-gallery-grid"></div>';
  document.body.append(dialog);
  const select = dialog.querySelector('select');
  families.forEach(f => {const option=document.createElement('option');option.value=f;option.textContent=f[0].toUpperCase()+f.slice(1);select.append(option);});
  function render() {
    const grid = dialog.querySelector('.mo-gallery-grid');grid.replaceChildren();
    presets.filter(p => p.startsWith(select.value+'-')).forEach(name => {
      const tile=document.createElement('button');tile.type='button';tile.className=`mo-preview mo-transition-${name}`;
      tile.innerHTML=`<span aria-hidden="true">✧</span><small>${name}</small>`;
      tile.onclick=()=> {tile.classList.remove(`mo-animate-${name}`);void tile.offsetWidth;tile.classList.add(`mo-animate-${name}`);};
      tile.addEventListener('animationend',()=>tile.classList.remove(`mo-animate-${name}`));grid.append(tile);
    });
  }
  select.onchange=render;render();
  tools.firstElementChild.onclick=()=>dialog.showModal();dialog.querySelector('header button').onclick=()=>dialog.close();
  document.querySelectorAll('button.btn,a.btn,.auth-submit').forEach(button => button.addEventListener('click',event => {
    if(paused || reduced.matches) return;
    const box=button.getBoundingClientRect();const dot=document.createElement('span');dot.className='mo-ripple';
    button.style.position='relative';button.style.overflow='hidden';
    Object.assign(dot.style,{width:'20px',height:'20px',left:`${event.clientX ? event.clientX-box.left-10 : box.width/2}px`,top:`${event.clientY ? event.clientY-box.top-10 : box.height/2}px`});
    button.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});
  }));
})();
