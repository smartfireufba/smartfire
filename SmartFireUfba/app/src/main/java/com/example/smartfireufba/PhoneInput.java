package com.example.smartfireufba;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class PhoneInput extends AppCompatActivity {

    EditText phone;
    Handler handler;
    ImageView confirm;
    TextView phoneWarning;
    List<String> listPermissionsNeeded;
    public static final int REQUEST_ID_MULTIPLE_PERMISSIONS = 1;

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_phone_input);

        phone = findViewById(R.id.phone);
        confirm = findViewById(R.id.confirm);
        phoneWarning = findViewById(R.id.phoneWarning);

        checkAndRequestPermissions();

        handler = new Handler(Looper.getMainLooper());
        confirm.setOnClickListener(v -> {
            if(phone.getText().toString().trim().isEmpty()){
                Toast.makeText(this,"Preencha um número de Telefone",Toast.LENGTH_LONG).show();
                phoneWarning.setText("Preencha um número\nde Telefone");
                phoneWarning.setVisibility(View.VISIBLE);
            }else if(!phone.getText().toString().trim().startsWith("71")){
                Toast.makeText(this,"O número deve começar com o DDD ex: 71993454569",Toast.LENGTH_LONG).show();
                phoneWarning.setText("O número deve começar com o DDD\nex: 71993454569");
                phoneWarning.setVisibility(View.VISIBLE);
            }else if(phone.getText().toString().trim().length()!=11){
                Toast.makeText(this,"O número deve conter 11 caracteres com o DDD ex: 71993454569",Toast.LENGTH_LONG).show();
                phoneWarning.setText("O número deve conter 11 caracteres\ncom o DDD ex: 71993454569");
                phoneWarning.setVisibility(View.VISIBLE);
            }else{
                Intent intent = new Intent(PhoneInput.this,PhoneAuthentication.class);
                intent.putExtra("phone","+55"+phone.getText().toString().trim());
                startActivity(intent);
            }
        });
    }

    private void checkAndRequestPermissions() {
        int locationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION);
        listPermissionsNeeded = new ArrayList<>();
        if (locationPermission != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        locationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION);
        if (locationPermission != PackageManager.PERMISSION_GRANTED) {
            listPermissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, listPermissionsNeeded.toArray(new String[0]),REQUEST_ID_MULTIPLE_PERMISSIONS);
        }

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if(requestCode==1){
            if(ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
               ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                for (int grantResult : grantResults) {
                    if (grantResult == -1) {
                        Toast.makeText(this, "Sem as permissões o aplicativo não pode funcionar!", Toast.LENGTH_LONG).show();
                        handler.postDelayed(this::checkAndRequestPermissions, 2000);
                        break;
                    }
                }
            }
        }
    }
}