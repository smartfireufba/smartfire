package com.example.smartfireufba;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;

public class SessionManagement {
    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;
    String SHARED_PREF_NAME = "session";
    String SESSION_KEY = "session_user";

    @SuppressLint("CommitPrefEdits")
    public SessionManagement(Context context){
        sharedPreferences = context.getSharedPreferences(SHARED_PREF_NAME, Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();

    }

    public void saveSession(User user){
        //save session of user whenever user is logged in
        String phone = user.getPhone();
        editor.putString(SESSION_KEY,phone).commit();
    }

    public String getSession(){
        //return user whose session is saved
        return sharedPreferences.getString(SESSION_KEY, "-1");
    }

    /*public void removeSession(){
        editor.putString(SESSION_KEY,"-1").commit();
    }*/
}
