import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search, Building2 } from "lucide-react";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  address_components?: google.maps.places.PlaceResult["address_components"];
}

interface GooglePlacesSearchProps {
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    __googleMapsLoaded?: boolean;
    __googleMapsCallbacks?: (() => void)[];
  }
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    if (window.__googleMapsCallbacks) {
      window.__googleMapsCallbacks.push(resolve);
      return;
    }

    window.__googleMapsCallbacks = [resolve];

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      window.__googleMapsCallbacks?.forEach((cb) => cb());
      window.__googleMapsCallbacks = undefined;
    };
    document.head.appendChild(script);
  });
}

export default function GooglePlacesSearch({ onSelect, placeholder }: GooglePlacesSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDiv = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    loadGoogleMapsScript(apiKey).then(() => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      if (!dummyDiv.current) {
        dummyDiv.current = document.createElement("div");
      }
      placesService.current = new google.maps.places.PlacesService(dummyDiv.current);
      setReady(true);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      autocompleteService.current.getPlacePredictions(
        {
          input,
          types: ["establishment"],
          componentRestrictions: { country: "br" },
        },
        (predictions, status) => {
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setResults(predictions);
            setShowResults(true);
          } else {
            setResults([]);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 350);
  };

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    setFetchingDetails(true);
    setShowResults(false);
    setQuery(prediction.structured_formatting.main_text);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["name", "formatted_address", "formatted_phone_number", "website", "address_components", "place_id"],
      },
      (place, status) => {
        setFetchingDetails(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          onSelect({
            place_id: place.place_id || prediction.place_id,
            name: place.name || "",
            formatted_address: place.formatted_address || "",
            formatted_phone_number: place.formatted_phone_number || undefined,
            website: place.website || undefined,
            address_components: place.address_components,
          });
        }
      }
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder || "Buscar empresa por nome e cidade…"}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-9 pr-9"
          disabled={!ready}
        />
        {(loading || fetchingDetails) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="flex items-start gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {r.structured_formatting.main_text}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!ready && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando busca…
        </p>
      )}
    </div>
  );
}
