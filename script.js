const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
  }));
}
const year=document.querySelector('#year');
if(year)year.textContent=new Date().getFullYear();

const translations={
  'nav a[href="#work"]':'nav.work',
  'nav a[href="#services"]':'nav.services',
  'nav a[href="#about"]':'nav.about',
  '.nav-contact':'nav.contact',
  '.hero-copy .eyebrow':'hero.eyebrow',
  '.hero h1':'hero.title',
  '.hero-text':'hero.description',
  '.hero-actions .button-primary':'hero.primary',
  '.hero-actions .text-link':'hero.secondary',
  '.hero-foot span:first-child':'hero.location',
  '.hero-foot span:last-child':'hero.scroll',
  '.intro .eyebrow':'intro.eyebrow',
  '.intro h2':'intro.title',
  '.intro-text':'intro.description',
  '.work .section-heading .eyebrow':'work.eyebrow',
  '.work .section-heading h2':'work.title',
  '.visual-top':'work.author.top',
  '.editorial-title':'work.author.title',
  '.visual-bottom span:first-child':'work.author.bottom',
  '.project-featured .project-meta h3':'work.author.name',
  '.project-featured .project-meta p':'work.author.description',
  '.project-featured .project-scope':'work.author.scope',
  '.visual-commerce .commerce-caption':'work.store.caption',
  '.project-store .project-meta h3':'work.store.name',
  '.project-store .project-meta p':'work.store.description',
  '.project-store .project-scope':'work.store.scope',
  '.dash-top span:first-child':'work.dashboard.top',
  '.dash-top span:last-child':'work.dashboard.live',
  '.dash-caption':'work.dashboard.caption',
  '.project-dashboard .project-meta h3':'work.dashboard.name',
  '.project-dashboard .project-meta p':'work.dashboard.description',
  '.project-dashboard .project-scope':'work.dashboard.scope',
  '.project-featured .project-tag':'work.concept',
  '.project-store .project-tag':'work.concept',
  '.project-dashboard .project-tag':'work.concept',
  '.project-live .visual-top span:first-child':'work.live.top',
  '.project-live .visual-bottom span:first-child':'work.live.footer',
  '.project-live .project-meta h3':'work.live.name',
  '.project-live .project-type':'work.live.type',
  '.project-live .project-scope':'work.live.scope',
  '.project-live .project-tag':'work.live.label',
  '.project-live .project-link':'work.live.link',
  '.work-note':'work.note',
  '.services .eyebrow':'services.eyebrow',
  '.services h2':'services.title',
  '.service-list>div:nth-child(1) h3':'services.design.name',
  '.service-list>div:nth-child(1) p':'services.design.description',
  '.service-list>div:nth-child(2) h3':'services.dev.name',
  '.service-list>div:nth-child(2) p':'services.dev.description',
  '.service-list>div:nth-child(3) h3':'services.products.name',
  '.service-list>div:nth-child(3) p':'services.products.description',
  '.about .eyebrow':'about.eyebrow',
  '.about h2':'about.title',
  '.about p:not(.eyebrow)':'about.description',
  '.about .text-link':'about.link',
  '.contact .eyebrow':'contact.eyebrow',
  '.contact h2':'contact.title',
  '.contact p:not(.eyebrow)':'contact.description',
  '.contact .button':'contact.button',
  'footer>span:nth-child(2)':'footer.tagline'
};
const safeTranslationTags=new Set(['BR','EM','I','SPAN']);
const safeTranslationClasses=new Set(['pulse','accent']);

function appendSafeTranslationNode(parent,node){
  if(node.nodeType===Node.TEXT_NODE){
    parent.appendChild(document.createTextNode(node.nodeValue||''));
    return;
  }
  if(node.nodeType!==Node.ELEMENT_NODE)return;

  if(!safeTranslationTags.has(node.tagName)){
    node.childNodes.forEach(child=>appendSafeTranslationNode(parent,child));
    return;
  }

  const element=document.createElement(node.tagName.toLowerCase());
  if(node.tagName==='SPAN'){
    const className=(node.getAttribute('class')||'').trim();
    if(safeTranslationClasses.has(className))element.classList.add(className);
  }
  node.childNodes.forEach(child=>appendSafeTranslationNode(element,child));
  parent.appendChild(element);
}

