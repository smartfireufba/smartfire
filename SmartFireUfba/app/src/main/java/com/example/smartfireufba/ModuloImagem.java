package com.example.smartfireufba;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.location.Location;
import androidx.exifinterface.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.SystemClock;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.content.FileProvider;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;

@SuppressLint("Registered")
public class ModuloImagem extends AppCompatActivity {

    private static final int PERMISSION_CODE = 1003;
    private static final int MY_CAMERA_PERMISSION_CODE = 1002;
    private static final int IMAGE_PICK_CAMERA_CODE = 1001;
    private static final int IMAGE_PICK_CODE = 1000;
    Bitmap bmImg;
    CardView SelectCard;
    TextView SelectButton;
    ImageView Imagem;
    Boolean ImageCheck = false;
    String path, extension;
    Uri mImageUri;
    Activity myActivity;
    Dialog myDialog;
    private long mLastClickTime = 0;

    public ModuloImagem(final Activity myactivity, CardView selectcard, TextView selectbutton, ImageView imagem, Dialog mydialog){

        myDialog = mydialog;
        SelectCard  = selectcard;
        SelectButton = selectbutton;
        Imagem = imagem;
        this.myActivity = myactivity;

        Imagem.setOnClickListener(v -> {
            if (SystemClock.elapsedRealtime() - mLastClickTime < 1000){
                return;
            }
            mLastClickTime = SystemClock.elapsedRealtime();
            Intent intent = new Intent(myActivity,ExibirImagem.class);
            intent.putExtra("path",path);
            myActivity.startActivity(intent);
        });
        selectcard.setOnClickListener (v -> {
            if (SystemClock.elapsedRealtime() - mLastClickTime < 1000){
                return;
            }
            mLastClickTime = SystemClock.elapsedRealtime();
            AlertDialog.Builder builder = new AlertDialog.Builder(myActivity);
            builder.setCancelable(true);
            builder.setTitle("Carregar Imagem");
            builder.setMessage("Selecione de onde deseja Carregar a Imagem!");
            builder.setPositiveButton("Galeria", (dialog, which) -> {
                //Check runtime permission
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                    if (myactivity.checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED){
                        //permission not granted, request it.
                        String[] permissions = {Manifest.permission.READ_EXTERNAL_STORAGE};
                        //show popup for runtime permission.
                        myactivity.requestPermissions(permissions, PERMISSION_CODE);
                    }else{
                        //permission already granted.
                        pickImageFromGallery(myactivity);
                    }
                }else{
                    //system OS is less then API 23.
                    pickImageFromGallery(myactivity);
                }
            });
            builder.setNegativeButton("Câmera", (dialog, which) -> {
                //Check runtime permission
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                    if (myactivity.checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED){
                        Log.i("ModuloImagem","Camera3");
                        //permission not granted, request it.
                        String[] permissions = {Manifest.permission.CAMERA};
                        //show popup for runtime permission.
                        myActivity.requestPermissions(permissions, MY_CAMERA_PERMISSION_CODE);
                    }else{
                        //permission already granted.
                        pickImageFromCamera(myactivity);
                    }
                }else{
                    //system OS is less then API 23.
                    pickImageFromCamera(myactivity);
                }
            });
            AlertDialog dialog = builder.create();
            dialog.show();
        });
    }

    private void pickImageFromCamera(Activity myactivity) {
        Log.i("ModuloImagem","pickImageFromCamera");
        //intent to pick image.
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        File photoFile = null;
        try {
            photoFile = createImageFile();
        } catch (IOException ex) {
            // Error occurred while creating the File
        }
        // Continue only if the File was successfully created
        if (photoFile != null) {
            Uri photoURI = FileProvider.getUriForFile(myactivity,
                    "com.example.smartfireufba.provider",
                    photoFile);
            takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
        }
        myactivity.startActivityForResult(takePictureIntent, IMAGE_PICK_CAMERA_CODE);
    }

    private void pickImageFromGallery(Activity myactivity) {
        //intent to pick image.
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType("image/*");
        myactivity.startActivityForResult(intent, IMAGE_PICK_CODE);
    }

    @SuppressLint("SetTextI18n")
    protected void getResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (resultCode == RESULT_OK && requestCode == IMAGE_PICK_CODE && data != null && data.getData() != null) {
            //set image to data bank
            mImageUri = data.getData();
            path = getRealPathFromURI(mImageUri);
            Log.i("CAMINHO",path);
            extension = path.substring(path.lastIndexOf("."));
            Log.i("EXTENSION", extension);
            ImageCheck = true;
            if(SelectButton != null) {
                SelectButton.setText("Trocar Imagem");
            }
            ExibirImagem(path, Imagem);
            Imagem.setVisibility(View.VISIBLE);
        }else if (resultCode == RESULT_OK && requestCode == IMAGE_PICK_CAMERA_CODE) {
            ImageCheck = true;
            extension = path.substring(path.lastIndexOf("."));
            Log.i("EXTENSION", extension);
            if(SelectButton != null) {
                SelectButton.setText("Trocar Imagem");
            }
            Log.i("PATH",path);
            ExibirImagem(path, Imagem);
            Imagem.setVisibility(View.VISIBLE);
            mImageUri = Uri.fromFile(new File(path));
        }
    }


    public void ExibirImagem (String PATH, ImageView ImageProfile){
        File ImageProfileStorage = new File(PATH);
        long length = ImageProfileStorage.length();
        length = length/1024;
        System.out.println("File Path : " + ImageProfileStorage.getPath() + ", File size : " + length +" KB");
        /*if(ImageProfileStorage.exists()){
            Bitmap myBitmap = BitmapFactory.decodeFile(ImageProfileStorage.getAbsolutePath());
            ImageProfile.setImageBitmap(myBitmap);
        }*/
        /*if (ImageProfileStorage.exists()){
            Bitmap bmImg = BitmapFactory.decodeFile(PATH);
            ImageProfile.setImageBitmap(bmImg);
        } else {
            ImageProfile.setVisibility(View.GONE);
        }*/

        if (ImageProfileStorage.exists()){
            bmImg = BitmapFactory.decodeFile(PATH);
            try {
                ExifInterface exif = new ExifInterface(PATH);
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
            }
            ImageProfile.setImageBitmap(bmImg);
        } else {
            ImageProfile.setVisibility(View.GONE);
        }
    }

    private String getRealPathFromURI(Uri contentURI) {
        if(Build.VERSION.SDK_INT <=23) {
            String result;
            Cursor cursor = getContentResolver().query(contentURI, null, null, null, null);
            if (cursor == null) { // Source is Dropbox or other similar local file path
                result = contentURI.getPath();
            } else {
                cursor.moveToFirst();
                int idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA);
                result = cursor.getString(idx);
                cursor.close();
            }
            return result;
        }else{
            String yourRealPath = null;
            String[] filePathColumn = {MediaStore.Images.Media.DATA};
            Cursor cursor = myActivity.getContentResolver().query(contentURI, filePathColumn, null, null, null);
            if(cursor.moveToFirst()){
                int columnIndex = cursor.getColumnIndex(filePathColumn[0]);
                yourRealPath = cursor.getString(columnIndex);
            }
            //else: boooo, cursor doesn't have rows ...
            cursor.close();
            return yourRealPath;
        }
    }

    private File createImageFile() throws IOException {
        // Create an image file name
        @SuppressLint("SimpleDateFormat") String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = myActivity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File image = File.createTempFile(
                imageFileName,  /* prefix */
                ".jpg",         /* suffix */
                storageDir      /* directory */
        );

        // Save a file: path for use with ACTION_VIEW intents
        path = image.getAbsolutePath();
        Log.i("currentPhotoPath",path);
        return image;
    }

    public void uploadImagetoFirebase(String uuid, Location location, String comentario){
        StorageReference StorageRef = FirebaseStorage.getInstance ().getReference ().child("aplicativo").child(uuid);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bmImg.compress(Bitmap.CompressFormat.JPEG, 25, baos);
        byte[] data = baos.toByteArray();
        //uploading the image
        UploadTask uploadTask2 = StorageRef.putBytes(data);
        uploadTask2.addOnSuccessListener(taskSnapshot -> {
                    DatabaseReference ref = FirebaseDatabase.getInstance().getReference().child("aplicativo");
                    String date = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
                    String hora = new SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(new Date());
                    HashMap<String, Object> cadastroApp = new HashMap<>();
                    cadastroApp.put("comentario", comentario);
                    cadastroApp.put("data", date);
                    cadastroApp.put("hora", hora);
                    cadastroApp.put("tel", Home.ReadPhoneOnSharedPreferences(myActivity));
                    cadastroApp.put("lat", location.getLatitude());
                    cadastroApp.put("lng", location.getLongitude());
                    cadastroApp.put("status", "ON");
                    ref.child(uuid).setValue(cadastroApp).addOnSuccessListener(aVoid -> {
                        Home.SaveLastDenunciaOnSharedPreferences(myActivity, date + " " + hora);
                        Toast.makeText(myActivity, "Denúncia salva com sucesso!", Toast.LENGTH_LONG).show();
                        myDialog.dismiss();
                        myActivity.finish();
                    }).addOnFailureListener(e -> Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show());
                })
                .addOnFailureListener(e -> Toast.makeText(myActivity, "Upload Failed -> " + e.getMessage(), Toast.LENGTH_LONG).show());
    }
}

