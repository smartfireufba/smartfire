package com.example.smartfireufba;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.BitmapCompat;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

public class ExibirImagem extends AppCompatActivity {

    ImageView imagem;
    Intent intent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_exibir_imagem);

        imagem = findViewById(R.id.imagem);
        intent = getIntent();
        String path = intent.getStringExtra("path");
        Bitmap bmImg = BitmapFactory.decodeFile(path);
        try {
            ExifInterface exif = new ExifInterface(path);
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);
            Log.d("EXIF", "Exif: " + orientation);
            Matrix matrix = new Matrix();
            if (orientation == 6) {
                matrix.postRotate(90);
            }
            else if (orientation == 3) {
                matrix.postRotate(180);
            }
            else if (orientation == 8) {
                matrix.postRotate(270);
            }
            bmImg = Bitmap.createBitmap(bmImg, 0, 0, bmImg.getWidth(), bmImg.getHeight(), matrix, true); // rotating bitmap
        }
        catch (Exception e) {
            Log.i("TAG",e.getMessage());
            finish();
        }
        imagem.setImageBitmap(bmImg);
        Log.i("ImageSize", BitmapCompat.getAllocationByteCount(bmImg)+"");
    }
}