function setSafeTranslation(target,value){
  const parsed=new DOMParser().parseFromString(String(value),'text/html');
  const fragment=document.createDocumentFragment();
  parsed.body.childNodes.forEach(node=>appendSafeTranslationNode(fragment,node));
  target.replaceChildren(fragment);
}

function applyTranslations(){
  for(const [selector,key] of Object.entries(translations)){
    const nodes=document.querySelectorAll(selector);
    nodes.forEach(node=>setSafeTranslation(node,window.i18next.t(key)));
  }
  const isSpanish=window.i18next.language.startsWith('es');
  const pageMeta=isSpanish ? {
    title:'JB Web Studio | Portafolio de diseño y desarrollo web',
    description:'Portafolio de diseño y desarrollo web con un catálogo digital en vivo y conceptos de interfaz creados por JB Web Studio, desde Nicaragua.',
    locale:'es_NI'
  } : {
    title:'JB Web Studio | Web Design & Development Portfolio',
    description:'Web design and development portfolio featuring a live digital catalog and selected UI concepts by JB Web Studio, based in Nicaragua.',
    locale:'en_US'
  };
  document.documentElement.lang=isSpanish?'es':'en';
  document.title=pageMeta.title;
  const updateMeta=(selector,value)=>{
    const element=document.querySelector(selector);
    if(element)element.setAttribute('content',value);
  };
  updateMeta('meta[name="description"]',pageMeta.description);
  updateMeta('meta[property="og:title"]',pageMeta.title);
  updateMeta('meta[property="og:description"]',pageMeta.description);
  updateMeta('meta[property="og:locale"]',pageMeta.locale);
  updateMeta('meta[name="twitter:title"]',pageMeta.title);
  updateMeta('meta[name="twitter:description"]',pageMeta.description);
}
async function setupLanguages(){
  const toggle=document.querySelector('#language-toggle');
  if(!window.i18next||!toggle)return;

  const updateLanguageToggle=()=>{
    const current=window.i18next.language.startsWith('es')?'es':'en';
    const next=current==='es'?'en':'es';
    toggle.textContent=current.toUpperCase();
    toggle.setAttribute('aria-label',next==='es'?'Switch language to Spanish':'Cambiar idioma a inglés');
    toggle.setAttribute('aria-pressed',String(current==='es'));
  };
  try{
    const [en,es]=await Promise.all([
      fetch('./locales/en/translation.json').then(r=>{if(!r.ok)throw Error('English translations unavailable');return r.json();}),
      fetch('./locales/es/translation.json').then(r=>{if(!r.ok)throw Error('Spanish translations unavailable');return r.json();})
    ]);
    const saved=localStorage.getItem('jbws-language');
    const browser=(navigator.languages||[navigator.language||'en'])[0].toLowerCase();
    const initial=saved||(browser.startsWith('es')?'es':'en');
    await window.i18next.init({
      lng:initial,
      fallbackLng:'en',
      resources:{en:{translation:en},es:{translation:es}},
      interpolation:{escapeValue:false}
    });
    applyTranslations();
    updateLanguageToggle();
    toggle.addEventListener('click',async()=>{
      const next=window.i18next.language.startsWith('es')?'en':'es';
      await window.i18next.changeLanguage(next);
      localStorage.setItem('jbws-language',next);
      applyTranslations();
      updateLanguageToggle();
    });
  }catch(error){
    console.error('Language setup failed; showing the default English content.',error);
    toggle.textContent='EN';
    toggle.setAttribute('aria-label','Cambiar idioma a inglés');
  }
}
setupLanguages();