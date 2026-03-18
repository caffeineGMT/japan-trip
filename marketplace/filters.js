/**
 * Template Filtering and Sorting Logic
 */

class TemplateFilters {
  constructor(templates) {
    this.allTemplates = templates;
    this.filteredTemplates = templates;
  }

  /**
   * Apply all active filters to the template list
   */
  applyFilters(filters) {
    let results = [...this.allTemplates];

    // Destination filter
    if (filters.destination) {
      results = results.filter(t => t.destination === filters.destination);
    }

    // Duration filter
    if (filters.durationMin !== null && filters.durationMin !== undefined) {
      results = results.filter(t => t.duration_days >= filters.durationMin);
    }
    if (filters.durationMax !== null && filters.durationMax !== undefined) {
      results = results.filter(t => t.duration_days <= filters.durationMax);
    }

    // Season filter
    if (filters.seasons && filters.seasons.length > 0) {
      results = results.filter(t => {
        // "all" season matches everything
        if (t.season === 'all') return true;
        // Check if template's season is in selected seasons
        return filters.seasons.includes(t.season) || filters.seasons.includes('all');
      });
    }

    // Price filter
    if (filters.priceMin !== null && filters.priceMin !== undefined) {
      results = results.filter(t => t.price >= filters.priceMin);
    }
    if (filters.priceMax !== null && filters.priceMax !== undefined) {
      results = results.filter(t => t.price <= filters.priceMax);
    }

    // Apply sorting
    if (filters.sortBy) {
      results = this.sortTemplates(results, filters.sortBy);
    }

    this.filteredTemplates = results;
    return results;
  }

  /**
   * Sort templates by specified criteria
   */
  sortTemplates(templates, sortBy) {
    const sorted = [...templates];

    switch (sortBy) {
      case 'popular':
        sorted.sort((a, b) => b.sales_count - a.sales_count);
        break;

      case 'newest':
        // Since we don't have dates, use ID as proxy for newest
        sorted.reverse();
        break;

      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;

      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;

      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;

      case 'duration-asc':
        sorted.sort((a, b) => a.duration_days - b.duration_days);
        break;

      case 'duration-desc':
        sorted.sort((a, b) => b.duration_days - a.duration_days);
        break;

      default:
        // Default to most popular
        sorted.sort((a, b) => b.sales_count - a.sales_count);
    }

    return sorted;
  }

  /**
   * Search templates using Fuse.js fuzzy search
   */
  searchTemplates(query, templates = null) {
    const searchIn = templates || this.filteredTemplates;

    if (!query || query.trim() === '') {
      return searchIn;
    }

    const fuse = new Fuse(searchIn, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'destination', weight: 2 },
        { name: 'country', weight: 1.5 },
        { name: 'tags', weight: 1 },
        { name: 'description', weight: 0.5 }
      ],
      threshold: 0.4,
      includeScore: true
    });

    const results = fuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Get current filtered templates
   */
  getFilteredTemplates() {
    return this.filteredTemplates;
  }

  /**
   * Get statistics about current filters
   */
  getStats() {
    const templates = this.filteredTemplates;

    if (templates.length === 0) {
      return {
        count: 0,
        avgPrice: 0,
        avgRating: 0,
        totalSales: 0
      };
    }

    return {
      count: templates.length,
      avgPrice: (templates.reduce((sum, t) => sum + t.price, 0) / templates.length).toFixed(0),
      avgRating: (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1),
      totalSales: templates.reduce((sum, t) => sum + t.sales_count, 0)
    };
  }

  /**
   * Get unique values for filter options
   */
  getFilterOptions() {
    return {
      destinations: [...new Set(this.allTemplates.map(t => t.destination))].sort(),
      seasons: [...new Set(this.allTemplates.map(t => t.season))].sort(),
      priceRange: {
        min: Math.min(...this.allTemplates.map(t => t.price)),
        max: Math.max(...this.allTemplates.map(t => t.price))
      },
      durationRange: {
        min: Math.min(...this.allTemplates.map(t => t.duration_days)),
        max: Math.max(...this.allTemplates.map(t => t.duration_days))
      }
    };
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateFilters;
}
