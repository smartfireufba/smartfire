package com.example.smartfireufba;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PersistableBundle;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

public class MapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private MapView mapView;
    Intent intent;
    Location location;
    Handler handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        mapView = findViewById(R.id.mapView);
        intent = getIntent();
        location = intent.getParcelableExtra("location");
        handler = new Handler(Looper.getMainLooper());

        if (checkGooglePlayServices()) {
            mapView.getMapAsync(this);
            mapView.onCreate(savedInstanceState);
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(MapActivity.this);
        builder.setCancelable(true);
        builder.setTitle("Instruções!");
        builder.setMessage("A sua localização atual já está marcada no mapa, marque a posição correspondente ao incêndio. Se não houver dúvidas, prossiga!");
        builder.setPositiveButton("OK",
                (dialog, which) -> {
                });
        builder.setNegativeButton("Cancelar", (dialog, which) -> {
            Intent data = new Intent();
            setResult(RESULT_CANCELED,data);
            finish();
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    protected void onStart() {
        super.onStart();
        mapView.onStart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mapView.onStop();
    }
    @Override
    protected void onPause() {
        mapView.onPause();
        super.onPause();
    }
    @Override
    protected void onDestroy() {
        mapView.onDestroy();
        super.onDestroy();
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState, @NonNull PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
        mapView.onSaveInstanceState(outState);
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        mapView.onLowMemory();
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        googleMap.setMinZoomPreference(15);
        LatLng ny = new LatLng(location.getLatitude(), location.getLongitude());
        MarkerOptions startMarker = new MarkerOptions();
        startMarker.title("Sua Posição!");
        startMarker.position(ny);
        googleMap.addMarker(startMarker);
        googleMap.moveCamera(CameraUpdateFactory.newLatLng(ny));

        googleMap.setOnMapClickListener(latLng -> {

            // Creating a marker
            MarkerOptions markerOptions = new MarkerOptions();

            // Setting the position for the marker
            markerOptions.position(latLng);

            // Setting the title for the marker.
            // This will be displayed on taping the marker
            markerOptions.title("Posição do Incêndio!");

            // Clears the previously touched position
            googleMap.clear();

            // Animating to the touched position
            googleMap.animateCamera(CameraUpdateFactory.newLatLng(latLng));

            // Placing a marker on the touched position
            googleMap.addMarker(markerOptions);

            handler.postDelayed(() -> showConfirmPopup(latLng), 2000);
        });
    }

    private boolean checkGooglePlayServices(){
        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int result = googleApiAvailability.isGooglePlayServicesAvailable(this);
        if(result == ConnectionResult.SUCCESS) return true;
        else if (googleApiAvailability.isUserResolvableError(result)){
            Dialog dialog = googleApiAvailability.getErrorDialog(this, result, 201, dialog1 -> Toast.makeText(MapActivity.this, "User Cancelled Dialog", Toast.LENGTH_LONG).show());
            dialog.show();
        }
        return false;
    }

    private void showConfirmPopup(LatLng latlng){
        AlertDialog.Builder builder = new AlertDialog.Builder(MapActivity.this);
        builder.setCancelable(true);
        builder.setTitle("Posição do Incêndio");
        builder.setMessage("A sua localização do incêndio corresponde a localização marcada no mapa?");
        builder.setPositiveButton("SIM",
                (dialog, which) -> {
                    Intent data = new Intent();
                    Bundle args = new Bundle();
                    args.putParcelable("latlng",latlng);
                    data.putExtra("bundle",args);
                    setResult(RESULT_OK,data);
                    finish();
                });
        builder.setNegativeButton("NÃO", (dialog, which) -> {
            Toast.makeText(getApplicationContext(), "Clique na posição correspondente à localização do Incêndio!",Toast.LENGTH_LONG).show();
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

}