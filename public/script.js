const s3BucketUrl = "https://tkt-online-bookstore.s3.ap-south-1.amazonaws.com"

async function main() {
    const response = await fetch('/books')

    if (!response.ok) throw new Error("failed to get the books")
    const json = await response.json();
    const data = json.Items
    return data
}

const $ = id => document.getElementById(id);
const formatPrice = v => 'LKR ' + v.toLocaleString();

function renderCategoryOptions(list) {
    const cats = Array.from(new Set(list.map(b => b.category.S))).sort();
    const sel = $('categoryFilter');
    cats.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; sel.appendChild(opt); });
}

function renderBooks(list) {
    const grid = $('booksGrid'); grid.innerHTML = '';

    list.forEach(b => {
        const el = document.createElement('div'); el.className = 'card book';
        el.innerHTML = `
    <div class="cover book" style="background-image: url('${s3BucketUrl}/${escapeHtml(b.image.S)}')"></div>
      <div class="title">${escapeHtml(b.title.S)}</div>
      <div class="muted">${escapeHtml(b.author.S)} • ${b.published_year.S}</div>
    </div>
      </div>
    </div>
  `;
        grid.appendChild(el);
    });
    $('resultCount').textContent = list.length;
}

function applyFilters(books) {
    const q = $('q').value.trim().toLowerCase();
    const cat = $('categoryFilter').value;
    const sortBy = $('sortBy').value;
    let results = books.filter(b => {
        const matchQ = q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
        const matchC = cat === '' || b.category === cat;
        return matchQ && matchC;
    });
    if (sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') results.sort((a, b) => b.year - b.year);
    else results.sort((a, b) => b.title.localeCompare(a.title));
    renderBooks(results);
}

function openCartModal() {
    $('cartModal').style.display = 'flex';
    $('cartModal').setAttribute('aria-hidden', 'false');
    renderCartItems();
}
function closeCartModal() {
    $('cartModal').style.display = 'none';
    $('cartModal').setAttribute('aria-hidden', 'true');
}

function escapeHtml(str) { return String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s }

document.addEventListener('DOMContentLoaded', () => {
    $('searchBtn').addEventListener('click', async () => {
        const title = $('query').value;
        const category = $('categoryFilter').value;

        if (title != '') {
            const response = await Books.getBookByTitle(title)
            const books = await response.json();
            renderBooks(books)
            return
        }

        if (category != '') {
            const response = await Books.getBooksByCategory(category)
            const books = await response.json();
            renderBooks(books)
            return
        }

        const response = await Books.getBooks()
        const books = await response.json();
        renderBooks(books)

    });
})


class Books {
    static async getBookByTitle(title) {
        try {
            const response = await fetch(`/books?title=${title}`);

            if (response.ok) {
                return response
            } else {

            }
        } catch (err) {
            console.error(err)
        }
    }

    static async getBooks() {
        const response = await fetch('/books')

        return data
    }

    static async getBooksByCategory(category) {
        try {
            const response = await fetch(`/books?category=${category}`);

            if (response.ok) {
                return response
            } else {

            }
        } catch (err) {
            console.error(err)
        }
    }

}

main()
    .then(data => {
        renderBooks(data);
        renderCategoryOptions(data);
    })
    .catch(err => {
        console.error(err)
    })
