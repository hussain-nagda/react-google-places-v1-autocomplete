import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { useDebounce } from "./useDebounce";
export const GooglePlacesAutocomplete = ({ apiKey, onSelect, placeholder = "Search address...", className = "", renderSuggestion, onError, debounceDelay = 500, customLoader = "loading...", }) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
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
    const fetchAutocomplete = async (text) => {
        try {
            setSuggestionsLoading(true);
            const res = await axios.post("https://places.googleapis.com/v1/places:autocomplete", { input: text }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": "*",
                },
            });
            setSuggestionsLoading(false);
            setSuggestions(res.data.suggestions || []);
        }
        catch (err) {
            if (onError)
                onError(err);
            console.error("Autocomplete error", err);
        }
        finally {
            setSuggestionsLoading(false);
        }
    };
    const fetchPlaceDetails = async (placeId) => {
        try {
            const res = await axios.get(`https://places.googleapis.com/v1/places/${placeId}`, {
                params: {
                    key: apiKey,
                    fields: essentialFields,
                },
            });
            const place = res.data;
            return {
                name: place.displayName?.text,
                lat: place.location?.latitude,
                lng: place.location?.longitude,
                placeId,
                ...res.data,
            };
        }
        catch (err) {
            console.error("Place details error", err);
            if (onError)
                onError(err);
            return null;
        }
    };
    const handleInputChange = (val) => {
        const value = val.trim();
        setInput(value);
        if (!value) {
            setSuggestions([]);
            return;
        }
    };
    const handleSelect = async (placeId) => {
        const details = await fetchPlaceDetails(placeId);
        if (details) {
            setIsProgrammaticInput(true);
            setInput(details.name);
            setSuggestions([]);
            onSelect(details);
        }
        setOpenDropdown(false);
    };
    return (_jsx("div", { className: `${className}`, children: _jsxs("div", { style: {
                position: "relative",
                left: 0,
                textAlign: "left",
                width: "100%",
            }, children: [_jsx("input", { role: "combobox", "aria-expanded": openDropdown, "aria-autocomplete": "list", "aria-controls": "autocomplete-list", className: "new_place_select_input", style: {
                        textAlign: "left",
                        width: "100%",
                    }, value: input, onChange: (e) => handleInputChange(e.target.value), onBlur: () => setOpenDropdown(false), onFocus: () => setOpenDropdown(true), onKeyDown: (e) => e.key === "Enter" && e.preventDefault(), placeholder: placeholder }), openDropdown && suggestionLoading ? (_jsx("div", { className: "new_place_select_dropdown", style: {
                        position: "absolute",
                        minWidth: "300px",
                        width: "100%",
                        zIndex: 9999,
                        left: "auto",
                        background: "#fff",
                        border: "1px solid #cecece",
                    }, children: _jsx("div", { style: { fontSize: "14px" }, children: customLoader }) })) : (suggestions.length > 0 && (_jsx("div", { className: "new_place_select_dropdown", style: {
                        position: "absolute",
                        // minWidth: "300px",
                        width: "100%",
                        zIndex: 9999,
                    }, children: _jsx("ul", { style: { listStyle: "none", padding: 0, marginTop: 4 }, children: suggestions.map(({ placePrediction: place }) => (_jsx("li", { onMouseDown: (e) => {
                                e.stopPropagation();
                                handleSelect(place?.placeId);
                            }, style: {
                                padding: "6px 8px",
                                border: "1px solid #ddd",
                                cursor: "pointer",
                                background: "white",
                            }, children: renderSuggestion
                                ? renderSuggestion(place)
                                : place?.text?.text }, place?.placeId))) }) })))] }) }));
};
