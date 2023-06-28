import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./App.css";

const libraries = ["places", "directions"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

function MapComponent({ center, destination, currentLocation, directions }) {
  const directionsOptions = {
    polylineOptions: {
      strokeColor: "red",
      strokeOpacity: 1,
      strokeWeight: 6,
    },
  };

  return (
    <GoogleMap
      zoom={10}
      center={center}
      mapContainerStyle={mapContainerStyle}
    >
      {destination && <Marker position={destination} />}
      {currentLocation && <Marker position={currentLocation} />}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={directionsOptions}
        />
      )}
    </GoogleMap>
  );
}

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "API_KEY",
    libraries: libraries,
  });

  const [destination, setDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const autocompleteRef = useRef(null);

  const handleDestinationInput = (input) => {
    setDestination(input);
  };

  const handleGetDirections = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  useEffect(() => {
    if (isLoaded && !loadError) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          setDestination({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      });
    }
  }, [isLoaded, loadError]);

  const handleDirectionsCallback = (result, status) => {
    if (status === window.google.maps.DirectionsStatus.OK) {
      setDirections(result);
    } else {
      console.error("Directions request failed. Status:", status);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  const center = currentLocation || { lat: 44, lng: -80 };

  return (
    <div>
      <input
        type="text"
        placeholder="Where would you like to go?"
        onChange={(e) => handleDestinationInput(e.target.value)}
        ref={autocompleteRef}
      />
      {destination && <button onClick={handleGetDirections}>Get Directions</button>}
      <MapComponent
        center={center}
        destination={destination}
        currentLocation={currentLocation}
        directions={directions}
      />
      {currentLocation && destination && (
        <DirectionsService
          options={{
            destination: destination,
            origin: currentLocation,
            travelMode: window.google.maps.TravelMode.DRIVING,
          }}
          callback={handleDirectionsCallback}
        />
      )}
    </div>
  );
}

export default App;
