import React from "react";
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
export declare const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps>;
export {};
