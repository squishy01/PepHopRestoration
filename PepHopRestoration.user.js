// ==UserScript==
// @name         PepHop Restoration
// @version      1.4.4
// @author       Community Restore
// @match        *://pephop.ai/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {

const getS = (k, f) => localStorage.getItem(k) || f;
const setS = (k, v) => localStorage.setItem(k, v);

// Default placeholder tag at the top
let tags = [
  {id:"", name:"🏷️ Tags"}
];

function injectStyles() {
  if (document.getElementById('ph-styles')) return;
  const style = document.createElement('style');
  style.id = 'ph-styles';
  style.textContent = `
    #ph-bar { width:100%; background:#111; border-bottom:1px solid #333; padding:8px 12px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; font-size:13px; z-index:9999; box-sizing:border-box; }
    #ph-bar select, #ph-bar input { height:30px; background:#222; color:#fff; border:1px solid #444; border-radius:4px; padding:4px 8px; font-weight:600; outline:none; }
    #ph-bar input::placeholder { color:#aaa; }
    #ph-bar button { background-color:#222; color:#bbb; border:1px solid #444; border-radius:4px; padding:6px 12px; cursor:pointer; font-weight:600; transition: background-color 0.2s,color 0.2s; min-width:60px; user-select:none; }
    #ph-bar button:hover { background-color:#1890ff; color:white; border-color:#1890ff; }
    #ph-bar button.active { background-color:#1890ff; color:white; border-color:#1890ff; }
  `;
  document.head.appendChild(style);
}

function updateActiveButtons() {
  const sort = getS("ph_sort", "latest");
  const mode = getS("ph_mode", "all");

  ["Latest","Popular"].forEach(id => {
    document.getElementById("ph"+id).classList.toggle("active", sort.toLowerCase() === id.toLowerCase());
  });
  ["All","NSFW","SFW"].forEach(id => {
    document.getElementById("ph"+id).classList.toggle("active", mode.toLowerCase() === id.toLowerCase());
  });
}

function injectUI(){
  if(document.getElementById("ph-bar")) return;
  const header = document.querySelector("header");
  if(!header) return;

  injectStyles();

  const bar = document.createElement("div");
  bar.id = "ph-bar";

  const tagOpts = tags.map(t =>
    `<option value="${t.id}" ${getS('ph_t','')===String(t.id)?'selected':''}>${t.name}</option>`
  ).join("");

  bar.innerHTML = `
    <select id="phT">${tagOpts}</select>
    <input id="phI" value="${getS('ph_s','')}" placeholder="Search bots...">
    <button id="phSearch">Search</button>
    <button id="phLatest">Latest</button>
    <button id="phPopular">Popular</button>
    <button id="phAll">All</button>
    <button id="phNSFW">NSFW</button>
    <button id="phSFW">SFW</button>
  `;

  header.after(bar);

  const go = () => {
    setS("ph_s", document.getElementById("phI").value);
    setS("ph_t", document.getElementById("phT").value);
    location.reload();
  };

  document.getElementById("phSearch").onclick = go;
  document.getElementById("phI").onkeydown = e => { if(e.key==="Enter") go(); };
  document.getElementById("phT").onchange = go;

  document.getElementById("phLatest").onclick = () => { setS("ph_sort","latest"); location.reload(); };
  document.getElementById("phPopular").onclick = () => { setS("ph_sort","popular"); location.reload(); };
  document.getElementById("phAll").onclick = () => { setS("ph_mode","all"); location.reload(); };
  document.getElementById("phNSFW").onclick = () => { setS("ph_mode","nsfw"); location.reload(); };
  document.getElementById("phSFW").onclick = () => { setS("ph_mode","sfw"); location.reload(); };

  updateActiveButtons();
}

// Fetch tags from API and append after default placeholder
fetch('https://api.eosai.chat/tags')
  .then(res => res.json())
  .then(apiTags => {
    if(apiTags && apiTags.length){
      tags = [{id:"", name:"🏷️ Tags"}, ...apiTags.map(t => ({id:t.id, name:t.name}))];
    }
  })
  .finally(() => setInterval(injectUI, 500));

})();
