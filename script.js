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
  '.visual-commerce .commerce-caption':'work.store.caption',
  '.project-card:nth-child(2) .project-meta h3':'work.store.name',
  '.project-card:nth-child(2) .project-meta p':'work.store.description',
  '.dash-top span:first-child':'work.dashboard.top',
  '.dash-top span:last-child':'work.dashboard.live',
  '.dash-caption':'work.dashboard.caption',
  '.project-card:nth-child(3) .project-meta h3':'work.dashboard.name',
  '.project-card:nth-child(3) .project-meta p':'work.dashboard.description',
  '.project-tag':'work.concept',
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
    const allowedClasses=(node.getAttribute('class')||'')
      .split(/\\s+/)
      .filter(className=>safeTranslationClasses.has(className));
    if(allowedClasses.length)element.classList.add(...allowedClasses);
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
  document.documentElement.lang=window.i18next.language;
  document.title=window.i18next.language==='es'
    ? 'JB Web Studio — Diseño y desarrollo web'
    : 'JB Web Studio — Digital experiences, thoughtfully built';
  const meta=document.querySelector('meta[name="description"]');
  if(meta)meta.content=window.i18next.language==='es'
    ? 'JB Web Studio — Diseño web, desarrollo y experiencias digitales con propósito.'
    : 'JB Web Studio — websites, digital experiences and web projects crafted with purpose.';
}
async function setupLanguages(){
  const selector=document.querySelector('#language-select');
  if(!window.i18next||!selector)return;
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
    selector.value=window.i18next.language.startsWith('es')?'es':'en';
    applyTranslations();
    selector.addEventListener('change',async()=>{
      await window.i18next.changeLanguage(selector.value);
      localStorage.setItem('jbws-language',selector.value);
      applyTranslations();
    });
  }catch(error){
    console.error('Language setup failed; showing the default English content.',error);
    selector.value='en';
  }
}
setupLanguages();