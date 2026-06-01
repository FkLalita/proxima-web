import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const CATS = ['All', 'Restaurant', 'Pharmacy', 'Mechanic', 'Salon', 'Supermarket', 'Bank', 'Hotel']

export function SearchBar({ onSearch, onCategory, activeCategory }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <div className="searchbar">
      <form onSubmit={handleSubmit} className="search-input-wrap">
        <Search size={14} strokeWidth={2} className="search-icon" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="mechanic, suya, pharmacy..."
          className="search-input"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); onSearch('') }} className="search-clear">
            <X size={13} />
          </button>
        )}
        <button type="submit" className="search-filter-btn">
          <SlidersHorizontal size={14} />
        </button>
      </form>

      <div className="cat-chips">
        {CATS.map(cat => {
          const val = cat === 'All' ? '' : cat
          return (
            <button
              key={cat}
              onClick={() => onCategory(val)}
              className={`cat-chip ${activeCategory === val ? 'cat-chip--active' : ''}`}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}
