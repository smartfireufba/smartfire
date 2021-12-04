
package com.example.smartfireufba;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.location.Location;
import android.location.LocationManager;
import android.media.Image;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

public class Home extends AppCompatActivity {

    MapView mapView;
    CardView salvar;
    EditText comentar;
    ImageView image, cameraImagem;
    Intent intent;
    Date lastDenuncia = null;
    Dialog myDialog;
    Location location, IncendioLocation = null;
    CheckBox checkBox;
    String message, comentario = "Sem Comentários";
    ModuloImagem moduloImagem;

    @SuppressLint("SimpleDateFormat")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        myDialog = new Dialog(this);
        createPopup();
        image = findViewById(R.id.image);
        intent = getIntent();
        location = intent.getParcelableExtra("location");
        if(location == null){
            Toast.makeText(this, "Não foi possível encontrar a sua localização, tentando novamente!",Toast.LENGTH_LONG).show();
            startActivity(new Intent(this, LoadingScreen.class));
            finish();
        }

        if(isConnected()){
            Toast.makeText(this,"Verifique a sua conexão com a Internet!.",Toast.LENGTH_LONG).show();
        }

        String strLastDenuncia = ReadLastDenunciaOnSharedPreferences(Home.this);
        if(!strLastDenuncia.equals("")) {
            try {
                lastDenuncia = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss").parse(strLastDenuncia);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            Date today = new Date();
            long diff =  lastDenuncia.getTime() - today.getTime();
            int hours = (int) (diff / (1000 * 60 * 60));
            Log.i("StrLastDenuncia",strLastDenuncia);
            Log.i("Today",today.toString());
            Log.i("Hours",hours+" horas");
            /*if(hours<2){
                Toast.makeText(this,"Você já denunciou um Incêndio, estamos tomando as medidas cabíveis.",Toast.LENGTH_LONG).show();
                finish();
            }*/
        }


        salvar.setOnClickListener(v -> {
            if(isConnected()){
                Toast.makeText(this,"Verifique a sua conexão com a Internet!.",Toast.LENGTH_LONG).show();
                return;
            }
            if(!comentar.getText().toString().trim().isEmpty()) comentario = comentar.getText().toString().trim();
            if(checkBox.isChecked()) message = "A localização do incêncio corresponde à localização marcada no mapa?";
            else{message = "A localização do incêncio corresponde à sua localização?";}
            AlertDialog.Builder builder = new AlertDialog.Builder(Home.this);
            builder.setCancelable(true);
            builder.setTitle("Confirmar Denúncia?");
            builder.setMessage(message);
            builder.setPositiveButton("SIM",
                    (dialog, which) -> {
                        String uuid = UUID.randomUUID().toString();
                        if(moduloImagem.ImageCheck && IncendioLocation == null) moduloImagem.uploadImagetoFirebase(uuid,location,comentario);
                        else if(moduloImagem.ImageCheck && IncendioLocation != null) moduloImagem.uploadImagetoFirebase(uuid,IncendioLocation,comentario);
                        else {
                            DatabaseReference ref = FirebaseDatabase.getInstance().getReference().child("aplicativo");
                            String date = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
                            String hora = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
                            HashMap<String, Object> cadastroApp = new HashMap<>();
                            cadastroApp.put("comentario", comentario);
                            cadastroApp.put("data", date);
                            cadastroApp.put("hora", hora);
                            cadastroApp.put("tel", ReadPhoneOnSharedPreferences(Home.this));
                            if(IncendioLocation == null) {
                                cadastroApp.put("lat", location.getLatitude());
                                cadastroApp.put("lng", location.getLongitude());
                            }else{
                                cadastroApp.put("lat", IncendioLocation.getLatitude());
                                cadastroApp.put("lng", IncendioLocation.getLongitude());
                            }
                            cadastroApp.put("status", "ON");
                            ref.child(uuid).setValue(cadastroApp).addOnSuccessListener(aVoid -> {
                                SaveLastDenunciaOnSharedPreferences(Home.this, date + " " + hora);
                                Toast.makeText(getApplicationContext(), "Denúncia salva com sucesso!", Toast.LENGTH_LONG).show();
                                myDialog.dismiss();
                                finish();
                            }).addOnFailureListener(e -> Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show());
                        }
                    });
            builder.setNegativeButton("NÃO", (dialog, which) -> {

            });

            AlertDialog dialog = builder.create();
            dialog.show();
        });
        image.setOnClickListener(v -> {
            if (isConnected()) {
                Toast.makeText(this, "Verifique a sua conexão com a Internet!.", Toast.LENGTH_LONG).show();
                return;
            }
            showPopup();
            /*Intent intent = new Intent(this,MapActivity.class);
            intent.putExtra("location", location);
            startActivity(intent);*/
        });

    }

