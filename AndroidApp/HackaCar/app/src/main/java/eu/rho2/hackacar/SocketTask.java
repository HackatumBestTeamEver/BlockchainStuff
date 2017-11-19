package eu.rho2.hackacar;

import android.os.AsyncTask;
import android.util.Log;


import com.akexorcist.roundcornerprogressbar.RoundCornerProgressBar;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.mikhaellopez.circularprogressbar.CircularProgressBar;
import com.xw.repo.BubbleSeekBar;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.lang.ref.WeakReference;
import java.net.Socket;
import java.util.List;

/**
 * Created by rho2 on 18.11.17.
 */
public class SocketTask extends AsyncTask<Void, String, Void> {

    BubbleSeekBar seekbar;
    CircularProgressBar cpb, ang;
    RoundCornerProgressBar rcpb;

    private String ip;

    public SocketTask(String ip, BubbleSeekBar seekbar,CircularProgressBar cpb, CircularProgressBar ang, RoundCornerProgressBar rcpb ) {

        this.ip = ip;

        this.seekbar = seekbar;
        this.cpb = cpb;
        this.ang = ang;
        this.rcpb = rcpb;

    }

    @Override
    protected Void doInBackground(Void...a) {
        String str = "";
        Log.d("TASK", "TSK");
        try {
            Socket socket = new Socket(ip, 4051);
            BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            PrintWriter pw = new PrintWriter(socket.getOutputStream(), true);

            while (true) {
                str = br.readLine();
                publishProgress(str);

            }

           //br.close();
           // pw.close();
            //socket.close();



        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    int count = 0;

    @Override
    protected void onProgressUpdate(String... values) {

            String[] ar = values[0].split(",");

            Log.d("A", values[0]);

            float t = Float.valueOf(ar[0].trim());
            float a = Float.valueOf(ar[1].trim());
            float g = Float.valueOf(ar[2].trim());
            float d = Float.valueOf(ar[3].trim());
            float s = Float.valueOf(ar[4].trim());

            seekbar.setProgress(a);
            cpb.setProgress(s);
            ang.setProgress(g);
            rcpb.setProgress(d);

            count++;




    }
}