/**
 * Normalizes text for consistent comparison.
 * Removes accents (diacritics) and converts to lowercase.
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Checks if a search term matches a target string using fuzzy logic (partial/multi-word).
 */
export const fuzzyMatch = (searchTerm, targetContent) => {
  if (!searchTerm || !targetContent) return false;
  
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedTarget = normalizeText(targetContent);
  
  // Split search into individual words and ensure all words are present in target
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
  
  return searchWords.every(word => normalizedTarget.includes(word));
};

/**
 * Global search engine for servicesData.
 */
export const searchServices = (data, query) => {
  if (!query) return [];
  
  return data.filter(item => {
    const searchableContent = `${item.name} ${item.worker} ${item.cat} ${item.desc || ''}`.toLowerCase();
    return fuzzyMatch(query, searchableContent);
  });
};
