const grid = document.querySelector('.grid');
const searchInput = document.querySelector('#search');
const showAllBtn = document.querySelector('#showAll');
const showFavoritesBtn = document.querySelector('#showFavorites');

const noDuplicatedSaints = saints.filter((saint, index, self) =>
  index === self.findIndex(s => s.Name_of_Saint === saint.Name_of_Saint)
);

const favoriteNames = window.favorites.map(fav => fav.saintName);

showAllBtn.addEventListener('click', () => renderSaints(noDuplicatedSaints));
showFavoritesBtn.addEventListener('click', () => renderFavoritesSaints());
searchInput.addEventListener('input', (e) => {
  const searchValue = e.target.value.toLowerCase();
  const filteredSaints = noDuplicatedSaints.filter(saint =>
    saint.Name_of_Saint.toLowerCase().includes(searchValue)
  );
  renderSaints(filteredSaints);
});

grid.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('favorite-icon')) return;
  const card = e.target.closest('.card');
  const saintName = card.querySelector('.name').innerText.trim();
  try {
    const response = await fetch('/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saintName, userId: window.userId })
    });
    if (!response.ok) throw new Error('Failed to save favorite');
    window.location.reload(true);
  } catch (error) {
    console.error('Error saving favorite:', error);
  }
});

function getElement(saint) {
  const isFavorited = favoriteNames.includes(saint.Name_of_Saint) ? 'fas' : 'far';
  const newElement = document.createElement('div');
  newElement.className = 'facilityContainer';
  newElement.innerHTML = `
    <div class="card" style="position: relative;">
      <i class="${isFavorited} fa-star favorite-icon" style="position: absolute; top: 15px; right: 15px; cursor: pointer;"></i>
      <div class="name">${saint.Name_of_Saint}</div>
      <div class="role">${saint.birth_year || "N/A"} (${saint.place_of_birth || "N/A"}) - ${saint.death_year || "N/A"} (${saint.death_country || "N/A"})</div>
      <div class="role">${saint.country || "N/A"} | ${saint.vocation || "N/A"}</div>
      <div class="role">Feast Day: ${saint.Memorial}</div>
      <a href="#" class="button">View Profile</a>
    </div>
  `;
  return newElement;
}

function renderSaints(saintsList) {
  grid.innerHTML = '';
  saintsList.forEach(saint => grid.append(getElement(saint)));
}

function renderFavoritesSaints() {
  const favoriteSaints = noDuplicatedSaints.filter(saint =>
    favoriteNames.includes(saint.Name_of_Saint)
  );
  renderSaints(favoriteSaints);
}

renderSaints(noDuplicatedSaints);
