interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function FollowUpSuggestions({
  suggestions,
  onSelect,
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-luckin-light">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-sm rounded-full
            bg-luckin-sky text-luckin-primary
            hover:bg-luckin-primary hover:text-white
            transition-luckin focus-luckin"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
