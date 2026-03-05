// ==UserScript==
// @name         PepHop Restoration - v1.4.0-RC
// @version      1.4.0
// @author       Community Restore
// @match        *://pephop.ai/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    const getS = (k, f) => localStorage.getItem(k) || f;
    const setS = (k, v) => localStorage.setItem(k, v);

    const tags = [{id:"",n:"🏷️ Tags"},{id:"15",n:"🤖 OC"},{id:"5",n:"🎬 Scenario"},{id:"22",n:"🧙 Fantasy"},{id:"10",n:"⛩️ Anime"},{id:"1",n:"♀️ Female"},{id:"2",n:"♂️ Male"}];

    function injectUI() {
        const header = document.querySelector('.ant-menu-horizontal') || document.querySelector('header ul');
        if (header && !document.getElementById('ph-final-hub')) {
            const hubLi = document.createElement('li');
            hubLi.id = "ph-final-hub";
            hubLi.style.cssText = "display:flex !important; flex-direction:column; align-items:flex-end; margin-left:auto; margin-right:20px; list-style:none !important; order:99; gap:6px; padding:6px 0;";

            const sort = getS('ph_sort', 'latest');
            const mode = getS('ph_mode', 'all');

            // TIER 1: ALL | NSFW | SFW + SORT
            const tier1 = `
                <div style="display:flex; gap:12px; font-size:11px; color:#888; font-weight:bold; cursor:pointer; background:rgba(0,0,0,0.4); padding:4px 10px; border-radius:15px;">
                    <span onclick="localStorage.setItem('ph_sort','latest');location.reload()" style="${sort=='latest'?'color:#1890ff':''}">LATEST</span>
                    <span onclick="localStorage.setItem('ph_sort','popular');location.reload()" style="${sort=='popular'?'color:#1890ff':''}">POPULAR</span>
                    <div style="width:1px; background:#555; margin:0 4px;"></div>
                    <span onclick="localStorage.setItem('ph_mode','all');location.reload()" style="${mode=='all'?'color:#1890ff':''}">ALL</span>
                    <span onclick="localStorage.setItem('ph_mode','nsfw');location.reload()" style="${mode=='nsfw'?'color:#ff4d4f':''}">NSFW</span>
                    <span onclick="localStorage.setItem('ph_mode','sfw');location.reload()" style="${mode=='sfw'?'color:#52c41a':''}">SFW</span>
                </div>`;

            // TIER 2: INTEGRATED BAR
            const tagOpts = tags.map(t => `<option value="${t.id}" ${getS('ph_t','')==t.id?'selected':''}>${t.n}</option>`).join('');
            const tier2 = `
                <div style="display:flex; align-items:center; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:8px; border:1px solid #333; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
                    <select id="phT" style="background:transparent; border:none; color:#1890ff; font-size:13px; outline:none; cursor:pointer; font-weight:bold; width:90px;">${tagOpts}</select>
                    <div style="width:1px; height:16px; background:#444; margin:0 10px;"></div>
                    <input type="text" id="phI" value="${getS('ph_s','')}" placeholder="Search 37k bots..." style="background:transparent; border:none; color:#fff; width:160px; font-size:14px; outline:none;">
                    <button id="phB" style="background:#1890ff; border:none; color:#fff; cursor:pointer; font-weight:bold; font-size:11px; padding:5px 12px; border-radius:4px; margin-left:10px; text-transform:uppercase;">Search</button>
                </div>`;

            hubLi.innerHTML = tier1 + tier2;
            header.appendChild(hubLi);

            const go = () => { setS('ph_s', document.getElementById('phI').value); setS('ph_t', document.getElementById('phT').value); location.reload(); };
            document.getElementById('phB').onclick = go;
            document.getElementById('phI').onkeydown = (e) => { if(e.key==='Enter') go(); };
            document.getElementById('phT').onchange = go;
        }
    }

    setInterval(injectUI, 300);

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (typeof url === 'string' && url.includes('characters/')) {
            try {
                let u = new URL(url.replace('characters/newnew', 'characters/new'), window.location.origin);
                u.searchParams.set('sort', getS('ph_sort', 'latest'));

                // Content Filter Logic
                const m = getS('ph_mode', 'all');
                if (m === 'nsfw') u.searchParams.set('mode', 'nsfw');
                else if (m === 'sfw') u.searchParams.set('mode', 'sfw');
                else u.searchParams.set('mode', 'all');

                if (getS('ph_s','')) u.searchParams.set('search', getS('ph_s',''));
                if (getS('ph_t','')) u.searchParams.set('tag_id', getS('ph_t',''));

                url = u.toString();
            } catch(e) {}
        }
        return originalOpen.apply(this, [method, url, ...args]);
    };
})();
