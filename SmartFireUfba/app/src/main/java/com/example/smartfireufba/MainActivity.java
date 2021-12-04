package com.example.smartfireufba;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;


public class MainActivity extends AppCompatActivity {

    @SuppressLint("SimpleDateFormat")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SessionManagement sessionManagement = new SessionManagement(this);
        String userUid = sessionManagement.getSession();

        Handler handler = new Handler(Looper.getMainLooper());
        if(!userUid.equals("-1")){
            //user uid logged in and move to main activity
            handler.postDelayed(this::moveToMainActivity, 2000);
        }else {
            handler.postDelayed(() -> startActivity(new Intent(this, PhoneInput.class)), 2000);
        }
    }

    private void moveToMainActivity() {
        Intent intent = new Intent(this, LoadingScreen.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK|Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }
}