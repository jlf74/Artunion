
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
function render(grid,modules){
modules.forEach((pair,m)=>pair.forEach((half,h)=>{
const big=typeof half==='string';
(big?[half]:half).forEach((id,i)=>{
if(!id)return;
const tile=bank.get(id).cloneNode(true);
tile.className='au-tile'+(big?' au-big':'');
tile.style.gridColumn=(h*2+1+(big?0:i%2))+' / span '+(big?2:1);
tile.style.gridRow=(m*2+1+(big?0:Math.floor(i/2)))+' / span '+(big?2:1);
if(id==='dary_2'){const link=document.createElement('a');link.className='au-case-link';link.dataset.reviewPage='case';link.href='#case';link.setAttribute('aria-label','Открыть видеокейс Дары Кубани 2');tile.append(link);}grid.append(tile);
});
}));
}
render(root.querySelector('#au-gallery-review-solid'),solid);
const airSite=root.querySelector('.au-site');
const design={gap:8,grid:false};
function apply(){airSite.style.setProperty('--gap',design.gap+'px');airSite.querySelector('.au-grid').classList.toggle('show-grid',design.grid);}
if(globalThis.Tweak){const tweak=new Tweak({container:airSite,onChange:apply});tweak.addSlider(design,'gap',{label:'Зазор по обеим осям',min:4,max:12,unit:'px'});tweak.addToggle(design,'grid',{label:'Показать колонки'});}
})();
