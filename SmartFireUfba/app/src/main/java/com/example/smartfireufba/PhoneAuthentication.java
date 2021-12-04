package com.example.smartfireufba;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.FirebaseException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthOptions;
import com.google.firebase.auth.PhoneAuthProvider;

import java.util.concurrent.TimeUnit;


public class PhoneAuthentication extends AppCompatActivity {

    EditText code;
    ImageView confirm;
    TextView Warning, countDown;
    ProgressBar progressBar;
    FirebaseAuth auth;
    String verificationId;
    Intent intent;
    User user = new User();
    CountDownTimer countdowntimer = null;

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_phone_authentication);

        code = findViewById(R.id.code);
        confirm = findViewById(R.id.confirm);
        Warning = findViewById(R.id.warning);
        countDown = findViewById(R.id.countDown);
        progressBar = findViewById(R.id.progressBar);

        if(isConnected()){
            Toast.makeText(getApplicationContext(), "Verifique a sua conexão com a Internet!", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        intent = getIntent();
        user.setPhone(intent.getStringExtra("phone"));
        Log.i("PHONE",user.getPhone());
        callMessageToken(user.getPhone());

        code.setOnKeyListener((v, keyCode, event) -> {
            // If the event is a key-down event on the "enter" button
            if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                // Perform action on key press
                if (code.getText().toString().trim().isEmpty()) {
                    Warning.setVisibility(View.VISIBLE);
                    Warning.setText("Insira o código!");
                    Toast.makeText(getApplicationContext(), "Insira o código!", Toast.LENGTH_LONG).show();
                } else if (code.getText().toString().trim().length() > 6) {
                    Warning.setVisibility(View.VISIBLE);
                    Warning.setText("O código possui 6 caracteres!");
                    Toast.makeText(getApplicationContext(), "O código possui 6 caracteres!", Toast.LENGTH_LONG).show();
                } else {
                    verifyCode(code.getText().toString().trim());
                    return true;
                }
            }
            return false;
        });
        confirm.setOnClickListener(v -> {
            if(code.getText().toString().trim().isEmpty()){
                Warning.setVisibility(View.VISIBLE);
                Warning.setText("Insira o código!");
                Toast.makeText(getApplicationContext(),"Insira o código!",Toast.LENGTH_LONG).show();
            }else if(code.getText().toString().trim().length()>6){
                Warning.setVisibility(View.VISIBLE);
                Warning.setText("O código possui 6 caracteres!");
                Toast.makeText(getApplicationContext(),"O código possui 6 caracteres!",Toast.LENGTH_LONG).show();
            }else{
                verifyCode(code.getText().toString().trim());
            }
        });
    }

    private void callMessageToken(String phone){
        // Whenever verification is triggered with the whitelisted number,
        // provided it is not set for auto-retrieval, onCodeSent will be triggered.
        auth = FirebaseAuth.getInstance();
        PhoneAuthOptions options = PhoneAuthOptions.newBuilder(auth)
                .setPhoneNumber(phone)
                .setTimeout(120L, TimeUnit.SECONDS)
                .setActivity(this)
                .setCallbacks(new PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                    @Override
                    public void onCodeSent(@NonNull String s,
                                           @NonNull PhoneAuthProvider.ForceResendingToken forceResendingToken) {
                        // Save the verification id somewhere
                        // ...
                        verificationId = s;
                        Log.i("tag","verified");
                        startTimer();

                        // The corresponding whitelisted code above should be used to complete sign-in.
                        //PhoneAuthentication.this.enableUserManuallyInputCode();
                    }

                    @Override
                    public void onVerificationCompleted(@NonNull PhoneAuthCredential phoneAuthCredential) {
                        // Sign in with the credential
                        // ...
                        String code = phoneAuthCredential.getSmsCode();
                        if(code != null){
                            verifyCode(code);
                        }
                    }

                    @Override
                    public void onVerificationFailed(@NonNull FirebaseException e) {
                        // ...
                        Toast.makeText(getApplicationContext(),e.getMessage(),Toast.LENGTH_LONG).show();
                        finish();
                    }
                })
                .build();
        PhoneAuthProvider.verifyPhoneNumber(options);
    }

    private void verifyCode(String code){
        PhoneAuthCredential credential = PhoneAuthProvider.getCredential(verificationId, code);
        signInWithCredential(credential);
    }

    private void signInWithCredential(PhoneAuthCredential credential) {
        auth.signInWithCredential(credential).addOnCompleteListener(task -> {
            if(task.isSuccessful()){
                SessionManagement sessionManagement = new SessionManagement(this);
                sessionManagement.saveSession(user);
                moveToMainActivity();
            }else{
                Toast.makeText(getApplicationContext(),task.getException().getMessage(),Toast.LENGTH_LONG).show();
            }
        });
    }

    private void moveToMainActivity() {
        Intent intent = new Intent(this, LoadingScreen.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK|Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    void startTimer(){
        Log.i("TAG", "Starting timer...");

        countdowntimer = new CountDownTimer(120000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {

                progressBar.setVisibility(View.INVISIBLE);
                long time = millisUntilFinished / 1000;
                String timeText = "O código vale por: " + time + "s...";
                countDown.setText(timeText);
                //Log.i(TAG, "Countdown seconds remaining: " + millisUntilFinished / 1000);
            }

            @Override
            public void onFinish() {
                Log.i("TAG", "Timer finished");
                Toast.makeText(getApplicationContext(),"O código expirou, tente novamente!",Toast.LENGTH_LONG).show();
                finish();
            }
        };

        countdowntimer.start();
    }

    boolean isConnected(){
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo wifiConn = connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI);
        NetworkInfo mobileConn = connectivityManager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
        return (wifiConn == null || !wifiConn.isConnected()) && (mobileConn == null || !mobileConn.isConnected());
    }

    @Override
    public void onDestroy() {
        if(countdowntimer!=null) countdowntimer.cancel();
        Log.i("TAG", "Timer cancelled");
        super.onDestroy();
    }
}

