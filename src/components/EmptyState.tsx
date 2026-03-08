import { Search, MapPin } from "lucide-react";

type EmptyStateProps = {
  searched: boolean;
};

export const EmptyState = ({ searched }: EmptyStateProps) => {
  if (!searched) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
          <Search size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Start your search
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Enter a city and select a business category above to find leads without websites.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
        <MapPin size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No results found
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Try a different city or category. We're expanding coverage regularly.
      </p>
    </div>
  );
};
