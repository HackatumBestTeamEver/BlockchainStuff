package eu.rho2.hackacar;

import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.akexorcist.roundcornerprogressbar.RoundCornerProgressBar;
import com.github.mikephil.charting.charts.PieChart;
import com.mikhaellopez.circularprogressbar.CircularProgressBar;
import com.xw.repo.BubbleSeekBar;


public class MainActivity extends AppCompatActivity {

    BubbleSeekBar seekbar;
    CircularProgressBar cpb, ang;
    RoundCornerProgressBar rcpb;
    TextView tv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        seekbar = (BubbleSeekBar)findViewById(R.id.seekbar);
        seekbar.setClickable(false);
        seekbar.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                return true;
            }
        });

        cpb = (CircularProgressBar)findViewById(R.id.circular);
        cpb.setProgress(0);

        ang = (CircularProgressBar)findViewById(R.id.angular);
        ang.setProgress(0);


        rcpb = (RoundCornerProgressBar)findViewById(R.id.roundCornerProgressBar);
        rcpb.setProgress(0);


        tv = (TextView)findViewById(R.id.editText);
    }


    public void onClick(View v){
        new SocketTask(tv.getText().toString(), seekbar, cpb,ang, rcpb).execute();
    }
}
