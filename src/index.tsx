import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDebounce } from "./useDebounce";
interface PlaceDetails {
  name: string;
  lat: number;
  lng: number;
  placeId: string;
  id: string;
  types: string[];
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  viewport: {
    low: {
      latitude: number;
      longitude: number;
    };
    high: {
      latitude: number;
      longitude: number;
    };
  };
  googleMapsUri: string;
  displayName: {
    text: string;
    languageCode: string;
  };
}

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onSelect: (place: PlaceDetails) => void;
  onError?: (error: unknown) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  debounceDelay: number;
  customLoader: any;
  renderSuggestion?: (suggestion: {
    placeId: string;
    text: {
      text: string;
      languageCode: string;
    };
  }) => React.ReactNode;
}

interface Suggestion {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
      languageCode: string;
    };
  };
}
export const GooglePlacesAutocomplete: React.FC<
  GooglePlacesAutocompleteProps
> = ({
  apiKey,
  onSelect,
  placeholder = "Search address...",
  className = "",
  renderSuggestion,
  onError,
  debounceDelay = 500,
  customLoader = "loading...",
}) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isProgrammaticInput, setIsProgrammaticInput] = useState(false);
  const [suggestionLoading, setSuggestionsLoading] = useState(false);
  const inputValue = useDebounce(input, debounceDelay);
  const essentialFields = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "viewport",
    "googleMapsUri",
    "types",
  ].join(",");

  useEffect(() => {
    if (!inputValue || isProgrammaticInput) {
      setIsProgrammaticInput(false);
      return;
    }
    fetchAutocomplete(inputValue);
  }, [inputValue]);

  const fetchAutocomplete = async (text: string) => {
    try {
      setSuggestionsLoading(true);
      const res = await axios.post(
        "https://places.googleapis.com/v1/places:autocomplete",
        { input: text },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "*",
          },
        }
      );
      setSuggestionsLoading(false);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      if (onError) onError(err);
      console.error("Autocomplete error", err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const res = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          params: {
            key: apiKey,
            fields: essentialFields,
          },
        }
      );
      const place = res.data;
      return {
        name: place.displayName?.text,
        lat: place.location?.latitude,
        lng: place.location?.longitude,
        placeId,
        ...res.data,
      };
    } catch (err) {
      console.error("Place details error", err);
      if (onError) onError(err);
      return null;
    }
  };

  const handleInputChange = (val: string) => {
    const value = val.trim();
    setInput(value);
    if (!value) {
      setSuggestions([]);
      return;
    }
  };

  const handleSelect = async (placeId: string) => {
    const details = await fetchPlaceDetails(placeId);
    if (details) {
      setIsProgrammaticInput(true);
      setInput(details.name);
      setSuggestions([]);
      onSelect(details);
    }
    setOpenDropdown(false);
  };

  return (
    <div className={`${className}`}>
      <div
        style={{
          position: "relative",
          left: 0,
          textAlign: "left",
          width: "100%",
        }}
      >
        <input
          role="combobox"
          aria-expanded={openDropdown}
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          className="new_place_select_input"
          style={{
            textAlign: "left",
            width: "100%",
          }}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setOpenDropdown(false)}
          onFocus={() => setOpenDropdown(true)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder={placeholder}
        />

        {openDropdown && suggestionLoading ? (
          <div
            className="new_place_select_dropdown"
            style={{
              position: "absolute",
              marginTop: 4,
              width: "100%",
              zIndex: 9999,
              left: "auto",
              background: "#fff",
              border: "1px solid #cecece",
            }}
          >
            <div style={{ fontSize: "14px" }}>{customLoader}</div>
          </div>
        ) : (
          suggestions.length > 0 && (
            <div
              className="new_place_select_dropdown"
              style={{
                position: "absolute",
                width: "100%",
                zIndex: 9999,
              }}
            >
              <ul style={{ listStyle: "none", padding: 0, marginTop: 4 }}>
                {suggestions.map(({ placePrediction: place }) => (
                  <li
                    key={place?.placeId}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleSelect(place?.placeId);
                    }}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      background: "white",
                    }}
                  >
                    {renderSuggestion
                      ? renderSuggestion(place)
                      : place?.text?.text}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
};
