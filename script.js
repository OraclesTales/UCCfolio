document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('cards-container');
	if (!container) return;

	function createCard(item) {
		const col = document.createElement('div');
		col.className = 'col-md-6 col-md-6';

		const card = document.createElement('div');
		card.className = 'card';
		card.style.width = '100%';

		const img = document.createElement('img');
		img.className = 'card-img-top';
		img.style.height = '400px';
		img.style.objectFit = 'contain';
		img.src = item.image || item.img || 'https://picsum.photos/400/200';
		img.alt = item.alt || item.title || '';
		card.appendChild(img);


		const body = document.createElement('div');
		body.className = 'card-body';

		const pMedium = document.createElement('p');
		pMedium.textContent = item.medium || '';

		const h4 = document.createElement('h4');
		h4.className = 'card-title';
		h4.textContent = item.title || '';

		const pDesc = document.createElement('p');
		pDesc.className = 'card-text';
		pDesc.textContent = item.description || item.desc || '';

		const pYear = document.createElement('p');
		pYear.textContent = item.year || '';
		body.appendChild(pYear);

		const a = document.createElement('a');
		a.className = 'btn btn-primary';
		a.href = img.src; // Show the card image in the lightbox
		a.setAttribute('data-featherlight', 'image');
		a.innerHTML = '<i class="bi bi-eye"></i>\n View';


		body.appendChild(pMedium);
		body.appendChild(h4);
		body.appendChild(pDesc);
		body.appendChild(a);

		card.appendChild(body);
		col.appendChild(card);
		return col;
	}

	function normalizeRow(obj) {
		const normalized = {};
		for (const k in obj) {
			normalized[k.toLowerCase().trim()] = obj[k];
		}
		return {
			image: normalized.image || normalized.img || normalized.photo || '',
			alt: normalized.alt || normalized.alttext || '',
			medium: normalized.medium || normalized.category || '',
			title: normalized.title || normalized.name || '',
			year: normalized.year || '',
			description: normalized.description || normalized.desc || normalized.summary || '',
			link: normalized.link || normalized.url || '#'
		};
	}

	function populate(items) {
		container.innerHTML = '';
		items.forEach(it => container.appendChild(createCard(normalizeRow(it))));
	}

	function fetchJSON() {
		return fetch('data/settings.json').then(r => {
			if (!r.ok) throw new Error('no json');
			return r.json();
		});
	}

	function fetchCSV() {
		return fetch('data/works.csv').then(r => {
			if (!r.ok) throw new Error('CSV fetch failed');
			return r.text().then(text => {
				const lines = text.trim().split(/\r?\n/).filter(Boolean);
				if (lines.length === 0) return [];
				const header = lines.shift().split(',').map(h => h.trim());
				return lines.map(line => {
					const values = line.split(',').map(v => v.trim());
					const obj = {};
					header.forEach((h, i) => { obj[h] = values[i] || ''; });
					return obj;
				});
			});
		});
	}

	fetchJSON()
		.then(data => {
			if (Array.isArray(data)) populate(data);
			else if (data && Array.isArray(data.items)) populate(data.items);
			else console.warn('JSON loaded but format unexpected', data);
		})
		.catch(() => {
			fetchCSV().then(populate).catch(err => console.error('Failed to load data', err));
		});

});
