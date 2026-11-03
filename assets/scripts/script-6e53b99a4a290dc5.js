
(()=>{
const root=document.getElementById('au-gallery-review');
const bank=new Map([...root.querySelector('template').content.querySelectorAll('[data-project]')].map(el=>[el.dataset.project,el]));
const solid=[
['dary_2',['zenit','nexemezin','dkkids','ovsyasha']],
[['creamzy','umalat','dary','moskovsky'],'bridgestone'],
['tikkurila',['kinomax','unionpay','grand','kumach']],
[['worldclass','veres','emelya','mizura'],'gremm'],
['malysheva',['pastrami','novalgin','vico','alpen']],
[['ekzo','astellas','mense','grand_tea'],'baikal'],
[['victoria','sheb','elkar','tefal'],['papa','lacalut','marykay','ostankino']]
];
const grid=root.querySelector('#au-gallery-review-solid'),slots=[];
solid.forEach((pair,m)=>pair.forEach((half,h)=>{const large=typeof half==='string';(large?[half]:half).forEach((id,i)=>{if(id)slots.push({large,column:h*2+1+(large?0:i%2),row:m*2+1+(large?0:Math.floor(i/2))});});}));
const ids=[...bank.keys()],tiles=new Map(ids.map(id=>{const tile=bank.get(id).cloneNode(true);if(id==='dary_2'&&!tile.querySelector('.au-case-link')){const link=document.createElement('a');link.className='au-case-link';link.dataset.reviewPage='case';link.href='#case';link.setAttribute('aria-label','Открыть видеокейс Дары Кубани 2');tile.append(link);}return[id,tile];}));
const largeCount=slots.filter(slot=>slot.large).length,storageKey='art-union-gallery-large-v1';
let memoryHost=window;try{if(parent!==window&&parent.location.origin===location.origin)memoryHost=parent;}catch{}
const validIds=value=>Array.isArray(value)?value.filter(id=>bank.has(id)):[];
function previousLarge(){try{const saved=sessionStorage.getItem(storageKey);if(saved)return validIds(JSON.parse(saved));}catch{}return validIds(memoryHost.__ART_UNION_LAST_LARGE__);}
function rememberLarge(value){memoryHost.__ART_UNION_LAST_LARGE__=value.slice();try{sessionStorage.setItem(storageKey,JSON.stringify(value));}catch{}}
function shuffled(value){const result=value.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function arrangeVisit(){
 const previous=new Set(previousLarge()),candidates=ids.filter(id=>!previous.has(id));
 const large=shuffled(candidates.length>=largeCount?candidates:ids).slice(0,largeCount),largeSet=new Set(large),small=shuffled(ids.filter(id=>!largeSet.has(id)));
 const focused=grid.contains(document.activeElement)?document.activeElement:null,fragment=document.createDocumentFragment();let bigIndex=0,smallIndex=0;
 slots.forEach(slot=>{const tile=tiles.get(slot.large?large[bigIndex++]:small[smallIndex++]);tile.classList.toggle('au-big',slot.large);tile.style.gridColumn=slot.column+' / span '+(slot.large?2:1);tile.style.gridRow=slot.row+' / span '+(slot.large?2:1);fragment.append(tile);});
 grid.replaceChildren(fragment);rememberLarge(large);focused?.focus({preventScroll:true});
}
arrangeVisit();
addEventListener('pageshow',event=>{if(event.persisted)arrangeVisit();});
const airSite=root.querySelector('.au-site');
const design={gap:8,grid:false};
function apply(){airSite.style.setProperty('--gap',design.gap+'px');airSite.querySelector('.au-grid').classList.toggle('show-grid',design.grid);}
if(globalThis.Tweak){const tweak=new Tweak({container:airSite,onChange:apply});tweak.addSlider(design,'gap',{label:'Зазор по обеим осям',min:4,max:12,unit:'px'});tweak.addToggle(design,'grid',{label:'Показать колонки'});}
})();