/*private void callSafetyNet(){
    /* CHECAR SE O DISPOSITIVO MÓVEL TEM ACESSO A VERSÃO MAIS RECENTE DO GOOGLE PLAY SERVICES
    if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(PhoneAuthentication.this) == ConnectionResult.SUCCESS) {
        // The SafetyNet Attestation API is available.
        Log.i("GOOGLEPLAY","Connected");

    } else {
        // Prompt user to update Google Play services.
        Log.i("GOOGLEPLAY","NOT Connected");
    }

    private static byte[] getRequestNonce() {
        String data = String.valueOf(System.currentTimeMillis());
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byte[] bytes = new byte[24];
        Random random = new Random();
        random.nextBytes(bytes);
        try {
            byteStream.write(bytes);
            byteStream.write(data.getBytes());
        }catch (IOException e) {
            return null;
        }
        return byteStream.toByteArray();
    }*/

    /*SafetyNet.getClient(this).attest(getRequestNonce(), "AIzaSyBT2rTXNIMQRK5ERrFhAJjnNO5aVa7r98k")
            .addOnSuccessListener(this,
                    new OnSuccessListener<SafetyNetApi.AttestationResponse>() {
                        @Override
                        public void onSuccess(SafetyNetApi.AttestationResponse response) {
                             Indicates communication with the service was successful.
                             Use response.getJwsResult() to get the result data.
                            Log.i("SAFETYNET","SUCCESS");
                            String jwsResult = response.getJwsResult();
                        }
                    })
            .addOnFailureListener(this, new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                     An error occurred while communicating with the service.
                    Log.i("SAFETYNET",e.getMessage());
                }
            });


    SafetyNet.getClient(this).verifyWithRecaptcha("AIzaSyBT2rTXNIMQRK5ERrFhAJjnNO5aVa7r98k")
            .addOnSuccessListener((Executor) this,
                    new OnSuccessListener<SafetyNetApi.RecaptchaTokenResponse>() {
                        @Override
                        public void onSuccess(SafetyNetApi.RecaptchaTokenResponse response) {
                            // Indicates communication with reCAPTCHA service was
                            // successful.
                            String userResponseToken = response.getTokenResult();
                            if (!userResponseToken.isEmpty()) {
                                // Validate the user response token using the
                                // reCAPTCHA siteverify API.
                            }
                        }
                    })
            .addOnFailureListener((Executor) this, new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    if (e instanceof ApiException) {
                        // An error occurred when communicating with the
                        // reCAPTCHA service. Refer to the status code to
                        // handle the error appropriately.
                        ApiException apiException = (ApiException) e;
                        int statusCode = apiException.getStatusCode();
                        Log.d("TAG", "Error: " + CommonStatusCodes
                                .getStatusCodeString(statusCode));
                    } else {
                        // A different, unknown type of error occurred.
                        Log.d("TAG", "Error: " + e.getMessage());
                    }
                }
            });
}*/