    boolean isConnected(){
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo wifiConn = connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
        NetworkInfo mobileConn = connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
        return (wifiConn == null || !wifiConn.isConnected()) && (mobileConn == null || !mobileConn.isConnected());
    }

    static public void SaveLastDenunciaOnSharedPreferences(Context context, String data) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("session", MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("lastDenuncia", data);
        editor.apply();
        editor.commit();
    }
    static public String ReadPhoneOnSharedPreferences(Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("session", MODE_PRIVATE);
        return sharedPreferences.getString("session_user", "-1");
    }

    static public String ReadLastDenunciaOnSharedPreferences(Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("session", MODE_PRIVATE);
        return sharedPreferences.getString("lastDenuncia", "");
    }

    private void createPopup(){
        myDialog.setContentView(R.layout.activity_pop_up_incendio);
        mapView = (MapView) myDialog.findViewById(R.id.mapViewPopup);
        cameraImagem = (ImageView) myDialog.findViewById(R.id.cameraImagem);
        CardView cardView = (CardView) myDialog.findViewById(R.id.cardView);
        TextView textoCardFoto = (TextView) myDialog.findViewById(R.id.textoCardFoto);
        moduloImagem = new ModuloImagem(this,cardView,textoCardFoto,cameraImagem, myDialog);
        salvar = (CardView) myDialog.findViewById(R.id.salvar);
        comentar = (EditText) myDialog.findViewById(R.id.comentar);
        ImageView closeBtn;
        TextView textView;
        checkBox = (CheckBox) myDialog.findViewById(R.id.checkbox);
        textView = (TextView) myDialog.findViewById(R.id.textView);
        closeBtn = (ImageView) myDialog.findViewById(R.id.closeBtn);

        textView.setOnClickListener(v -> {
            if(!checkBox.isChecked()) {
                checkBox.setChecked(true);
                showMapPopup(checkBox);
            }else{
                checkBox.setChecked(false);
                IncendioLocation = null;
                mapView.setVisibility(View.GONE);
            }
        });
        checkBox.setOnClickListener(v -> {
            if(checkBox.isChecked())showMapPopup(checkBox);
            else{
                mapView.setVisibility(View.GONE);
                IncendioLocation = null;
            }
        });
        closeBtn.setOnClickListener(v -> myDialog.cancel());
        //myDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
    }
    private void showPopup(){
        myDialog.show();
    }

    private void showMapPopup(CheckBox checkBox){
        AlertDialog.Builder builder = new AlertDialog.Builder(Home.this);
        builder.setCancelable(true);
        builder.setTitle("Posição do Incêndio");
        builder.setMessage("É possível determinar a localização do Incêndio em um mapa?");
        builder.setPositiveButton("SIM",
                (dialog, which) -> {
                    Intent intent = new Intent(this,MapActivity.class);
                    intent.putExtra("location", location);
                    startActivityForResult(intent,5000);
                });
        builder.setNegativeButton("NÃO", (dialog, which) -> {
            Toast.makeText(getApplicationContext(), "A localização do incêndio será determinada a partir de sua localização atual!",Toast.LENGTH_LONG).show();
            IncendioLocation = null;
            checkBox.setChecked(false);
        });
        builder.setOnCancelListener(dialog -> {
            Toast.makeText(getApplicationContext(), "A localização do incêndio será determinada a partir de sua localização atual!",Toast.LENGTH_LONG).show();
            IncendioLocation = null;
            checkBox.setChecked(false);
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == 5000) {
            if (resultCode == Activity.RESULT_OK) {
                Bundle bundle = data.getParcelableExtra("bundle");
                LatLng ny = bundle.getParcelable("latlng");
                IncendioLocation = new Location (LocationManager.GPS_PROVIDER);
                IncendioLocation.setLatitude(ny.latitude);
                IncendioLocation.setLongitude(ny.longitude);
                if(IncendioLocation == null) Log.i("HOME","INCENDIO LOCATION NULL");
                else{Log.i("HOME","INCENDIO LOCATION NOT NULL");}
                MarkerOptions startMarker = new MarkerOptions();
                startMarker.title("Local do Incêndio!");
                startMarker.position(ny);
                MapsInitializer.initialize(this);
                mapView.onCreate(myDialog.onSaveInstanceState());
                mapView.onResume();
                mapView.getMapAsync(googleMap -> {
                    googleMap.setMinZoomPreference(14);
                    googleMap.addMarker(startMarker);
                    googleMap.moveCamera(CameraUpdateFactory.newLatLng(ny));
                });
                mapView.setVisibility(View.VISIBLE);
            }else{
                checkBox.setChecked(false);
                IncendioLocation = null;
            }
        }else{
            moduloImagem.getResult(requestCode, resultCode, data);
        }
    }
}