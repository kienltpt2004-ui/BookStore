// sample data modeled after screenshots; replace with real data or API

function renderGrid(containerId, items){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = items.map(it => `
    <div class="book">
      <img src="${it.img}" alt="${escapeHtml(it.title)}" />
      <div class="name">${escapeHtml(it.title)}</div>
      <div class="price">${escapeHtml(it.price)}</div>
    </div>
  `).join('');
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderGrid('newBooks', data.newBooks);
  renderGrid('bestSellers', data.bestSellers);
  renderGrid('mangaGrid', data.manga);
  renderGrid('lifeBooks', data.life);

  // simple search
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', ()=>{
    const q = (searchInput.value || '').trim().toLowerCase();
    if(!q) { renderGrid('newBooks', data.newBooks); renderGrid('bestSellers', data.bestSellers); return; }
    const filtered = data.newBooks.concat(data.bestSellers, data.manga, data.life).filter(b => b.title.toLowerCase().includes(q));
    // show results in newBooks area for simplicity
    renderGrid('newBooks', filtered);
  });
});
